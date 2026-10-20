// Monitors - the live file monitor engine (the FILE-MONITOR design sections
// 3-6). The fs/observed observer (L11), the checkpoint scan (the debounce,
// the deadline, the slow schedule, the retirement - no real timers), the
// check dispatch through the SHIPPED G2 wrapper (one wrapper, two callers),
// the settle fold, the per-agent stanza part, and the enrollment bookkeeping.
//
// THE FAIL-OPEN ENVELOPE (the R3 point 7, hard): every listener path is
// wrapped - never throws into the fs/observed dispatch, the jobs events or
// the assemble waterfall; a dispatch start failure keeps the band's
// last-known result and renders STALE (the version moved); a renderer
// failure skips the stanza and logs.
//
// THE HONESTY CLUSTER (the R3 points 1/2/7, hard): a clean glyph renders
// ONLY from an observed settle with exit 0 of the exact check set for the
// exact version with provenance "live"; a settle-less version bump NEVER
// renders clean; the linked-governance check never produces a verdict.
import { basename as Base, dirname as Parent } from "node:path";
import Clock from "@Function/Clock.js";
import * as Band from "@Function/Band.js";
import * as Jobs from "@Function/Jobs.js";
import * as Storage from "@Function/Storage.js";
import * as Watchlist from "@Function/Watchlist.js";
import { INLINE_DEADLINE_MS } from "@Function/Policy.js";
import type { Log } from "@Function/Render.js";
import type State from "@Interface/State.js";
import type { CheckSetSpec, CheckResult, MonitorEntry, TailBuffer } from "@Interface/Events.js";

/** The structural fs/observed types (the factory's Wire signature, verified
 * against @deepseek-ai/dsh-fs; kept minimal - only the fields this module
 * reads). */
export type FsTarget = { displayPath?: unknown; targetKey?: unknown } | undefined;
export type FsObservation = { kind?: unknown; version?: unknown } | undefined;

/** The checkpoint phases: "event" runs the debounce dispatch and the
 * deadline scan; "assemble" adds the slow schedule and the retirement scan. */
export type Phase = "event" | "assemble";

/** The writer display of an actor: the writing exec's agent id, "-" when absent. */
const WriterOf = (Actor: object | undefined): string => {
	const Id = (Actor as { agent?: { id?: unknown } | undefined } | undefined)?.agent?.id;
	return typeof Id === "string" && Id.length > 0 ? Id : "-";
};

/** The owning agent of an observed write: the writing exec's agent id, or
 * the phase-1 unowned label. */
const AgentOf = (Actor: object | undefined): string => {
	const Id = (Actor as { agent?: { id?: unknown } | undefined } | undefined)?.agent?.id;
	return typeof Id === "string" && Id.length > 0 ? Id : "(unowned)";
};

/** Enroll (or refresh) one file in an agent's monitor set. Returns the entry. */
export const Enroll = (
	State: State,
	AgentId: string,
	Path: string,
	PathKey: string,
	Writer: string,
	Sets: string[],
	Version: string,
	Append: Log,
): MonitorEntry => {
	const Now = Clock(State);
	const PerAgent = State.Monitors.get(AgentId) ?? new Map<string, MonitorEntry>();
	State.Monitors.set(AgentId, PerAgent);
	const Existing =
		PerAgent.get(PathKey) ?? [...PerAgent.values()].find((Entry) => Entry.path === Path);
	if (Existing !== undefined) {
		// Refresh: the entry keeps its history; the check sets and the path
		// key adopt the current classification and target key.
		Existing.path = Path;
		Existing.pathKey = PathKey;
		Existing.sets = Sets;
		return Existing;
	}
	const Entry: MonitorEntry = {
		path: Path,
		pathKey: PathKey,
		agentId: AgentId,
		enrolledAt: Now,
		lastVersion: Version.length > 0 ? Version : undefined,
		lastWriter: Writer,
		lastObservedAt: undefined,
		pending: new Map(),
		sets: Sets,
		checks: [],
	};
	PerAgent.set(PathKey, Entry);
	Append(`monitor enrolled ${Path} (by ${Writer})`);
	Storage.Record(State, {
		event: "monitor-enrolled",
		path: Path,
		agent: AgentId,
		version: Version,
		writer: Writer,
		checkSetId: "",
		ranAt: Now,
		exit: null,
		infra: null,
		tail: "",
		provenance: "live",
	});
	return Entry;
};

/** L11 - the fs/observed observer (registered through the factory's Wire on
 * the ROOT context, so every write the harness emits is heard). Pure
 * observer, fail-open, NEVER throws into the dispatch. */
export const OnObserved = (
	State: State,
	Target: FsTarget,
	Observation: FsObservation,
	Actor: object | undefined,
	Append: Log,
): void => {
	try {
		if (!State.On || State.MonitorOn !== "on") {
			return;
		}
		const Path = (Target as { displayPath?: unknown } | undefined)?.displayPath;
		const PathKey = (Target as { targetKey?: unknown } | undefined)?.targetKey;
		if (
			typeof Path !== "string" ||
			Path.length === 0 ||
			typeof PathKey !== "string" ||
			PathKey.length === 0
		) {
			return;
		}
		const Version = (Observation as { version?: unknown } | undefined)?.version;
		if (typeof Version !== "string") {
			return;
		}
		const AgentId = AgentOf(Actor);
		const Writer = WriterOf(Actor);
		const Now = Clock(State);
		// The enrolled session (the check jobs' sandbox policy resolution).
		const Session = (Actor as { agent?: { session?: unknown } | undefined } | undefined)?.agent
			?.session;
		if (Session !== undefined) {
			State.MonitorSessions.set(AgentId, Session);
		}
		const PerAgent = State.Monitors.get(AgentId);
		const Entry =
			PerAgent?.get(PathKey) ??
			[...(PerAgent?.values() ?? [])].find((Candidate) => Candidate.path === Path);
		if (Entry !== undefined) {
			// The version bookkeeping: the entry updates its observed truth.
			const Previous = Entry.lastVersion;
			Entry.lastVersion = Version;
			Entry.lastWriter = Writer;
			Entry.lastObservedAt = Now;
			Entry.pathKey = PathKey;
			// The staleness notice: once per version change on an entry that
			// holds results - the band renders STALE at the next request and
			// the ledger records why.
			if (Previous !== undefined && Previous !== Version && Entry.checks.length > 0) {
				Append(`monitor stale ${Path} (version changed)`);
			}
		} else {
			// The enrollment: watchlist-gated (the R3 3.1 rule - a file that
			// matches NOTHING and is not enrolled is NEVER monitored).
			const Sets = Watchlist.AutoSets(State, AgentId, Path);
			if (Sets === undefined) {
				return;
			}
			Enroll(State, AgentId, Path, PathKey, Writer, Sets, Version, Append);
		}
		const Fresh = State.Monitors.get(AgentId)?.get(PathKey);
		if (Fresh !== undefined) {
			// The fast-check scheduling: each fast check set gets a pending
			// record; an existing pending record is OVERWRITTEN (the
			// coalescing - only the newest pending run survives). The slow
			// sets never auto-run per-edit.
			for (const SetId of Fresh.sets) {
				const Spec = State.CheckSets[SetId];
				if (Spec === undefined || Spec.link !== undefined || Spec.fast === false) {
					continue;
				}
				Fresh.pending.set(SetId, { since: Now });
			}
		}
		// The checkpoint scan: an edit whose debounce already elapsed
		// dispatches immediately.
		Scan(State, Append, "event");
	} catch {
		// Fail-open: never throws into the fs/observed dispatch.
	}
};

/** Substitute the command template's tokens (the Render.ts-style replace
 * ONLY, no eval): {{path}}, {{basename}}, {{dir}}; an unresolved token
 * renders literally and logs `render unknown <setId> <token>`. */
const Substitute = (Template: string, Path: string, SetId: string, Append: Log): string => {
	const Unknown = new Set<string>();
	const Out = Template.replace(/\{\{([^{}]+)\}\}/g, (Whole, Name: string) => {
		switch (Name) {
			case "path":
				return Path;
			case "basename":
				return Base(Path);
			case "dir":
				return Parent(Path);
			default:
				Unknown.add(Name);
				return Whole;
		}
	});
	for (const Token of Unknown) {
		Append(`render unknown ${SetId} {{${Token}}}`);
	}
	return Out;
};

/** An empty tail stub for the in-flight reservation record (the placeholder
 * never settles and is replaced or removed before any render reads it). */
const EmptyTail = (): TailBuffer => ({
	Stdout: "",
	Stderr: "",
	Append: () => undefined,
	Render: () => "",
});

/** Dispatch one check job through the SHIPPED G2 wrapper (the R3 brief
 * point 6's "one wrapper, two callers" is literal - NO second execution
 * path). Returns the job id, or undefined when the start failed (the
 * fail-open envelope: the pending record stays dropped, the band keeps its
 * last-known result and renders STALE at the next request). The dispatch
 * RESERVES one admission slot for the in-flight start (the async gap would
 * otherwise let every pending set pass the admission check at once). */
export const Dispatch = async (
	State: State,
	AgentId: string,
	Entry: MonitorEntry,
	SetId: string,
	Spec: CheckSetSpec,
	Append: Log,
): Promise<string | undefined> => {
	const At = Clock(State);
	const Seq = State.MonitorCallSeq + 1;
	State.MonitorCallSeq = Seq;
	const Command = Substitute(Spec.command ?? "", Entry.path, SetId, Append);
	const Timeout = Math.min(Spec.timeoutMs ?? State.Monitor.checkTimeoutMs, INLINE_DEADLINE_MS);
	const Placeholder = `pending-${Seq}`;
	State.MonitorJobs.set(Placeholder, {
		agentId: AgentId,
		path: Entry.path,
		pathKey: Entry.pathKey,
		setId: SetId,
		startedAt: At,
		checkedVersion: Entry.lastVersion ?? "",
		writer: Entry.lastWriter ?? "-",
		tail: EmptyTail(),
	});
	let Started: { jobId: string; tail: Jobs.JobTail };
	try {
		Started = await Jobs.Start(
			State,
			AgentId,
			{
				command: Command,
				workdir: Parent(Entry.path),
				timeoutMs: Timeout,
				kind: "monitor",
				label: Label(`monitor ${SetId} ${Entry.path}`),
				head: true,
			},
			{
				callId: `monitor-${Seq}`,
				rootCallId: `monitor-${Seq}`,
				agent: { id: AgentId, session: State.MonitorSessions.get(AgentId) },
			},
		);
	} catch {
		State.MonitorJobs.delete(Placeholder);
		Append(`monitor check failed ${Entry.path} ${SetId} (start)`);
		return undefined;
	}
	State.MonitorJobs.delete(Placeholder);
	State.MonitorJobs.set(Started.jobId, {
		agentId: AgentId,
		path: Entry.path,
		pathKey: Entry.pathKey,
		setId: SetId,
		startedAt: At,
		checkedVersion: Entry.lastVersion ?? "",
		writer: Entry.lastWriter ?? "-",
		tail: Started.tail,
	});
	Append(`monitor check dispatched ${Entry.path} ${SetId} -> ${Started.jobId}`);
	return Started.jobId;
};

/** The job label: the first 80 bytes (the design's label cap). */
const Label = (Text: string): string => (Text.length > 80 ? Text.slice(0, 80) : Text);

/** The checkpoint scan (called at every checkpoint, fail-open): the deadline
 * scan at every phase; the debounce dispatch at every phase; the slow
 * schedule and the retirement scan at the assemble phase only. */
export const Scan = (State: State, Append: Log, Phase: Phase): void => {
	try {
		if (!State.On || State.MonitorOn !== "on") {
			return;
		}
		const At = Clock(State);
		// The DEADLINE scan: the plugin's own deadline kills overdue monitor
		// jobs through the registry's kill - never a subprocess force-kill.
		for (const [JobId, Job] of [...State.MonitorJobs]) {
			if (At >= Job.startedAt + State.Monitor.checkTimeoutMs) {
				try {
					State.Wave?.Jobs?.kill(JobId, Job.agentId, "monitor-deadline");
				} catch {
					/* the kill is best-effort */
				}
			}
		}
		// The DEBOUNCE dispatch: a pending record whose window elapsed
		// dispatches and is deleted (the run IS the coalesced run - the
		// newest pending survived). When the admission is full the pending
		// record STAYS (coalesce-not-queue; its `since` is not bumped).
		for (const [, PerAgent] of State.Monitors) {
			for (const [, Entry] of PerAgent) {
				for (const [SetId, Pending] of [...Entry.pending]) {
					if (At - Pending.since < State.Monitor.debounceMs) {
						continue;
					}
					if (State.MonitorJobs.size >= State.Monitor.maxMonitorJobs) {
						continue;
					}
					Entry.pending.delete(SetId);
					const Spec = State.CheckSets[SetId];
					if (Spec === undefined || Spec.link !== undefined) {
						Append(`monitor check unknown ${SetId}`);
						continue;
					}
					void Dispatch(State, Entry.agentId, Entry, SetId, Spec, Append);
				}
			}
		}
		if (Phase !== "assemble") {
			return;
		}
		// The SLOW schedule (the assemble checkpoint only - the slow cadence
		// is request-aligned): one job per slow check set per interval.
		if (State.Monitor.slowCheckIntervalMs > 0) {
			for (const [AgentId, PerAgent] of State.Monitors) {
				for (const [PathKey, Entry] of PerAgent) {
					for (const SetId of Entry.sets) {
						const Spec = State.CheckSets[SetId];
						if (Spec === undefined || Spec.link !== undefined || Spec.fast !== false) {
							continue;
						}
						const Last = State.MonitorSlowLast.get(AgentId)?.get(PathKey)?.get(SetId);
						if (Last !== undefined && At - Last < State.Monitor.slowCheckIntervalMs) {
							continue;
						}
						if (State.MonitorJobs.size >= State.Monitor.maxMonitorJobs) {
							continue;
						}
						// The stamp advances at the dispatch (admission-guarded
						// like the debounce).
						const PerPath =
							State.MonitorSlowLast.get(AgentId) ??
							new Map<string, Map<string, number>>();
						State.MonitorSlowLast.set(AgentId, PerPath);
						const PerSet = PerPath.get(PathKey) ?? new Map<string, number>();
						PerPath.set(PathKey, PerSet);
						PerSet.set(SetId, At);
						void Dispatch(State, AgentId, Entry, SetId, Spec, Append);
					}
				}
			}
		}
		// The RETIREMENT scan (the assemble checkpoint only): an entry whose
		// last touch is older than retireMs renders ONE closing line at this
		// assembly, then withdraws (the caller removes it after the render).
		for (const [, PerAgent] of State.Monitors) {
			for (const [, Entry] of PerAgent) {
				if (Entry.closingRendered) {
					continue;
				}
				const Touched = Entry.lastObservedAt ?? Entry.enrolledAt;
				if (At - Touched >= State.Monitor.retireMs) {
					Entry.closingRendered = true;
					Append(`monitor retired ${Entry.path}`);
					Storage.Record(State, {
						event: "monitor-retired",
						path: Entry.path,
						agent: Entry.agentId,
						version: Entry.lastVersion ?? "",
						writer: "",
						checkSetId: "",
						ranAt: At,
						exit: null,
						infra: null,
						tail: "",
						provenance: "live",
					});
				}
			}
		}
	} catch {
		// Fail-open: the scan never throws into any dispatch.
	}
};

/** The L6 settle fold (runs BEFORE Board.OnSettled - the monitors claim
 * their jobs first). Only the plugin's own registry is folded; the record
 * is deleted after the fold. */
export const OnSettled = (State: State, Event: unknown, Append: Log): void => {
	try {
		const Settled = Event as
			| {
					type?: unknown;
					job?: { id?: unknown; status?: unknown; detail?: unknown; kind?: unknown };
					cause?: unknown;
			  }
			| undefined;
		if (Settled?.type !== "settled") {
			return;
		}
		const JobId = Settled.job?.id;
		if (typeof JobId !== "string" || JobId.length === 0) {
			return;
		}
		const Record = State.MonitorJobs.get(JobId);
		if (Record === undefined) {
			return;
		}
		const Cause = Settled.cause;
		const Status = Settled.job?.status;
		const Detail = typeof Settled.job?.detail === "string" ? Settled.job.detail : "";
		if (Cause === "teardown") {
			// The owner session died - the check is NOT recorded; the band
			// keeps the last-known result.
			Append(`monitor check lost ${Record.path} ${Record.setId} (teardown)`);
			State.MonitorJobs.delete(JobId);
			return;
		}
		let Exit: number | null = null;
		let Infra: string | null = null;
		if (Cause === "producer" && Status === "completed") {
			const Match = /^exit code: (\d+)$/.exec(Detail);
			if (Match !== null) {
				Exit = Number(Match[1]);
			} else {
				Infra = `producer:${Detail.length > 0 ? Detail : "no exit detail"}`;
			}
		} else if (Detail.includes("[sandbox:")) {
			// The sandbox denial is never a code problem (the 12.2 rule).
			Infra = "sandbox";
		} else if (Cause === "kill") {
			Infra = `killed:${Detail.length > 0 ? Detail : String(Cause)}`;
		} else {
			Infra = `producer:${Detail.length > 0 ? Detail : String(Status)}`;
		}
		const Result: CheckResult = {
			setId: Record.setId,
			jobId: JobId,
			ranAt: Clock(State),
			checkedVersion: Record.checkedVersion,
			writer: Record.writer,
			exit: Exit,
			infra: Infra,
			tail: Record.tail.Render(),
			provenance: "live",
		};
		State.MonitorJobs.delete(JobId);
		const Entry = State.Monitors.get(Record.agentId)?.get(Record.pathKey);
		if (Entry !== undefined) {
			// One result per set, newest wins, first-seen order preserved.
			Entry.checks = Entry.checks.filter((Candidate) => Candidate.setId !== Result.setId);
			Entry.checks.push(Result);
		}
		Append(
			`monitor check settled ${Record.path} ${Record.setId} (${JobId}, exit ${Exit === null ? "null" : Exit})`,
		);
		Storage.Record(State, {
			event: "monitor-check",
			path: Record.path,
			agent: Record.agentId,
			version: Result.checkedVersion,
			writer: Result.writer,
			checkSetId: Result.setId,
			ranAt: Result.ranAt,
			exit: Result.exit,
			infra: Result.infra,
			tail: Result.tail,
			provenance: "live",
		});
		FoldBoards(State, Record, Result);
	} catch {
		// Fail-open: the fold never throws into the jobs dispatch.
	}
};

/** The monitors-board fold (the design section 8, channel a): a member's
 * monitor settle feeds every monitors board whose members include the owner
 * - the row is the monitored file. */
const FoldBoards = (
	State: State,
	Record: { agentId: string; path: string },
	Result: CheckResult,
): void => {
	try {
		for (const [, Boards] of State.Boards) {
			for (const [, Board] of Boards) {
				if (Board.plantType !== "monitors") {
					continue;
				}
				if (!Board.members.some((Member) => Member.agentId === Record.agentId)) {
					continue;
				}
				let Item = Board.items.find((Candidate) => Candidate.label === Record.path);
				if (Item === undefined) {
					Item = {
						label: Record.path,
						state: Band.OutcomeText(Result),
						by: Result.writer,
						at: Result.ranAt,
					};
					Board.items.push(Item);
				}
				Item.state = Band.OutcomeText(Result);
				Item.by = Result.writer;
				Item.at = Result.ranAt;
			}
		}
	} catch {
		// Fail-open: the fold never throws into the jobs dispatch.
	}
};

/** The standing-section contribution for one agent: ONE part - the whole
 * monitors stanza (header + summary band first + the band frames, the
 * overflow collapsed lines and the retirement closing lines). Returns []
 * when nothing renders (the section body is then byte-identical with the
 * wave-2 behavior). */
export const SectionParts = (
	State: State,
	AgentId: string,
	Separator: string,
	Append: Log,
): string[] => {
	try {
		if (!State.On || State.MonitorOn !== "on") {
			return [];
		}
		// The assemble-pass checkpoint (the deadline, slow and retirement
		// scans - no real timers in the plugin; the next event is the bound).
		Scan(State, Append, "assemble");
		const PerAgent = State.Monitors.get(AgentId);
		const Live = [...(PerAgent?.values() ?? [])];
		if (Live.length === 0) {
			return [];
		}
		const At = Clock(State);
		const Fresh = Live.filter((Entry) => !Entry.closingRendered);
		const Closing = Live.filter((Entry) => Entry.closingRendered);
		// The newest files render full bands; the older files the one-line
		// collapsed forms (ordered by last observed touch, newest first).
		const Ordered = Fresh.sort(
			(Left, Right) =>
				(Right.lastObservedAt ?? Right.enrolledAt) -
				(Left.lastObservedAt ?? Left.enrolledAt),
		);
		const Full = Ordered.slice(0, State.Monitor.maxMonitors);
		const Overflow = Ordered.slice(State.Monitor.maxMonitors);
		const Frames: string[] = [];
		for (const Entry of Full) {
			const Rendered = Band.Frame(State, Entry, Separator, At);
			if (Rendered.truncated) {
				Append(
					`monitor band truncated ${Entry.path} (${Band.Bytes(Rendered.frame)} bytes)`,
				);
			}
			Frames.push(Rendered.frame);
		}
		for (const Entry of Overflow) {
			Frames.push(Band.Collapsed(State, Entry, Separator, At));
		}
		// The overflow ledger fires when the overflowed count CHANGES (the
		// quiet-ledger discipline).
		if (Overflow.length !== State.MonitorOverflowLast) {
			if (Overflow.length > 0) {
				Append(`monitors overflow ${Overflow.length}`);
			}
			State.MonitorOverflowLast = Overflow.length;
		}
		// The retirement closing lines render once, then the entries withdraw.
		for (const Entry of Closing) {
			Frames.push(Band.Closing(Entry, Separator, At));
			PerAgent?.delete(Entry.pathKey);
		}
		if (Frames.length === 0) {
			return [];
		}
		// The summary band counts ALL enrolled files (the collapsed included).
		return [Band.Stanza(Separator, Band.Summary(State, Fresh, At), Frames)];
	} catch {
		// Fail-open: the stanza skips and the assembly still resolves.
		try {
			Append("monitors render failed -> skipped");
		} catch {
			/* the ledger is best-effort */
		}
		return [];
	}
};
