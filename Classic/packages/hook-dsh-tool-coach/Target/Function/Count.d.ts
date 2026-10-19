import type { AgentState, Decision, Match } from "../Interface/Execution.js";
/** The per-call knobs Count reads (the live State values, already unwrapped). */
export interface CountConfig {
    threshold: number;
    window: number;
    cooldown: number;
    escalateThreshold: number;
    cleanWindow: number;
}
/** A fresh per-agent state. */
export declare const FreshState: () => AgentState;
export default _default;
/**
 * Advance the state for one judged call and decide. `Match` is the offense
 * detected on THIS call, or null when the call was clean.
 */
declare function _default(State: AgentState, Match: Match | null, Config: CountConfig): Decision;
