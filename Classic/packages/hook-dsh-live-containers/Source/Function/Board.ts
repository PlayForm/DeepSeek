// Board - the planted-block surface (CAN-2, I5 PLANTED-LEASE;
// IMPLEMENTATION-DESIGN.md sections 3.4, 4.4 as amended). A planted block is
// a LEASE: the board declares its reporters and a window of N consecutive
// parent turns without a foldable report from a running member; on expiry the
// block SELF-DECLARES the stale row - and that declaration IS the CAN-4
// delegation-stall failsafe trigger (the engine consumes lease.declared; no
// parallel timer).
//
// STATE: the board lives in the parent's per-agent state (keyed on the
// agent's session id) - it dies with the agent; no orphan boards survive.
//
// RENDER SURFACES (I5 1.3): the standing section carries running boards; the
// stale declarations are section changes at the next parent request. There is
// no completion-style dynamic context for boards - a board is RUNNING state.
import type State from "@Interface/State.js";
import type { BoardMember, BoardState, JobEvent, LeaseEntry } from "@Interface/Events.js";
import Clock from "@Function/Clock.js";
import * as Policy from "@Function/Policy.js";
import type { Log } from "@Function/Render.js";
import { StartedAt as JobsStartedAt } from "@Function/Jobs.js";

/** The byte length of one string. */
const Bytes = (Text: string): number => Buffer.byteLength(Text, "utf8");

/** Cap one string to N bytes, single line (the row payload cap). */
const Cap = (Text: string, Max: number): string => {
	const Cut = Text.split("\n")[0] ?? "";
	return Cut.length > Max ? Cut.slice(0, Max) : Cut;
};

/** The boards of one agent. */
export const For = (Agent: State, AgentId: string): Map<string, BoardState> => {
	const Existing = Agent.Boards.get(AgentId);
	if (Existing !== undefined) {
		return Existing;
	}
	const Fresh = new Map<string, BoardState>();
	Agent.Boards.set(AgentId, Fresh);
	return Fresh;
};

/** The fresh member row. */
const NewMember = (AgentId: string): BoardMember => ({
	agentId: AgentId,
	status: "running",
	lastReport: "",
	lastReportAt: undefined,
	summary: undefined,
	settledAt: undefined,
});

/** Open one board (the live_plant path). The ledger order: plant opened
 * first, then the enrollments (I5: enrollment opens the lease entries). */
export const Open = (
	Agent: State,
	AgentId: string,
	Id: string,
	PlantType: BoardState["plantType"],
	Expect: number,
	MemberIds: string[] | undefined,
	Template: string | undefined,
	Append: Log,
): BoardState => {
	const Boards = For(Agent, AgentId);
	const At = Clock(Agent);
	const Pinned = MemberIds ?? [];
	const Board: BoardState = {
		id: Id,
		agentId: AgentId,
		plantType: PlantType,
		template: Template,
		expect: Expect,
		members: [],
		overflow: [],
		items:
			PlantType === "todo-fill"
				? Array.from({ length: Expect }, (_, Index) => ({
						label: `item-${Index + 1}`,
						state: "todo" as const,
						by: undefined,
						at: undefined,
					}))
				: [],
		lease: { reporters: new Map<string, LeaseEntry>(), state: "open" },
		openedAt: At,
		closeAt: At + Agent.Plant.closeMs,
		closedAt: undefined,
		closeRendered: false,
		lostRendered: false,
		suggested: undefined,
		suggestionId: undefined,
		pruned: 0,
		lastTurnAt: undefined,
	};
	Boards.set(Id, Board);
	Append(`plant opened ${Id} (expect ${Expect})`);
	// The pinned members enroll through Enroll (the ledger line per member);
	// more pins than slots overflow.
	for (const MemberId of Pinned) {
		const Enrolled = Enroll(Agent, Board, MemberId, Append);
		if (!Enrolled && !Board.members.some((Member) => Member.agentId === MemberId)) {
			Board.overflow.push({ agentId: MemberId, summary: "" });
		}
	}
	return Board;
};

/** Enroll one member with the FULL lease window (I5 5.3: a late enrollee
 * gets the full window; the board's open time does not eat the grace). */
export const Enroll = (Agent: State, Board: BoardState, AgentId: string, Append: Log): boolean => {
	if (Board.members.some((Member) => Member.agentId === AgentId)) {
		return false;
	}
	if (Board.members.length >= Board.expect) {
		return false;
	}
	Board.members.push(NewMember(AgentId));
	Board.lease.reporters.set(AgentId, {
		turnWindow: Agent.Plant.leaseTurns,
		remaining: Agent.Plant.leaseTurns,
		declared: false,
		declaredTurn: 0,
		// The enrollment report clock starts at 0 (long ago), so the member's
		// FIRST report always folds and resets (never pre-coalesced).
		lastReportAt: 0,
		stalledLedged: false,
	});
	Append(`member enrolled ${Board.id} ${AgentId}`);
	return true;
};

/** Fold one explicit report (the L7 pickup; the grammar is checked by the
 * caller): `[live-report] <plantId> <agentId> <status> <payload>`. Idempotent
 * per (plantId, agentId, turn): a second report resets the same lease entry
 * and shows the newest payload (I5 5.1); the coalescing window (I5 6.1)
 * allows one lease reset per reportRateMs. */
export const Report = (
	Agent: State,
	Board: BoardState,
	AgentId: string,
	Status: string,
	Payload: string,
	Append: Log,
): void => {
	const At = Clock(Agent);
	const RateMs = Agent.Plant.reportRateMs;
	const Entry = Board.lease.reporters.get(AgentId);
	let Reset = true;
	if (Entry !== undefined && At - Entry.lastReportAt < RateMs) {
		// The coalescing window: overwrite the payload, bump the clock, do NOT
		// reset the lease again (one reset per window is the bound).
		Reset = false;
	}
	const Member = Board.members.find((Candidate) => Candidate.agentId === AgentId);
	if (Member !== undefined) {
		Member.lastReport = Cap(Payload, 240);
		Member.lastReportAt = At;
		if (Status === "running") {
			Member.status = Member.status === "stale" ? "stale" : "running";
		} else if (Status === "stalled") {
			Member.status = "stalled";
		} else if (Status === "error") {
			Member.status = "failed";
			Member.summary = Cap(Payload, 64);
			Member.settledAt = At;
			Board.lease.reporters.delete(AgentId);
		} else if (Status === "done") {
			Member.status = "done";
			Member.summary = Cap(Payload, 48);
			Member.settledAt = At;
			Board.lease.reporters.delete(AgentId);
		}
	} else if (Board.overflow.some((Item) => Item.agentId === AgentId)) {
		// An unboarded child's report is folded into the counts only (I5 5.4).
		const Item = Board.overflow.find((Candidate) => Candidate.agentId === AgentId);
		if (Item !== undefined) {
			Item.summary = Cap(Payload, 48);
		}
	}
	// The todo-fill variant: the report grammar is
	// `[live-report] <plantId> <agentId> todo <itemIndex> <done|running>` -
	// the status field carries "todo" and the payload the item + the state.
	if (Status === "todo" && Board.plantType === "todo-fill") {
		const Match = /^(\d+)\s+(done|running)$/.exec(Payload.trim());
		if (Match !== null) {
			const Item = Board.items[Number(Match[1]) - 1];
			if (Item !== undefined) {
				Item.state = Match[2] === "done" ? "done" : "running";
				Item.by = AgentId;
				Item.at = At;
			}
		}
	}
	// The monitors variant: the report grammar is
	// `[live-report] <plantId> <agentId> monitored <outcome> <path>` - the
	// outcome word FIRST (one of clean | problem | stale | not-run | infra |
	// denied), the path is the rest of the payload (paths with spaces parse).
	// The row is the monitored file; the member's status is NOT touched (a
	// monitored report is an observation, not a completion).
	if (Status === "monitored" && Board.plantType === "monitors") {
		const Trimmed = Payload.trim();
		const Split = Trimmed.indexOf(" ");
		const Word = Split === -1 ? Trimmed : Trimmed.slice(0, Split);
		const RowPath = Split === -1 ? "" : Trimmed.slice(Split + 1);
		const Text = MONITORED_OUTCOMES[Word];
		if (Text !== undefined && RowPath.length > 0) {
			let Item = Board.items.find((Candidate) => Candidate.label === RowPath);
			if (Item === undefined) {
				Item = { label: RowPath, state: Text, by: AgentId, at: At };
				Board.items.push(Item);
			}
			Item.state = Text;
			Item.by = AgentId;
			Item.at = At;
		}
	}
	if (Reset && Entry !== undefined) {
		Entry.remaining = Entry.turnWindow;
	}
	if (Entry !== undefined) {
		Entry.lastReportAt = At;
	}
	Append(`report ${Board.id} ${AgentId} (${Bytes(Payload)} bytes)`);
};

/** The L6 settle hook: a child job's settlement flips the member's row (the
 * board truth source, carriers 1-2). Jobs owned by member sessions only. */
export const OnSettled = (Agent: State, Event: JobEvent, Append: Log): void => {
	if (Event.type !== "settled") {
		return;
	}
	const Owner = Event.job.owner;
	if (Owner === undefined) {
		return;
	}
	// THE MONITORS SKIP GUARD (the wave-3 addition, one early-return line): a
	// member's MONITOR settle is a check, not a completion - it must never
	// flip the member's TASK row. The job id lives in the plugin's own
	// monitor registry; the `monitor` kind is the order-safe backstop (the
	// registry record is deleted by the monitors fold, which runs before
	// this hook).
	if (Agent.MonitorJobs.has(Event.job.id) || Event.job.kind === "monitor") {
		return;
	}
	for (const [, Boards] of Agent.Boards) {
		for (const [, Board] of Boards) {
			if (Board.lease.state === "closed") {
				continue;
			}
			const Member = Board.members.find((Candidate) => Candidate.agentId === Owner);
			if (Member === undefined || Member.status === "done" || Member.status === "failed") {
				continue;
			}
			if (Event.cause === "teardown") {
				// The lease wins (I5 5.2): no settlement truth - running until expiry.
				continue;
			}
			const At = Clock(Agent);
			if (Event.job.status === "killed" || Event.job.status === "failed") {
				Member.status = "failed";
				Member.summary = Cap(Event.job.detail ?? Event.job.status, 64);
				Member.settledAt = At;
				Board.lease.reporters.delete(Owner);
			} else {
				Member.status = "done";
				Member.summary = Cap(Event.job.detail ?? "done", 48);
				Member.settledAt = At;
				Board.lease.reporters.delete(Owner);
			}
			Append(`report ${Board.id} ${Owner} (${Bytes(Member.summary ?? "")} bytes)`);
		}
	}
};

/** The parent-turn hook (the lease decrement, I5 2.2): one assemble pass = one
 * parent turn. A member whose last report predates the PREVIOUS assemble pass
 * had no foldable report in the last turn window and decrements; any report
 * folded since resets to the full window. The declaration renders in the SAME
 * assembly's frame (the decrement runs before render). */
export const OnTurn = (Agent: State, AgentId: string, Append: Log): void => {
	const At = Clock(Agent);
	for (const [, Board] of For(Agent, AgentId)) {
		if (Board.lease.state !== "open") {
			continue;
		}
		// The pre-declaration stall: a running member whose last report is
		// older than stallMs renders [stalled] - the ledger records it once.
		for (const Member of Board.members) {
			const Entry = Board.lease.reporters.get(Member.agentId);
			if (
				Member.status === "running" &&
				Member.lastReportAt !== undefined &&
				At - Member.lastReportAt > Agent.Plant.stallMs
			) {
				Member.status = "stalled";
				if (Entry !== undefined && !Entry.stalledLedged) {
					Entry.stalledLedged = true;
					Append(`member stalled ${Board.id} ${Member.agentId}`);
				}
			}
		}
		for (const [MemberId, Entry] of Board.lease.reporters) {
			const Member = Board.members.find((Candidate) => Candidate.agentId === MemberId);
			const LastAt = Member?.lastReportAt ?? Entry.lastReportAt;
			const ReportedLastWindow =
				LastAt !== undefined &&
				(Board.lastTurnAt === undefined || LastAt > Board.lastTurnAt);
			if (ReportedLastWindow) {
				Entry.remaining = Entry.turnWindow;
				continue;
			}
			Entry.remaining -= 1;
			if (Entry.remaining <= 0 && !Entry.declared) {
				Entry.declared = true;
				Entry.declaredTurn = Agent.TurnCounts.get(AgentId) ?? 0;
				if (Member !== undefined) {
					Member.status = "stale";
				}
				Append(`lease expired ${Board.id} ${MemberId} (after ${Entry.turnWindow} turns)`);
			}
		}
		Board.lastTurnAt = At;
	}
};

/** The stale declaration row (I5 3.1, byte-exact). */
export const StaleRow = (AgentId: string, Turns: number): string =>
	`[stale]     ${AgentId} - unreported for ${Turns} parent turns; re-dispatch or mark failed`;

/** The failsafe hook (I5 4.1): the declaration IS the trigger - on prune,
 * drop the member from the expect count (only after the stale row rendered
 * at least one assembly, I5 4.2). The prune is the lease's only automatic
 * modification and counts against failsafesPerTurn (I5 4.3). */
export const FailsafeStall = (Agent: State, AgentId: string, Append: Log): void => {
	if (Agent.Failsafes !== "on" || Agent.Plant.stallAction !== "prune") {
		return;
	}
	const Turn = Agent.TurnCounts.get(AgentId) ?? 0;
	for (const [, Board] of For(Agent, AgentId)) {
		if (Board.lease.state !== "open") {
			continue;
		}
		for (const [MemberId, Entry] of [...Board.lease.reporters]) {
			if (!Entry.declared || Entry.declaredTurn >= Turn) {
				continue;
			}
			const Member = Board.members.find((Candidate) => Candidate.agentId === MemberId);
			if (Member === undefined || Member.status !== "stale") {
				continue;
			}
			if (!Policy.WithinBudget(Agent, AgentId, Turn)) {
				continue;
			}
			Board.members = Board.members.filter((Candidate) => Candidate.agentId !== MemberId);
			Board.lease.reporters.delete(MemberId);
			Board.pruned += 1;
			Policy.SpendBudget(Agent, AgentId, Turn);
			Append(`member dropped ${Board.id} ${MemberId} (pruned)`);
		}
	}
};

/** The row label padding: label then spaces to column 12 (I5 3.1). */
const Row = (Label: string, Body: string): string =>
	`${Label}${" ".repeat(Math.max(1, 12 - Label.length))}${Body}`;

/** The `[live-report] monitored` outcome word -> the row's outcome text (the
 * design section 8: the outcome word first, the path is the rest of the
 * payload). */
const MONITORED_OUTCOMES: Record<string, string> = {
	clean: "clean (\u2204)",
	problem: "problem (!)",
	stale: "~ STALE (file changed after check)",
	"not-run": "not run yet (\u2205?)",
	infra: "check failed (infrastructure) (x)",
	denied: "check denied (sandbox) (x)",
};

/** The agent-board frame (D2 4.4 + I5, byte-exact). */
export const Frame = (Agent: State, Board: BoardState, Separator: string): string => {
	const At = Clock(Agent);
	// The board-level STALE declaration (the orphan case, I5 2.4 + D2 4.4
	// verbatim): the parent's previous request is older than orphanBudgetMs.
	const LastTurn = Agent.LastTurnAt.get(Board.agentId);
	const Orphaned =
		LastTurn !== undefined &&
		At - LastTurn > Agent.Plant.orphanBudgetMs &&
		Board.lease.reporters.size > 0;
	const HeaderStatus = Orphaned
		? `; status: STALE - no parent requests for ${Math.max(0, Math.round((At - LastTurn) / 1000))}s`
		: Board.suggested !== undefined
			? `; status: suggested - accept=${Board.suggested} to start`
			: "";
	const Lines: string[] = [
		`${Separator} LIVE PLANT ${Board.id} (${Board.plantType}; expect ${Board.expect}${HeaderStatus}) ${Separator}`,
	];
	if (Board.plantType === "todo-fill") {
		for (const Item of Board.items) {
			switch (Item.state) {
				case "done":
					Lines.push(
						`[x] ${Item.label} - by ${Item.by ?? "?"} (${Item.at === undefined ? 0 : Math.max(0, Math.round((At - Item.at) / 1000))}s)`,
					);
					break;
				case "running":
					Lines.push(`[~] ${Item.label} - in progress`);
					break;
				default:
					Lines.push(`[ ] ${Item.label}`);
					break;
			}
		}
	} else if (Board.plantType === "aggregate") {
		// One computed line from all members (02 section 3; I5 6.2: recompute
		// never lags its inputs by more than one fold).
		const Parts = Board.members
			.filter((Member) => Member.lastReport.length > 0)
			.map((Member) => `${Member.agentId}: ${Member.lastReport}`);
		const Done = Board.members.filter((Member) => Member.status === "done").length;
		const Running = Board.members.filter(
			(Member) => Member.status !== "done" && Member.status !== "failed",
		).length;
		Lines.push(
			Parts.length > 0 ? Parts.join(" | ") : `reports: ${Done} done / ${Running} active`,
		);
	} else if (Board.plantType === "monitors") {
		// The monitored rows: one row per monitored file (the design section
		// 8 byte - the members' monitor settles and the [live-report]
		// monitored reports feed the items).
		for (const Item of Board.items) {
			Lines.push(Row("[monitored]", `${Item.label} - ${Item.state} by ${Item.by ?? "-"}`));
		}
	} else {
		for (const Member of Board.members) {
			switch (Member.status) {
				case "done":
					Lines.push(Row("[done]", `${Member.agentId} - ${Member.summary ?? "done"}`));
					break;
				case "failed":
					Lines.push(
						Row("[failed]", `${Member.agentId} - ${Member.summary ?? "failed"}`),
					);
					break;
				case "stale": {
					const Entry = Board.lease.reporters.get(Member.agentId);
					Lines.push(
						StaleRow(Member.agentId, Entry?.turnWindow ?? Agent.Plant.leaseTurns),
					);
					break;
				}
				case "stalled": {
					const Ago =
						Member.lastReportAt === undefined
							? 0
							: Math.max(0, Math.round((At - Member.lastReportAt) / 1000));
					Lines.push(Row("[stalled]", `${Member.agentId} - no report for ${Ago}s`));
					break;
				}
				default: {
					const Ago =
						Member.lastReportAt === undefined
							? 0
							: Math.max(0, Math.round((At - Member.lastReportAt) / 1000));
					const Last =
						Member.lastReport.length > 0
							? ` (last: "${Member.lastReport}" ${Ago}s ago)`
							: "";
					Lines.push(
						Row(
							"[running]",
							`${Member.agentId} - ${Member.summary ?? "working"}${Last}`,
						),
					);
					break;
				}
			}
		}
		for (const Overflow of Board.overflow) {
			Lines.push(Row("[unboarded]", `${Overflow.agentId} - overflow`));
		}
	}
	const Empty = Math.max(0, Board.expect - Board.members.length - Board.pruned);
	for (let Slot = 1; Slot <= Empty; Slot += 1) {
		Lines.push(Row("[none]", `slot-${Board.members.length + Slot} - no agent enrolled`));
	}
	const Done = Board.members.filter((Member) => Member.status === "done").length;
	const Running = Board.members.filter((Member) => Member.status === "running").length;
	const Stale = Board.members.filter(
		(Member) => Member.status === "stale" || Member.status === "stalled",
	).length;
	Lines.push(`total: ${Done} done / ${Running} running / ${Stale} stale / ${Empty} empty`);
	// The re-dispatch hint (I5 3.3): one line, appended as the LAST line of
	// the board frame when any member's lease has expired AND failsafes are
	// on. The hint is channel 4 - it renders with stallAction warn-only too.
	if (Agent.Failsafes === "on") {
		const First = Board.members.find((Member) => Member.status === "stale");
		if (First !== undefined) {
			const Entry = Board.lease.reporters.get(First.agentId);
			Lines.push(
				`[live] next: ${First.agentId} unreported for ${Entry?.turnWindow ?? Agent.Plant.leaseTurns} turns - re-dispatch, or accept and prune (live_plant prune ${Board.id} ${First.agentId}).`,
			);
		}
	}
	Lines.push(`${Separator} END LIVE PLANT ${Board.id} ${Separator}`);
	return Lines.join("\n");
};

/** The closing line (I5 7.2, byte-exact variants). */
export const ClosingLine = (Board: BoardState, Seconds: number): string =>
	Board.pruned > 0
		? `board closed: ${Board.members.filter((Member) => Member.status === "done").length}/${Board.expect} done, ${Board.pruned} pruned stale in ${Seconds}s`
		: `board closed: ${Board.members.filter((Member) => Member.status === "done").length}/${Board.expect} done in ${Seconds}s`;

/** The standing-section contribution for one agent, as SEPARATE frames (the
 * collapse pass needs per-frame granularity). Returns [] when nothing renders. */
export const SectionParts = (
	Agent: State,
	AgentId: string,
	Separator: string,
	Append: Log,
): string[] => {
	const At = Clock(Agent);
	// The deadline scan (the live-timeout kill and the hang failsafe check at
	// every assemble pass and on every jobs event - no real timers in the
	// plugin; the next event is the bound, matching "acts at the next request").
	ScanDeadlines(Agent, Append);
	// The live jobs (the fleet).
	const Records = Agent.Detached.get(AgentId);
	const Live = [...(Records?.values() ?? [])].filter((Record) => Record.status === undefined);
	const Parts: string[] = [];
	const Jobs = Live;
	for (const Record of Live) {
		const Elapsed = Math.max(0, Math.round((At - Record.startedAt) / 1000));
		Parts.push(
			[
				`${Separator} LIVE CONTAINER ${Record.jobId} (running; not harness state) ${Separator}`,
				`cmd: ${Record.cmdLine}`,
				`started: ${JobsStartedAt(At)}`,
				`status: running (elapsed ${Elapsed}s)`,
				`${Separator} END LIVE CONTAINER ${Record.jobId} ${Separator}`,
			].join("\n"),
		);
	}
	// The boards.
	for (const [, Board] of For(Agent, AgentId)) {
		if (Board.lease.state === "closed") {
			// The closing line rendered one request already - withdraw.
			continue;
		}
		// The closeMs rule: after closeMs the empty slots drop and the board
		// closes (only when every enrolled member has settled).
		const Settled = Board.members.every(
			(Member) => Member.status === "done" || Member.status === "failed",
		);
		if (At >= Board.closeAt && Settled) {
			const Seconds = Math.max(0, Math.round((At - Board.openedAt) / 1000));
			Board.lease.state = "closed";
			Board.closedAt = At;
			Append(
				`board closed ${Board.id} (${Board.members.filter((Member) => Member.status === "done").length}/${Board.expect} in ${Seconds}s)`,
			);
			Parts.push(ClosingLine(Board, Seconds));
			Board.closeRendered = true;
			continue;
		}
		Parts.push(Frame(Agent, Board, Separator));
	}
	// The section header + fleet line: only while any job/board is live.
	if (Parts.length > 0) {
		const Fleet =
			Jobs.length > 0 ? Jobs.map((Record) => `${Record.jobId} running`).join(" | ") : "none";
		const Header = [
			`${Separator} LIVE CONTAINERS (background tasks; completions may arrive out of order) ${Separator}`,
			`live: ${Fleet}`,
		];
		return [...Header, ...Parts];
	}
	return [];
};

/** The standing-section contribution for one agent (the wave-2 body): the
 * header caveat + fleet line, the live-job frames, the board frames. Returns
 * "" when nothing renders (the phase-1 section is then byte-identical). */
export const SectionBody = (
	Agent: State,
	AgentId: string,
	Separator: string,
	Append: Log,
): string => SectionParts(Agent, AgentId, Separator, Append).join("\n");

/** The deadline scan: the live-timeout kill (J7) and the hang failsafe (F1).
 * Called at every assemble pass and on every jobs event - the checkpoint
 * design (no real timers; the next event is the bound). */
export const ScanDeadlines = (Agent: State, Append: Log): void => {
	const At = Clock(Agent);
	for (const [AgentId, Records] of Agent.Detached) {
		for (const [JobId, Record] of [...Records]) {
			if (Record.status !== undefined) {
				continue;
			}
			// The live-timeout: the ONLY guard for the detached deadline
			// (onExpiry "none"; the inline timeout policy does not apply).
			if (At >= Record.deadlineAt) {
				try {
					Agent.Wave?.Jobs?.kill(JobId, AgentId, "live-timeout");
				} catch {
					/* the kill is best-effort */
				}
				continue;
			}
			// The hang detector: zero new output bytes past hangBudgetMs (the
			// per-record tail byte-count delta vs the clock - pure counters).
			if (Agent.Failsafes !== "on") {
				continue;
			}
			const Total = Record.tail.Stdout.length + Record.tail.Stderr.length;
			const Watch = Agent.HangWatch.get(JobId);
			if (Watch === undefined || Total > Watch.bytes) {
				Agent.HangWatch.set(JobId, { bytes: Total, since: At });
				continue;
			}
			if (At - Watch.since >= Agent.HangBudgetMs) {
				Append(
					`failsafe hang ${JobId} (${Math.round((At - Watch.since) / 1000)}s no output)`,
				);
				if (Agent.HangAction === "kill") {
					try {
						Agent.Wave?.Jobs?.kill(JobId, AgentId, "live-hang");
					} catch {
						/* the kill is best-effort */
					}
				}
				Agent.HangWatch.set(JobId, { bytes: Total, since: At });
			}
		}
	}
};
