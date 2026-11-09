// Drain - the queue -> SQLite transaction (Documentation/Plans/
// COST-TRACK-PLUGIN.md sections 1, 14 and 16.1): the session/flush listener's
// engine. One flush folds one session's queued events into the ledger inside
// ONE transaction: the session and project dimensions adopted from the session
// header, the Call row per assistant/message that carries usage (priced at the
// price row in force at the call's own time, with the cache split's
// CacheSaving), the Touch rows per tool/call (written the moment their Call
// row exists, pending until then, each with its Stage and ReadBeforeEdit
// derived from the file's own prior touches in the session and its BytesDelta
// summed from the touch's own Edit rows, so the allocator's byte weighting
// engages instead of falling back to equal shares - section 5.1; a search's
// argument names a scope, so its pending set stays empty until the tool/result
// arrives and its discovered paths become one read touch each), the ContextMass
// rows from the surface replay (which now splits the cached prefix from the
// uncached remainder), the Allocation rows from the attribution model
// (allocated when the step ends, or at the end of the batch as the safety
// net), the Verdict row per (session, file) when the session ends, and the
// session Cursor advanced to the highest sequence folded. The call's own
// pricing dimensions (section 17.1) - Mode, Region, the resolved tier and the
// time-of-day window its timestamp falls in (section 6) - are written on the
// Call row, and the cache split's CacheSaving is measured against the
// modifier-adjusted rates (section 17.2). The v4 grain rides the same fold:
// the Edit rows per touch (section 17.3), read from the tool call's own
// arguments, and the telemetry columns on the Call row (section 17.4), read
// from the batch's records up to each message. Every insert
// is INSERT OR IGNORE against the DDL's unique keys (the Verdict is
// REPLACE), so draining the same events twice writes the same rows and no
// duplicates. The drain never throws into the parallel dispatch: one failed
// batch rolls back whole, restores its session's in-memory replay state, logs
// one line and reports false - the flush handler owns the acknowledgement and
// decides the retry, so a batch that never committed stays queued. The fold
// also runs in a replay-only mode (E2, A2 section 1.4): it walks the events
// exactly as the booking fold does - the surface buffer, the pending touch
// sets, the awaiting calls, the per-file histories and the folded set all
// advance - but it writes no row, advances no cursor and never touches the
// capture queue, so a partially processed session can rebuild the state a
// continuous run would hold before it books the events past its cursor.
import { basename } from "node:path";
import type { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";

import type Config from "../Interface/Config.js";
import type Touched from "../Interface/Touch.js";
import type Usage from "../Interface/Usage.js";
import Allocate from "./Allocate.js";
import Edit from "./Edit.js";
import Mass from "./Mass.js";
import Price from "./Price.js";
import StageOf from "./Stage.js";
import Telemetry from "./Telemetry.js";
import Touch, { Search } from "./Touch.js";

type EventRecord = {
	type?: unknown;
	data?: unknown;
	seq?: unknown;
	time?: unknown;
	id?: unknown;
};

type Costed = {
	Input: number;
	Output: number;
	CacheRead: number;
	CacheWrite: number;
	Reasoning: number;
	Total: number;
	Currency: string;
};

// One parsed file interaction, exactly what the arguments parser returns.
type TouchRow = { Path: string; Kind: "read" | "write" | "edit" | "delete" | "search" };

// One tool/call's touches, waiting for the Call row they attach to. A
// search-family call's set is deferred: it stays empty until the tool/result
// that completes the call supplies the discovered files, so Resolved marks
// whether the set is final and CallId pairs the call with its result.
type PendingCall = {
	CallKey: string;
	CallId: string;
	Tool: string;
	Arguments: string;
	Seq: number;
	At: number;
	Resolved: boolean;
	Touched: readonly TouchRow[];
};

// One priced call, waiting for the step's touches to be complete.
type AwaitedCall = {
	CallId: number;
	Turn: number;
	Step: number;
	At: number;
	Usage: Usage;
	Costed: Costed;
	Surface: number;
	PerPath: Map<string, number>;
	Cached: Map<string, number>;
	CachedSurface: number;
};

// One session's in-memory replay state, copied before a fold and put back
// when the transaction rolls back: the surface buffer every later call's mass
// is replayed over, the pending touch sets, the awaiting calls, the per-file
// ordered touch kinds, and the calls this drain has already folded.
type ReplayState = {
	Surfaces: unknown[];
	Histories: Map<string, string[]>;
	Pending: Map<string, PendingCall[]>;
	Awaiting: Map<string, AwaitedCall>;
	Folded: number[];
};

// The fold's mode: Replay rebuilds one session's in-memory replay state from
// an already-booked prefix and books nothing - no row, no cursor advance, no
// capture-queue acknowledgement. Every caller that omits it books, which is
// the live flush and the whole of the backfill's booking pass.
type FoldMode = { Replay?: boolean };

// The mutating kinds: the touches whose stage the classifier reads as an
// edit (section 16.1) and whose presence makes a file's verdict "changed".
const WriteKind = (Kind: string): boolean =>
	Kind === "write" || Kind === "edit" || Kind === "delete" || Kind === "move";

// The call a tool/result event belongs to: the tool-role message's own source
// callId (the shape the live log records), else its toolCallId, else the
// event's own callId - "" when the record carries none.
const OriginOf = (Data: Record<string, unknown>): string => {
	const Message = Data["message"];
	const Named =
		Message !== null && typeof Message === "object"
			? (Message as Record<string, unknown>)
			: undefined;
	const Source = Named?.["source"];
	const Held =
		Source !== null && typeof Source === "object"
			? (Source as Record<string, unknown>)["callId"]
			: undefined;
	const Candidate = Held ?? Named?.["toolCallId"] ?? Data["callId"];
	return typeof Candidate === "string" ? Candidate : "";
};

// One configured window's coverage (section 6): a half-open span of UTC hours
// that starts at the window's first hour and runs for its length - so an end
// past 24 (or an end before the start) wraps into the next day - and covers
// nothing when the two hours are equal.
const Covered = (Hour: number, Start: number, End: number): boolean => {
	const From = ((Start % 24) + 24) % 24;
	const Span = End - Start <= 0 ? End - Start + 24 : End - Start;
	switch (true) {
		case Start === End:
			return false;
		case Span >= 24:
			return true;
		default: {
			const Into = (((Hour - From) % 24) + 24) % 24;
			return Into < Span;
		}
	}
};

// The cache split's saving (section 2.2 and section 11's ring C): the reads
// the cache made cheaper, minus the cache-write premium when the provider
// charges one - zero when the price row carries no cache rates.
const Saving = (
	CacheRead: number,
	CacheWrite: number,
	Rate: { InputRate: number; CacheReadRate: number | null; CacheWriteRate: number | null },
): number => {
	const Read =
		Rate.CacheReadRate === null ? 0 : (CacheRead * (Rate.InputRate - Rate.CacheReadRate)) / 1e6;
	const Write =
		Rate.CacheWriteRate === null || Rate.CacheWriteRate <= Rate.InputRate
			? 0
			: (CacheWrite * (Rate.CacheWriteRate - Rate.InputRate)) / 1e6;
	return Read - Write;
};

// One file's verdict at session end (section 14): a file whose last
// write-kind touch is a revert is "reverted", a file with any write-kind
// touch is "changed", a file with only read-kind touches is "read".
const VerdictOf = (Kinds: readonly string[]): string => {
	const Last = Kinds.reduce((Found, Kind, Index) => (WriteKind(Kind) ? Index : Found), -1);
	switch (true) {
		case Last < 0:
			return "read";
		default: {
			const Current = Kinds[Last] ?? "";
			const Staged = StageOf(Kinds.slice(0, Last), Current, false);
			return Staged === "revert" ? "reverted" : "changed";
		}
	}
};

// The session identity: the subject's own id first, then the session header
// record in the batch.
const Identify = (Session: unknown, Records: readonly EventRecord[]): string | undefined => {
	const Subject = Session as { id?: unknown } | undefined;
	if (typeof Subject?.id === "string" && Subject.id.length > 0) {
		return Subject.id;
	}
	for (const Record of Records) {
		if (Record.type === "session" && typeof Record.id === "string" && Record.id.length > 0) {
			return Record.id;
		}
	}
	return undefined;
};

export default (Context: Context, Database: DatabaseSync, Config: Config) => {
	// The harness token meter, probed once for the telemetry reads: an absent
	// service is a handle whose session-scoped calls throw and are contained
	// by Telemetry's own never-throw guards.
	const Meter = (Context as unknown as Record<string, unknown>)["tokenMeter"] as Parameters<
		typeof Telemetry
	>[0];
	// The estimator: the harness token meter's estimateMessage where probed
	// (the design document's estimator for replay). An absent or throwing
	// meter prices every message at zero, which empties the per-file masses
	// and sends the whole input half to the unattributed bucket - the
	// conservation law still holds.
	const Estimate = (Message: unknown): number => {
		const Meter = (Context as unknown as Record<string, unknown>)["tokenMeter"] as
			{ estimateMessage?: (message: unknown) => number } | undefined;
		if (typeof Meter?.estimateMessage !== "function") {
			return 0;
		}
		try {
			const Tokens = Math.ceil(Number(Meter.estimateMessage(Message)) || 0);
			return Tokens > 0 ? Tokens : 0;
		} catch {
			return 0;
		}
	};
	const Replay = Mass(Estimate);
	const Book = Price(Database, Config);
	const Cost = Book.Cost;

	// The call's own time-of-day window (section 6): the configured window
	// whose UTC hours cover the call's timestamp, else "any" - the generic row
	// every price book falls back to when no window matches.
	const WindowOf = (At: number): string => {
		const Hour = new Date(At).getUTCHours();
		for (const Window of Config.priceWindows) {
			const Start = Math.round(Window.startUtcHour);
			const End = Math.round(Window.endUtcHour);
			if (Covered(Hour, Start, End)) {
				return Window.label;
			}
		}
		return "any";
	};

	const SelectCursor = Database.prepare("SELECT LastSeq FROM Cursor WHERE SessionId = ?");
	const WriteCursor = Database.prepare(
		"INSERT INTO Cursor (SessionId, LastSeq, UpdatedAt) VALUES (?, ?, ?) " +
			"ON CONFLICT(SessionId) DO UPDATE SET LastSeq = excluded.LastSeq, UpdatedAt = excluded.UpdatedAt",
	);
	const InsertClient = Database.prepare("INSERT OR IGNORE INTO Client (Name) VALUES (?)");
	const SelectClient = Database.prepare("SELECT ClientId FROM Client WHERE Name = ?");
	const SelectProject = Database.prepare("SELECT ProjectId FROM Project WHERE Root = ?");
	const InsertProject = Database.prepare(
		"INSERT OR IGNORE INTO Project (ClientId, Name, Root) VALUES (?, ?, ?)",
	);
	const UpsertSession = Database.prepare(
		"INSERT INTO Session (SessionId, ProjectId, ParentSessionId, Origin, DelegationDepth, AgentPreset, Cwd, Title, CreatedAt) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
			"ON CONFLICT(SessionId) DO UPDATE SET " +
			"ProjectId = COALESCE(excluded.ProjectId, ProjectId), " +
			"ParentSessionId = COALESCE(excluded.ParentSessionId, ParentSessionId), " +
			"Origin = COALESCE(excluded.Origin, Origin), " +
			"DelegationDepth = COALESCE(excluded.DelegationDepth, DelegationDepth), " +
			"AgentPreset = COALESCE(excluded.AgentPreset, AgentPreset), " +
			"Cwd = COALESCE(excluded.Cwd, Cwd), " +
			"Title = COALESCE(excluded.Title, Title)",
	);
	const SelectCall = Database.prepare(
		"SELECT CallId FROM Call WHERE SessionId = ? AND Turn = ? AND Step = ?",
	);
	const InsertCall = Database.prepare(
		"INSERT OR IGNORE INTO Call (SessionId, Turn, Step, Seq, Provider, Model, PriceId, InputTokens, OutputTokens, " +
			"CacheReadTokens, CacheWriteTokens, ReasoningTokens, TotalTokens, CostInput, CostOutput, CostCacheRead, " +
			"CostCacheWrite, CostReasoning, CostTotal, Currency, SurfaceTokens, CacheSaving, At, Mode, Region, Tier, " +
			"LatencyMs, FirstTokenMs, TokensPerSecond, Attempts, ErrorCode, ContextWindow, Utilization) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);
	const SelectPriceId = Database.prepare(
		"SELECT PriceId FROM Price WHERE Provider = ? AND Model = ? AND EffectiveFrom = ? " +
			"ORDER BY PriceId DESC LIMIT 1",
	);
	const SelectFile = Database.prepare("SELECT FileId FROM File WHERE ProjectId = ? AND Path = ?");
	const InsertFile = Database.prepare(
		"INSERT OR IGNORE INTO File (ProjectId, Path, FirstSeenAt) VALUES (?, ?, ?)",
	);
	const InsertTouch = Database.prepare(
		"INSERT OR IGNORE INTO Touch (CallId, SessionId, Turn, Step, CallKey, Tool, FileId, Kind, Stage, ReadBeforeEdit, BytesDelta, Seq, At) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);
	const SelectTouchId = Database.prepare(
		"SELECT TouchId FROM Touch WHERE SessionId = ? AND CallKey = ? AND FileId = ?",
	);
	const InsertEdit = Database.prepare(
		"INSERT OR IGNORE INTO Edit (TouchId, Ordinal, LinesAdded, LinesRemoved, BytesAdded, BytesRemoved, At) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?)",
	);
	const InsertVerdict = Database.prepare(
		"INSERT OR REPLACE INTO Verdict (SessionId, FileId, State, LinesAdded, LinesRemoved, At) " +
			"VALUES (?, ?, ?, ?, ?, ?)",
	);
	const InsertMass = Database.prepare(
		"INSERT OR IGNORE INTO ContextMass (CallId, FileId, Tokens) VALUES (?, ?, ?)",
	);
	const SelectTouches = Database.prepare(
		"SELECT Touch.Kind AS Kind, Touch.BytesDelta AS BytesDelta, File.Path AS Path " +
			"FROM Touch JOIN File ON File.FileId = Touch.FileId WHERE Touch.CallId = ?",
	);
	const SelectAllocated = Database.prepare("SELECT 1 FROM Allocation WHERE CallId = ? LIMIT 1");
	const InsertAllocation = Database.prepare(
		"INSERT OR IGNORE INTO Allocation (CallId, FileId, DirectCost, AmortizedCost, ContextTokens, SurfaceTokens, Weight, Method, At) " +
			"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);

	// The per-session replay state, held across flushes: the surface buffer
	// every later call's mass is replayed over (bounded by the session's own
	// length), the pending touch sets, the awaiting calls, and the per-file
	// ordered touch kinds every later touch's stage and the session's
	// verdicts read (section 16.1).
	const Surfaces = new Map<string, unknown[]>();
	const Pending = new Map<string, Map<string, PendingCall[]>>();
	const Awaiting = new Map<string, Map<string, AwaitedCall>>();
	const Histories = new Map<string, Map<string, string[]>>();
	const Folded = new Set<number>();

	// The replay state a failed fold must not keep: the transaction rolled the
	// ledger back, so the in-memory buffers roll back with it and the retry
	// sees exactly the state the failed attempt saw. A kept duplicate would
	// double the surface mass, replay the touch kinds twice and mark calls
	// folded that the rollback erased - the insert guards would then skip the
	// very rows the retry must write.
	const Snapshot = (SessionId: string): ReplayState => ({
		Surfaces: [...(Surfaces.get(SessionId) ?? [])],
		Histories: new Map(
			Array.from(
				Histories.get(SessionId) ?? new Map<string, string[]>(),
				([Path, Kinds]) => [Path, [...Kinds]] as const,
			),
		),
		Pending: new Map(
			Array.from(
				Pending.get(SessionId) ?? new Map<string, PendingCall[]>(),
				([Key, Queued]) => [Key, [...Queued]] as const,
			),
		),
		Awaiting: new Map(Awaiting.get(SessionId) ?? new Map<string, AwaitedCall>()),
		Folded: [...Folded],
	});
	const Restore = (SessionId: string, Held: ReplayState): void => {
		Surfaces.set(SessionId, Held.Surfaces);
		Histories.set(SessionId, Held.Histories);
		Pending.set(SessionId, Held.Pending);
		Awaiting.set(SessionId, Held.Awaiting);
		Folded.clear();
		for (const CallId of Held.Folded) {
			Folded.add(CallId);
		}
	};

	// One assistant/message's usage record, read from the event's own fields:
	// the TokenUsage buckets (a missing bucket is null, charged at zero) and
	// the provider and model the call's own source block names.
	const UsageOf = (
		Data: Record<string, unknown>,
		Turn: number,
		Step: number,
		Seq: number,
		At: number,
	): Usage | undefined => {
		const Raw = Data["usage"];
		if (Raw === null || typeof Raw !== "object") {
			return undefined;
		}
		const Buckets = Raw as Record<string, unknown>;
		const Input = Number(Buckets["inputTokens"]);
		const Output = Number(Buckets["outputTokens"]);
		if (!Number.isFinite(Input) || !Number.isFinite(Output)) {
			return undefined;
		}
		const Bucket = (Key: string): number | null => {
			const Value = Number(Buckets[Key]);
			return Number.isFinite(Value) ? Math.round(Value) : null;
		};
		const Source = (Data["message"] as { source?: unknown } | undefined)?.source;
		const Named = Source as { provider?: unknown; model?: unknown } | undefined;
		const Provider = Named?.provider;
		const Model = Named?.model;
		// The factor layer's dimensions (section 17.1): the log's own mode
		// and region signals when it carries them - Mode defaults to
		// "standard", Region stays NULL when the log has no signal.
		const ModeRaw = Data["mode"];
		const RegionRaw = Data["region"];
		return {
			SessionId: "",
			Turn: Math.round(Turn),
			Step: Math.round(Step),
			Seq: Math.round(Seq),
			Provider: typeof Provider === "string" && Provider.length > 0 ? Provider : "unknown",
			Model: typeof Model === "string" && Model.length > 0 ? Model : "unknown",
			InputTokens: Math.round(Input),
			OutputTokens: Math.round(Output),
			CacheReadTokens: Bucket("cacheReadTokens"),
			CacheWriteTokens: Bucket("cacheWriteTokens"),
			ReasoningTokens: Bucket("reasoningTokens"),
			TotalTokens: Bucket("totalTokens"),
			At: Math.round(At),
			Mode: typeof ModeRaw === "string" && ModeRaw.length > 0 ? ModeRaw : "standard",
			Region: typeof RegionRaw === "string" && RegionRaw.length > 0 ? RegionRaw : null,
		};
	};

	return (Session: unknown, Events: readonly unknown[], Mode?: FoldMode): boolean => {
		try {
			// The replay-only mode (E2): the walk rebuilds the session's
			// state from the prefix the cursor already booked and must not
			// book it again, so every write, the cursor and the transaction
			// are skipped below while the fold itself runs unchanged.
			const ReplayOnly = Mode?.Replay === true;
			const Records = (Events as EventRecord[]).filter(
				(Event) => Event !== null && typeof Event === "object" && Event.type !== undefined,
			);
			// Nothing to fold: a batch of untyped records or one with no
			// session identity can never commit, so it is reported as folded
			// (the handler acknowledges it) instead of retried forever.
			if (Records.length === 0) {
				return true;
			}
			const SessionId = Identify(Session, Records);
			if (SessionId === undefined) {
				return true;
			}
			let Cwd = process.cwd();
			const SubjectCwd = (Session as { cwd?: unknown } | undefined)?.cwd;
			if (typeof SubjectCwd === "string" && SubjectCwd.length > 0) {
				Cwd = SubjectCwd;
			}
			let Project: number | undefined;
			const CursorRow = SelectCursor.get(SessionId) as { LastSeq: unknown } | undefined;
			const LastSeq = typeof CursorRow?.LastSeq === "number" ? CursorRow.LastSeq : 0;
			let Reached = LastSeq;
			let Turn = 0;

			// --- the per-batch helpers, closed over the batch's session -------

			// The project: resolved from the session's cwd (the header's, else
			// the drain-time cwd) and created on first sight under the
			// configured client, exactly like the entry does for its own cwd.
			const ProjectOf = (): number | undefined => {
				if (Project !== undefined) {
					return Project;
				}
				// The replay pass resolves the existing dimensions only: the
				// client and the project rows were written by the booking
				// fold the cursor records, so creating them is a write.
				switch (true) {
					case ReplayOnly:
						break;
					default:
						InsertClient.run(Config.client);
				}
				const Client = SelectClient.get(Config.client) as { ClientId: unknown } | undefined;
				if (typeof Client?.ClientId !== "number") {
					return undefined;
				}
				switch (true) {
					case ReplayOnly:
						break;
					default:
						InsertProject.run(Client.ClientId, basename(Cwd), Cwd);
				}
				const Found = SelectProject.get(Cwd) as { ProjectId: unknown } | undefined;
				Project = typeof Found?.ProjectId === "number" ? Found.ProjectId : undefined;
				return Project;
			};

			// The session dimension: created or completed from whatever this
			// event reveals (the header carries the identity fields; an
			// assistant message may be the first event a mid-session drain
			// ever sees). The header is FLAT - its fields sit on the record
			// itself, not under data - so both levels are read. COALESCE keeps
			// the first known value of each field.
			const Adopt = (
				Record: EventRecord,
				Data: Record<string, unknown>,
				At: number,
			): void => {
				const Header = Record as Record<string, unknown>;
				const Pick = (Key: string): unknown => Data[Key] ?? Header[Key];
				const Home = Pick("cwd");
				const Next = typeof Home === "string" && Home.length > 0 ? Home : Cwd;
				if (Next !== Cwd) {
					Cwd = Next;
					Project = undefined;
				}
				const Origin = Pick("origin");
				const Parent = Pick("parentSession");
				const DepthRaw = Pick("delegationDepth");
				const Depth = typeof DepthRaw === "number" ? Math.round(DepthRaw) : null;
				const Preset = Pick("agentPreset");
				const Title = Pick("title");
				const CreatedRaw = Pick("createdAt");
				const Created =
					typeof CreatedRaw === "number" ? Math.round(CreatedRaw) : Math.round(At);
				// The replay pass keeps the session's cwd in memory - the
				// tool arguments resolve against it - and writes no dimension
				// row: the session was adopted when the prefix was booked.
				switch (true) {
					case ReplayOnly:
						break;
					default:
						UpsertSession.run(
							SessionId,
							ProjectOf() ?? null,
							typeof Parent === "string" ? Parent : null,
							typeof Origin === "string" ? Origin : null,
							Depth,
							typeof Preset === "string" ? Preset : null,
							Next,
							typeof Title === "string" ? Title : null,
							Created,
						);
				}
			};

			// The file dimension: one path of the session's project, created on
			// first sight; the id, or null when the project could not resolve.
			// The replay pass resolves the existing row and creates nothing.
			const Filed = (Path: string, At: number): number | null => {
				const ProjectId = ProjectOf();
				if (ProjectId === undefined) {
					return null;
				}
				switch (true) {
					case ReplayOnly:
						break;
					default:
						InsertFile.run(ProjectId, Path, Math.round(At));
				}
				const Found = SelectFile.get(ProjectId, Path) as { FileId: unknown } | undefined;
				return typeof Found?.FileId === "number" ? Found.FileId : null;
			};

			const Called = (Turn: number, Step: number): number | undefined => {
				const Found = SelectCall.get(SessionId, Math.round(Turn), Math.round(Step)) as
					{ CallId: unknown } | undefined;
				return typeof Found?.CallId === "number" ? Found.CallId : undefined;
			};

			const WriteTouches = (
				CallId: number,
				Turn: number,
				Step: number,
				Entry: PendingCall,
			): void => {
				const History = Histories.get(SessionId) ?? new Map<string, string[]>();
				Histories.set(SessionId, History);
				// the edit grain (section 17.3) is parsed once per tool call:
				// its hunks are the call's measured churn, summed over both
				// sides and written on the Touch row as BytesDelta, so the
				// allocator's byte weighting engages at Fold time (section
				// 5.1). A call whose arguments parse to no hunks leaves the
				// delta NULL, which keeps the equal-share fallback intact.
				const Hunks = Edit(Entry.Tool, Entry.Arguments, Entry.At);
				const Delta =
					Hunks.length === 0
						? null
						: Hunks.reduce((Sum, Hunk) => Sum + Hunk.BytesAdded + Hunk.BytesRemoved, 0);
				for (const Row of Entry.Touched) {
					const FileId = Filed(Row.Path, Entry.At);
					if (FileId === null) {
						continue;
					}
					// the stage and the read-before-edit flag (section 16.1):
					// derived from the file's own prior touch kinds in this
					// session. The restore signal is not carried by the current
					// log shape, so the classifier's revert rule is fed false
					// until a hash-aware touch arrives - the Verdict's reverted
					// state recomputes when one does.
					const Prior = History.get(Row.Path) ?? [];
					const Staged = StageOf(Prior, Row.Kind, false);
					const Read =
						WriteKind(Row.Kind) && Prior.some((Kind) => Kind === "read") ? 1 : 0;
					switch (true) {
						case ReplayOnly:
							break;
						default:
							InsertTouch.run(
								CallId,
								SessionId,
								Math.round(Turn),
								Math.round(Step),
								Entry.CallKey,
								Entry.Tool,
								FileId,
								Row.Kind,
								Staged,
								Read,
								Delta,
								Entry.Seq,
								Entry.At,
							);
					}
					const Seen = History.get(Row.Path) ?? [];
					Seen.push(Row.Kind);
					History.set(Row.Path, Seen);
					// the hunks themselves, inserted against the touch they
					// belong to - a non-edit tool's arguments parse to no
					// rows, so the insert is skipped. The replay pass records
					// the kind above and writes no edit row.
					const Held = SelectTouchId.get(SessionId, Entry.CallKey, FileId) as
						{ TouchId: unknown } | undefined;
					const TouchId = typeof Held?.TouchId === "number" ? Held.TouchId : undefined;
					if (TouchId === undefined) {
						continue;
					}
					for (const Hunk of Hunks) {
						switch (true) {
							case ReplayOnly:
								break;
							default:
								InsertEdit.run(
									TouchId,
									Hunk.Ordinal,
									Hunk.LinesAdded,
									Hunk.LinesRemoved,
									Hunk.BytesAdded,
									Hunk.BytesRemoved,
									Hunk.At,
								);
						}
					}
				}
			};

			const Pend = (Turn: number, Step: number, Entry: PendingCall): void => {
				const BySession = Pending.get(SessionId) ?? new Map<string, PendingCall[]>();
				const Key = `${Math.round(Turn)}:${Math.round(Step)}`;
				const Queued = BySession.get(Key) ?? [];
				Queued.push(Entry);
				BySession.set(Key, Queued);
				Pending.set(SessionId, BySession);
			};

			// The discovered files of one search result: the pending search
			// call the result belongs to (its callId when both carry one, else
			// the first unresolved search call of the step) takes the result's
			// own paths as its touches - so the files a search found, not the
			// scope it searched, are what the ledger records. A result that
			// names no pending search call, a result for a non-search tool and
			// an unreadable result leave the pending set as it was: the parser
			// yields no touch and nothing is guessed.
			const Discover = (Turn: number, Step: number, Data: Record<string, unknown>): void => {
				const Queued = Pending.get(SessionId)?.get(
					`${Math.round(Turn)}:${Math.round(Step)}`,
				);
				if (Queued === undefined) {
					return;
				}
				const CallId = OriginOf(Data);
				for (const Entry of Queued) {
					switch (true) {
						case Entry.Resolved:
						case !Search(Entry.Tool):
							continue;
						case CallId.length > 0 &&
							Entry.CallId.length > 0 &&
							Entry.CallId !== CallId:
							continue;
						default:
					}
					Entry.Touched = Touch(Entry.Tool, Entry.Arguments, Cwd, Data);
					Entry.Resolved = true;
					return;
				}
			};

			// The pending touches resolved: a pending set is written the moment
			// its Call row exists - at the tool result that completes the call,
			// or at the assistant message that writes the call row. A search
			// still waiting for its result keeps its place, so the result of a
			// parallel call never drops it.
			const Release = (Turn: number, Step: number): void => {
				const BySession = Pending.get(SessionId);
				const Key = `${Math.round(Turn)}:${Math.round(Step)}`;
				const Queued = BySession?.get(Key);
				if (Queued === undefined) {
					return;
				}
				const CallId = Called(Turn, Step);
				if (CallId === undefined) {
					return;
				}
				const Held: PendingCall[] = [];
				for (const Entry of Queued) {
					switch (true) {
						case !Entry.Resolved:
							Held.push(Entry);
							break;
						default:
							WriteTouches(CallId, Turn, Step, Entry);
					}
				}
				switch (true) {
					case Held.length === 0:
						BySession?.delete(Key);
						break;
					default:
						BySession?.set(Key, Held);
				}
			};

			const Await = (Entry: AwaitedCall): void => {
				const BySession = Awaiting.get(SessionId) ?? new Map<string, AwaitedCall>();
				BySession.set(`${Entry.Turn}:${Entry.Step}`, Entry);
				Awaiting.set(SessionId, BySession);
			};

			// One call's allocation: the ledger's own Touch rows (every touch of
			// the step is written by now) replayed through the allocator, the
			// money inserted against the call, the call marked folded. The
			// double guard (this drain's own set, then the ledger's) makes a
			// repeated fold a no-op, so a step that ends twice is never
			// double-counted.
			const Fold = (Entry: AwaitedCall): void => {
				switch (true) {
					case Folded.has(Entry.CallId):
						return;
					// the replay pass rebuilds the folded set only: the
					// allocation row was committed with the cursor whose
					// prefix is being replayed, so there is nothing to write
					case ReplayOnly:
						Folded.add(Entry.CallId);
						return;
					case SelectAllocated.get(Entry.CallId) !== undefined:
						Folded.add(Entry.CallId);
						return;
					default: {
						const Touched: Touched[] = [];
						for (const Row of SelectTouches.all(Entry.CallId) as {
							Kind: unknown;
							BytesDelta: unknown;
							Path: unknown;
						}[]) {
							if (typeof Row.Path !== "string" || typeof Row.Kind !== "string") {
								continue;
							}
							Touched.push({
								SessionId,
								Turn: Entry.Turn,
								Step: Entry.Step,
								Seq: 0,
								CallKey: "",
								Tool: "",
								Path: Row.Path,
								Kind: Row.Kind as Touched["Kind"],
								BytesBefore: null,
								BytesAfter: null,
								BytesDelta:
									typeof Row.BytesDelta === "number" ? Row.BytesDelta : null,
							});
						}
						const Rows = Allocate(
							Entry.Usage,
							Entry.Costed,
							Touched,
							{
								Surface: Entry.Surface,
								PerPath: Entry.PerPath,
								Cached: Entry.Cached,
								CachedSurface: Entry.CachedSurface,
							},
							Config,
						);
						for (const Row of Rows) {
							const FileId = Row.Path === null ? null : Filed(Row.Path, Entry.At);
							InsertAllocation.run(
								Entry.CallId,
								FileId,
								Row.DirectCost,
								Row.AmortizedCost,
								Math.round(Row.ContextTokens),
								Math.round(Row.SurfaceTokens),
								Row.Weight,
								Row.Method,
								Entry.At,
							);
						}
						Folded.add(Entry.CallId);
					}
				}
			};

			const Priced = (
				Provider: string,
				Model: string,
				EffectiveFrom: number,
			): number | null => {
				const Found = SelectPriceId.get(Provider, Model, EffectiveFrom) as
					{ PriceId: unknown } | undefined;
				return typeof Found?.PriceId === "number" ? Found.PriceId : null;
			};

			// --- the fold: one transaction over the whole batch ---------------
			// The replay-only pass takes no transaction (it writes nothing) but
			// keeps the same snapshot, so a failure inside it puts the state
			// back exactly as the booking fold's rollback does.
			const Before = Snapshot(SessionId);
			switch (true) {
				case ReplayOnly:
					break;
				default:
					Database.exec("BEGIN IMMEDIATE");
			}
			try {
				for (let Index = 0; Index < Records.length; Index++) {
					const Record = Records[Index];
					if (Record === undefined) {
						continue;
					}
					const Seq = typeof Record.seq === "number" ? Record.seq : -1;
					if (Seq >= 0) {
						// The cursor skip is the booking boundary; the replay
						// pass walks exactly the prefix that boundary covers.
						if (!ReplayOnly && Seq <= LastSeq) {
							continue;
						}
						if (Seq > Reached) {
							Reached = Seq;
						}
					}
					const Type = typeof Record.type === "string" ? Record.type : "";
					const Data = (Record.data ?? {}) as Record<string, unknown>;
					const At = typeof Record.time === "number" ? Record.time : Date.now();
					switch (true) {
						case Type === "session": {
							Adopt(Record, Data, At);
							break;
						}
						case Type === "turn/start": {
							if (typeof Data["turn"] === "number") {
								Turn = Data["turn"];
							}
							break;
						}
						case Type === "tool/call": {
							const TurnOfCall =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfCall = typeof Data["step"] === "number" ? Data["step"] : 0;
							const Name = typeof Data["name"] === "string" ? Data["name"] : "";
							const Arguments =
								typeof Data["arguments"] === "string" ? Data["arguments"] : "";
							const Rows = Touch(Name, Arguments, Cwd);
							// a search's argument is a scope, not a file: its
							// touches arrive with the result that completes it
							const Deferred = Search(Name);
							if (Rows.length === 0 && !Deferred) {
								break;
							}
							const Entry: PendingCall = {
								CallKey:
									Seq >= 0 ? String(Seq) : `${TurnOfCall}/${StepOfCall}/${Name}`,
								CallId: typeof Data["callId"] === "string" ? Data["callId"] : "",
								Tool: Name,
								Arguments,
								Seq: Seq >= 0 ? Seq : 0,
								At: Math.round(At),
								Resolved: !Deferred,
								Touched: Rows,
							};
							const CallId = Called(TurnOfCall, StepOfCall);
							// a deferred search waits for its result even when
							// the Call row already exists
							if (CallId === undefined || Deferred) {
								Pend(TurnOfCall, StepOfCall, Entry);
							} else {
								WriteTouches(CallId, TurnOfCall, StepOfCall, Entry);
							}
							break;
						}
						case Type === "tool/result": {
							// the call completed: its discovered files (a search)
							// and its pending touches are final
							const TurnOfResult =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfResult =
								typeof Data["step"] === "number" ? Data["step"] : 0;
							Discover(TurnOfResult, StepOfResult, Data);
							Release(TurnOfResult, StepOfResult);
							break;
						}
						case Type === "assistant/message": {
							const TurnOfCall =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfCall = typeof Data["step"] === "number" ? Data["step"] : 0;
							const Usage = UsageOf(Data, TurnOfCall, StepOfCall, Seq, At);
							if (Usage === undefined) {
								break;
							}
							// the surface BEFORE this call: the replay covers every
							// surface event folded so far, this one not yet - and
							// the call's cacheReadTokens is the budget the replay
							// splits the cached prefix by (section 2.2)
							const Massed = Replay(
								Surfaces.get(SessionId) ?? [],
								Usage.CacheReadTokens ?? 0,
							);
							const Surface = Math.max(0, Math.round(Massed.Surface));
							const PerPath = new Map<string, number>();
							for (const [Path, Tokens] of Massed.PerPath) {
								PerPath.set(Path, Math.max(0, Math.round(Tokens)));
							}
							const Cached = new Map<string, number>();
							for (const [Path, Tokens] of Massed.Cached) {
								Cached.set(Path, Math.max(0, Math.round(Tokens)));
							}
							const CachedSurface = Math.max(0, Math.round(Massed.CachedSurface));
							Adopt(Record, {}, At);
							// The price row in force at the call's own time,
							// mode, region and time-of-day window (sections
							// 17.1 and 6): the call's own signals, defaulting
							// to standard, any region and the window its
							// timestamp falls in - else the generic "any" row.
							const Rate = Book.Resolve(
								Usage.Provider,
								Usage.Model,
								Usage.At,
								Usage.Mode ?? "standard",
								Usage.Region ?? null,
								WindowOf(Usage.At),
							);
							const Costed = Cost(Usage, Rate);
							// The cache split's saving is measured against the
							// modifier-adjusted rates (section 17.2), not the
							// raw ones, so the book's discounts and uplifts
							// move the saving the same way they move the bill.
							const Lift = Book.Applied(
								Usage.Provider,
								Usage.Mode ?? "standard",
								Usage.Model,
								Usage.At,
							);
							const Saved = Saving(
								Usage.CacheReadTokens ?? 0,
								Usage.CacheWriteTokens ?? 0,
								{
									InputRate: Rate.InputRate * Lift,
									CacheReadRate:
										Rate.CacheReadRate === null
											? null
											: Rate.CacheReadRate * Lift,
									CacheWriteRate:
										Rate.CacheWriteRate === null
											? null
											: Rate.CacheWriteRate * Lift,
								},
							);
							// The telemetry the log already carries (section
							// 17.4), read from this batch's records up to and
							// including the message: the retry count, the
							// step-to-message latency, the first stream token,
							// the context window and its utilization, the
							// failure code - and the tokens-per-second rate
							// from the call's own output tokens over it.
							// The drain replays records without a live session
							// handle, so the meter's session-scoped reads are
							// skipped here and the walk's own request/context
							// arm supplies the window (the backfill case).
							const Measured = Telemetry(
								Meter,
								undefined,
								Records.slice(0, Index + 1),
								Surface,
							);
							const PerSecond =
								Measured.LatencyMs !== null && Measured.LatencyMs > 0
									? Usage.OutputTokens / (Measured.LatencyMs / 1000)
									: null;
							switch (true) {
								case ReplayOnly:
									break;
								default:
									InsertCall.run(
										SessionId,
										Usage.Turn,
										Usage.Step,
										Usage.Seq,
										Usage.Provider,
										Usage.Model,
										Priced(Usage.Provider, Usage.Model, Rate.EffectiveFrom),
										Usage.InputTokens,
										Usage.OutputTokens,
										Usage.CacheReadTokens ?? 0,
										Usage.CacheWriteTokens ?? 0,
										Usage.ReasoningTokens ?? 0,
										Usage.TotalTokens,
										Costed.Input,
										Costed.Output,
										Costed.CacheRead,
										Costed.CacheWrite,
										Costed.Reasoning,
										Costed.Total,
										Costed.Currency,
										Surface,
										Saved,
										Usage.At,
										Usage.Mode ?? "standard",
										Usage.Region ?? null,
										Rate.EffectiveFrom === 0 ? null : Rate.TierFrom,
										Measured.LatencyMs,
										Measured.FirstTokenMs,
										PerSecond,
										Measured.Attempts,
										Measured.ErrorCode,
										Measured.ContextWindow,
										Measured.Utilization,
									);
							}
							const CallId = Called(Usage.Turn, Usage.Step);
							if (CallId === undefined) {
								break;
							}
							Release(Usage.Turn, Usage.Step);
							switch (true) {
								case ReplayOnly:
									break;
								default:
									for (const [Path, Tokens] of PerPath) {
										const FileId = Filed(Path, Usage.At);
										if (FileId === null) {
											continue;
										}
										InsertMass.run(CallId, FileId, Tokens);
									}
							}
							Await({
								CallId,
								Turn: Usage.Turn,
								Step: Usage.Step,
								At: Usage.At,
								Usage,
								Costed,
								Surface,
								PerPath,
								Cached,
								CachedSurface,
							});
							break;
						}
						case Type === "step/end": {
							const TurnOfEnd =
								typeof Data["turn"] === "number" ? Data["turn"] : Turn;
							const StepOfEnd = typeof Data["step"] === "number" ? Data["step"] : 0;
							const Key = `${Math.round(TurnOfEnd)}:${Math.round(StepOfEnd)}`;
							const BySession = Awaiting.get(SessionId);
							const Entry = BySession?.get(Key);
							if (Entry !== undefined) {
								Fold(Entry);
								BySession?.delete(Key);
							}
							break;
						}
						case Type === "session/disposed" || Type === "turn/end": {
							// the session boundary (section 14): the Verdict row
							// per (session, file) from the touch kinds seen so
							// far - REPLACE keeps the latest end's state, so a
							// mid-session turn's premature row is corrected by
							// the final one and the verdict stays recomputable
							// from Touch alone. The replay pass keeps the
							// histories and writes no verdict: the booking fold
							// replaces the row when the session really ends.
							switch (true) {
								case ReplayOnly:
									break;
								default: {
									const Over = Histories.get(SessionId);
									if (Over !== undefined) {
										for (const [Path, Kinds] of Over) {
											const FileId = Filed(Path, At);
											if (FileId === null) {
												continue;
											}
											InsertVerdict.run(
												SessionId,
												FileId,
												VerdictOf(Kinds),
												0,
												0,
												Math.round(At),
											);
										}
									}
								}
							}
							break;
						}
						default:
					}
					// The surface replay buffer: the four surface kinds, the
					// tool/call records (the callId map's source for later
					// results) and the session header (the cwd the arguments
					// resolve against), kept per session for every later call.
					switch (true) {
						case Type === "session" ||
							Type === "system/message" ||
							Type === "user/message" ||
							Type === "assistant/message" ||
							Type === "tool/result" ||
							Type === "tool/call": {
							const Buffer = Surfaces.get(SessionId) ?? [];
							Buffer.push(Record);
							Surfaces.set(SessionId, Buffer);
							break;
						}
						default:
					}
				}
				// The batch's safety net: a call still awaiting its allocation
				// (its step never ended inside this batch) folds here. The double
				// guard makes any later fold a no-op, so a step whose remaining
				// tool calls arrive in a later batch keeps its already-folded
				// money, and a recompute heals the missing touches.
				const BySession = Awaiting.get(SessionId);
				if (BySession !== undefined) {
					for (const [Key, Entry] of BySession) {
						Fold(Entry);
						BySession.delete(Key);
					}
					Awaiting.delete(SessionId);
				}
				// The cursor is the booking boundary: the replay pass never
				// moves it, so the booking fold that follows starts exactly
				// where the last committed batch ended.
				switch (true) {
					case ReplayOnly:
						break;
					default: {
						if (Reached > LastSeq) {
							WriteCursor.run(SessionId, Reached, Date.now());
						}
						Database.exec("COMMIT");
					}
				}
				return true;
			} catch (Failure) {
				switch (true) {
					case ReplayOnly:
						break;
					default:
						try {
							Database.exec("ROLLBACK");
						} catch {
							/* the transaction may have already ended */
						}
				}
				// The ledger rolled back, so the session's replay state rolls
				// back too: the retry must recompute the same rows, not skip
				// them against a set of calls that no longer exist. A failed
				// replay pass restores the same way, so the session is never
				// booked from a half-reconstructed state.
				Restore(SessionId, Before);
				throw Failure;
			}
		} catch (Failure) {
			try {
				(
					Context as unknown as { logger?: { warn?: (message: string) => void } }
				).logger?.warn?.(
					`plugin-dsh-cost: a drain batch was not folded: ${
						Failure instanceof Error ? Failure.message : String(Failure)
					}`,
				);
			} catch {
				/* silence above all */
			}
			// The flush handler owns the acknowledgement: false keeps the
			// batch queued, so its bounded retry folds it again.
			return false;
		}
	};
};
