import type State from "@Interface/State.js";
import type { DetachConfig } from "@Interface/State.js";
/** The permanently non-detachable content-mutating family (I1 12.1, HARD -
 * hardcoded, never config; rejected even under "all" and "selected"). */
export declare const NON_DETACHABLE: readonly string[];
/** The command-runner family the transform wraps by default (I1 12.1: bash,
 * pwsh, and the family whose Exec is a spawned subprocess; this harness ships
 * the bash tool, so the base set is bash - selectedTools may add more). */
export declare const COMMAND_RUNNERS: readonly string[];
/** The inline-deadline cap liveTimeoutMs must respect (the I1 12.2 rule keyed
 * on the bash executor's inline default). */
export declare const INLINE_DEADLINE_MS = 120000;
/** Whether the tool belongs to the permanently non-detachable family. */
export declare const IsNonDetachable: (Tool: string) => boolean;
/** Whether the tool is a command runner the producer can re-dispatch: the
 * hardcoded base family, or a tool the "selected" allowlist names (the
 * non-detachable family is rejected BEFORE this is ever consulted). */
export declare const IsDetachableTool: (Tool: string, Detach: DetachConfig) => boolean;
/** The conservative interactive detector (01 section 9 edge case 2): a
 * command that reads from stdin without a redirected source cannot run in a
 * background ring - inline. */
export declare const IsInteractive: (Command: string) => boolean;
/** The dedup key (design section 5.2): (agent id, normalized command, resolved
 * workdir). Normalized = trim + collapse runs of whitespace + strip leading
 * `cd x && ` prefixes whose target equals the resolved workdir. */
export declare const DedupKey: (AgentId: string, Command: string, Workdir: string | undefined) => string;
/** The command prefix the long-running history keys on (the first two words:
 * `cargo build`, `npm install` - cheap and pure-observer). */
export declare const CommandPrefix: (Command: string) => string;
/** Record one inline command's duration into the per-agent, per-prefix history
 * (the wave-2 observer feeding the long-running heuristic; an awaited call's
 * duration is recorded like any inline call - the I2 7.7 honesty rule, no
 * marker-based exclusion). */
export declare const RecordDuration: (Agent: State, AgentId: string, Command: string, Ms: number) => void;
/** The same-prefix history average (undefined when no history). */
export declare const HistoryAverage: (Agent: State, AgentId: string, Command: string) => number | undefined;
/** Whether the command matches any long-running marker (substring match on
 * the command line, the I1 heuristic's cheap shape). */
export declare const MatchesMarker: (Command: string, Markers: readonly string[]) => boolean;
/** Whether the command matches any selected pattern (regex allowlist; a
 * malformed pattern matches nothing - fail-open). */
export declare const MatchesPattern: (Command: string, Patterns: readonly string[]) => boolean;
/** The per-agent live-job count for the admission guard. */
export declare const LiveCount: (Agent: State, AgentId: string) => number;
/** The per-turn meta-budget bookkeeping (design section 6 scenario 7): the
 * meta-budget bounds the layer's automatic modifications - the detach
 * transform and the failsafe actions - per agent per turn. */
export declare const BudgetEntry: (Agent: State, AgentId: string, Turn: number) => {
    turn: number;
    used: number;
};
/** The per-agent failsafe meta-budget check: true when a modification may
 * proceed; false means pass-through for the rest of the turn. */
export declare const WithinBudget: (Agent: State, AgentId: string, Turn: number) => boolean;
/** Spend one unit of the meta-budget (call only after the action happened). */
export declare const SpendBudget: (Agent: State, AgentId: string, Turn: number) => void;
/** Whether the meta-budget just ran out (the one summary line per turn). */
export declare const BudgetExhausted: (Agent: State, AgentId: string, Turn: number) => boolean;
/** The fail-loud config checks (design section 2.3): mode "all" FAILS LOUD at
 * load unless allRequiresConfirm is true; liveTimeoutMs is validated against
 * the composition contract. */
export declare const CheckDetachConfig: (Detach: DetachConfig) => void;
/** The full policy decision for one unmarked command-runner call (design
 * section 3.2 step 6; every guard is a pass-through + ledger, never a deny). */
export type Decision = {
    detach: true;
    reason: string;
} | {
    detach: false;
    reason: string;
    ledger: string;
};
export declare const Decide: (Agent: State, AgentId: string, Tool: string, Command: string, Turn: number) => Decision;
/** The elapsed seconds a standing frame shows (clock-driven). */
export declare const ElapsedSeconds: (Agent: State, From: number) => number;
