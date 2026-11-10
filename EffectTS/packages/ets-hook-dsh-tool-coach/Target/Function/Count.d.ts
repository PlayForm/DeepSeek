import type { AgentState, Decision, Match } from "../Interface/Execution.js";
/**
 * @module Count
 *
 * The escalation math (plan Part 3 §3.5 step 2 + the tier ladder in
 * TOOL-COACH-PLAN.md §5). Pure state transition: advances the per-agent
 * counters for one JUDGED call (terminal calls only; non-terminal tools are
 * transparent and never reach this function) and returns the decision. All
 * counters are in JUDGED calls.
 *
 * @remarks
 *
 * The state (per agent, in a WeakMap keyed like the repeat-tool-reminder's
 * chains): a sliding `window` of the last `window` judged calls (the offense
 * match or null when the call was clean), the cooldown counter sinceNote, the
 * total offense counter strikesSinceNote, the per-class offense counters
 * classStrikes (tier-3 is armed per class), the clean counter sinceClean, the
 * tier-2 flag, the tier-2 section cache, and the total judged-call clock.
 *
 * Decision precedence (per call):
 *
 *   1. a clean call while tier 2 is on: sinceClean grows; when it reaches
 *      cleanWindow the section turns OFF (tier 2 off);
 *   2. an offense: sinceClean resets, the window and all counters advance;
 *      - tier 1 note when the offense's CLASS has reached `threshold` strikes
 *        within the window AND the cooldown has elapsed since the last note
 *        (both note counters reset - the note IS the last note);
 *      - otherwise, when the class trigger is active but the cooldown has not
 *        elapsed, the call is suppressed (ledger only);
 *      - tier 2 turns ON when total offenses since the last note reach
 *        escalateThreshold (idempotent while on);
 *   3. tier 3 is armed but NOT decided here: the deny fires in the
 *      tools/pre-execute listener (before the call runs) when the offense's
 *      class has reached enforceThreshold strikes since the last note.
 */
/**
 * The per-call knobs Count reads (the live State values, already unwrapped).
 */
export interface CountConfig {
    threshold: number;
    window: number;
    cooldown: number;
    escalateThreshold: number;
    cleanWindow: number;
}
/**
 * A fresh per-agent state.
 */
export declare const FreshState: () => AgentState;
export default _default;
/**
 * Advance the state for one judged call and decide. `Match` is the offense
 * detected on THIS call, or null when the call was clean.
 */
declare function _default(State: AgentState, Match: Match | null, Config: CountConfig): Decision;
