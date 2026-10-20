// Policy - the per-call detach decision engine (IMPLEMENTATION-DESIGN.md
// sections 3.2, 5.1-5.2; Requirements/01 sections 5 + 12). Pure functions over
// the plugin's own state - no I/O, no eval.
//
// THE COMMAND-ONLY DETACH RULE (I1 12.1, HARD): the transform detaches ONLY
// the command-executing tools. The content-mutating family - write, edit,
// raw-write, normalize-file - is PERMANENTLY NON-DETACHABLE, hardcoded here
// and checked FIRST: rejected even when mode is "all" or the tool is listed in
// selectedTools. Read-only observation tools are out of the default detach set
// and may detach under "selected" only.
//
// THE EFFECTIVE-GATE ORDER (I2 section 3, binding):
//   DETACH = TRANSFORM_ON
//          AND NOT NON_DETACHABLE(tool)    (this file, checked FIRST)
//          AND NOT AWAIT_MARKER(call)      (Detach.ts, after the class rule)
//          AND NOT DEDUP_LIVE(agent, call) (Detach.ts)
//          AND NOT ESCALATION(call)        (Detach.ts)
//          AND POLICY_DECIDE(...)          (this file's guards, last)
// This file owns the classification, the dedup key, the mode logic and the
// guard rails (capacity, minLatencyMs, interactive, meta-budget). Detach.ts
// owns the marker check and the waterfall branches.
//
// All time reads go through the State's clock seam (the smoke's fake clock).
import type State from "../Interface/State.js";
import type { DetachConfig } from "../Interface/State.js";
import Clock from "./Clock.js";

/** The permanently non-detachable content-mutating family (I1 12.1, HARD -
 * hardcoded, never config; rejected even under "all" and "selected"). */
export const NON_DETACHABLE: readonly string[] = ["write", "edit", "raw-write", "normalize-file"];

/** The command-runner family the transform wraps by default (I1 12.1: bash,
 * pwsh, and the family whose Exec is a spawned subprocess; this harness ships
 * the bash tool, so the base set is bash - selectedTools may add more). */
export const COMMAND_RUNNERS: readonly string[] = ["bash"];

/** The inline-deadline cap liveTimeoutMs must respect (the I1 12.2 rule keyed
 * on the bash executor's inline default). */
export const INLINE_DEADLINE_MS = 120000;

/** Whether the tool belongs to the permanently non-detachable family. */
export const IsNonDetachable = (Tool: string): boolean => NON_DETACHABLE.includes(Tool);

/** Whether the tool is a command runner the producer can re-dispatch: the
 * hardcoded base family, or a tool the "selected" allowlist names (the
 * non-detachable family is rejected BEFORE this is ever consulted). */
export const IsDetachableTool = (Tool: string, Detach: DetachConfig): boolean =>
	COMMAND_RUNNERS.includes(Tool) || Detach.selectedTools.includes(Tool);

/** The conservative interactive detector (01 section 9 edge case 2): a
 * command that reads from stdin without a redirected source cannot run in a
 * background ring - inline. */
export const IsInteractive = (Command: string): boolean => {
	const Text = Command.trim();
	if (/(^|\||;|&&)\s*read\s/.test(Text)) {
		return true;
	}
	if (/(^|\||;|&&)\s*ssh\b/.test(Text)) {
		return true;
	}
	if (/(^|\||;|&&)\s*vim?\b/.test(Text)) {
		return true;
	}
	if (/(^|\||;|&&)\s*less\b/.test(Text)) {
		return true;
	}
	return false;
};

/** The dedup key (design section 5.2): (agent id, normalized command, resolved
 * workdir). Normalized = trim + collapse runs of whitespace + strip leading
 * `cd x && ` prefixes whose target equals the resolved workdir. */
export const DedupKey = (AgentId: string, Command: string, Workdir: string | undefined): string => {
	let Normalized = Command.trim().replace(/\s+/g, " ");
	if (Workdir !== undefined) {
		const Match = /^cd\s+(\S+)\s*&&\s*(.*)$/.exec(Normalized);
		if (Match !== null) {
			const Prefix = Match[1] ?? "";
			const Target = Prefix.startsWith("/") ? Prefix : `${Workdir}/${Prefix}`;
			if (Target === Workdir) {
				Normalized = Match[2] ?? "";
			}
		}
	}
	return `${AgentId}\u0000${Normalized}\u0000${Workdir ?? ""}`;
};

/** The command prefix the long-running history keys on (the first two words:
 * `cargo build`, `npm install` - cheap and pure-observer). */
export const CommandPrefix = (Command: string): string => {
	const Words = Command.trim().replace(/\s+/g, " ").split(" ");
	return Words.slice(0, 2).join(" ") || Command.trim();
};

/** Record one inline command's duration into the per-agent, per-prefix history
 * (the wave-2 observer feeding the long-running heuristic; an awaited call's
 * duration is recorded like any inline call - the I2 7.7 honesty rule, no
 * marker-based exclusion). */
export const RecordDuration = (
	Agent: State,
	AgentId: string,
	Command: string,
	Ms: number,
): void => {
	const PerAgent = Agent.History.get(AgentId) ?? new Map<string, number[]>();
	const Key = CommandPrefix(Command);
	const Window = Agent.Detach.historyWindow;
	const Series = PerAgent.get(Key) ?? [];
	Series.push(Ms);
	while (Series.length > Window) {
		Series.shift();
	}
	PerAgent.set(Key, Series);
	Agent.History.set(AgentId, PerAgent);
};

/** The same-prefix history average (undefined when no history). */
export const HistoryAverage = (
	Agent: State,
	AgentId: string,
	Command: string,
): number | undefined => {
	const Series = Agent.History.get(AgentId)?.get(CommandPrefix(Command));
	if (Series === undefined || Series.length === 0) {
		return undefined;
	}
	return Series.reduce((Sum, Value) => Sum + Value, 0) / Series.length;
};

/** Whether the command matches any long-running marker (substring match on
 * the command line, the I1 heuristic's cheap shape). */
export const MatchesMarker = (Command: string, Markers: readonly string[]): boolean =>
	Markers.some((Marker) => Marker.length > 0 && Command.includes(Marker));

/** Whether the command matches any selected pattern (regex allowlist; a
 * malformed pattern matches nothing - fail-open). */
export const MatchesPattern = (Command: string, Patterns: readonly string[]): boolean =>
	Patterns.some((Pattern) => {
		try {
			return new RegExp(Pattern).test(Command);
		} catch {
			return false;
		}
	});

/** The per-agent live-job count for the admission guard. */
export const LiveCount = (Agent: State, AgentId: string): number => {
	const Records = Agent.Detached.get(AgentId);
	if (Records === undefined) {
		return 0;
	}
	let Count = 0;
	for (const Record of Records.values()) {
		if (Record.status === undefined) {
			Count += 1;
		}
	}
	return Count;
};

/** The per-turn meta-budget bookkeeping (design section 6 scenario 7): the
 * meta-budget bounds the layer's automatic modifications - the detach
 * transform and the failsafe actions - per agent per turn. */
export const BudgetEntry = (
	Agent: State,
	AgentId: string,
	Turn: number,
): { turn: number; used: number } => {
	const Existing = Agent.MetaBudget.get(AgentId);
	if (Existing !== undefined && Existing.turn === Turn) {
		return Existing;
	}
	const Fresh = { turn: Turn, used: 0 };
	Agent.MetaBudget.set(AgentId, Fresh);
	return Fresh;
};

/** The per-agent failsafe meta-budget check: true when a modification may
 * proceed; false means pass-through for the rest of the turn. */
export const WithinBudget = (Agent: State, AgentId: string, Turn: number): boolean =>
	BudgetEntry(Agent, AgentId, Turn).used < Agent.FailsafesPerTurn;

/** Spend one unit of the meta-budget (call only after the action happened). */
export const SpendBudget = (Agent: State, AgentId: string, Turn: number): void => {
	BudgetEntry(Agent, AgentId, Turn).used += 1;
};

/** Whether the meta-budget just ran out (the one summary line per turn). */
export const BudgetExhausted = (Agent: State, AgentId: string, Turn: number): boolean => {
	const Entry = Agent.MetaBudget.get(AgentId);
	return Entry !== undefined && Entry.turn === Turn && Entry.used >= Agent.FailsafesPerTurn;
};

/** The fail-loud config checks (design section 2.3): mode "all" FAILS LOUD at
 * load unless allRequiresConfirm is true; liveTimeoutMs is validated against
 * the composition contract. */
export const CheckDetachConfig = (Detach: DetachConfig): void => {
	if (Detach.mode === "all" && !Detach.allRequiresConfirm) {
		throw new Error(
			'hook-dsh-live-containers: detach.mode "all" is DANGEROUS (every command-runner call detaches) and requires allRequiresConfirm: true',
		);
	}
	if (Detach.liveTimeoutMs < 1000 || Detach.liveTimeoutMs > 600000) {
		throw new Error(
			"hook-dsh-live-containers: detach.liveTimeoutMs must be >= 1000 and <= 600000 (the inline deadline is 120000 - detachment must never buy extra runtime)",
		);
	}
};

/** The full policy decision for one unmarked command-runner call (design
 * section 3.2 step 6; every guard is a pass-through + ledger, never a deny). */
export type Decision =
	{ detach: true; reason: string } | { detach: false; reason: string; ledger: string };

export const Decide = (
	Agent: State,
	AgentId: string,
	Tool: string,
	Command: string,
	Turn: number,
): Decision => {
	const Detach = Agent.Detach;
	// Capacity: maxLivePerAgent (the registry's own per-owner cap is checked by
	// the registry's start() itself).
	if (LiveCount(Agent, AgentId) >= Detach.maxLivePerAgent) {
		return { detach: false, reason: "capacity", ledger: `capacity full ${AgentId} -> inline` };
	}
	// The meta-budget (scenario 7): when exhausted, pass-through everywhere.
	// The budget is a FAILSAFE gate - with `failsafes: "off"` the CAN-1
	// transform is a feature, not a failsafe, and is not budget-gated.
	if (Agent.Failsafes === "on" && !WithinBudget(Agent, AgentId, Turn)) {
		return { detach: false, reason: "meta-budget", ledger: `failsafe meta-budget (${Turn})` };
	}
	// minLatencyMs: the call is too short to pay for the detach (estimated by
	// the same-prefix history average when one exists).
	const Average = HistoryAverage(Agent, AgentId, Command);
	if (Average !== undefined && Average < Detach.minLatencyMs) {
		return { detach: false, reason: "min-latency", ledger: "failed" };
	}
	// Interactive detection: the command needs stdin.
	if (IsInteractive(Command)) {
		return { detach: false, reason: "interactive", ledger: "failed" };
	}
	switch (Detach.mode) {
		case "long-running": {
			if (MatchesMarker(Command, Detach.longRunningMarkers)) {
				return { detach: true, reason: `marker: ${CommandPrefix(Command)}` };
			}
			if (Average !== undefined && Average >= Detach.minHistoricalMs) {
				return { detach: true, reason: `history: ${Math.round(Average)}ms avg` };
			}
			return { detach: false, reason: "not long-running", ledger: "failed" };
		}
		case "all":
			return { detach: true, reason: "mode all" };
		case "selected": {
			if (
				Detach.selectedTools.includes(Tool) ||
				MatchesPattern(Command, Detach.selectedPatterns)
			) {
				return { detach: true, reason: "selected" };
			}
			return { detach: false, reason: "not selected", ledger: "failed" };
		}
		default:
			return { detach: false, reason: "mode off", ledger: "failed" };
	}
};

/** The elapsed seconds a standing frame shows (clock-driven). */
export const ElapsedSeconds = (Agent: State, From: number): number =>
	Math.max(0, Math.round((Clock(Agent) - From) / 1000));
