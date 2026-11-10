/**
 * @module Enforce
 *
 * The tier-3 deny decision (plan Part 3 §3.5 step 6), fired from the
 * tools/pre-execute listener BEFORE the terminal call runs.
 *
 * @remarks
 * Discovery and control are NEVER denied, even at enforce: "all" (plan Part 2
 * §2.4) - the deniable classes are write always, plus read and search at
 * enforce: "all".
 *
 * The deny reason is the model-facing NOTE_DENIED text (the same
 * `${command} is forbidden` phrasing as the tier-1 note) - self-teaching
 * (code-authoring/SKILL.md:73-79). A deny is also a note-equivalent
 * intervention: the note counters reset, so the next note/deny waits for a
 * fresh window of offenses. The denied call still flows through
 * tools/post-execute, where it is counted like any other offense
 * (repeat-tool-reminder README:83).
 */
import type { AgentState, Match } from "../Interface/Execution.js";
/**
 * The knobs Enforce reads (the live State values, already unwrapped).
 */
export interface EnforceConfig {
    enforce: "off" | "write" | "all";
    enforceThreshold: number;
}
export default _default;
/**
 * Decide the tier-3 deny for one detected offense. Returns true when the deny
 * FIRES (mode on, class deniable, enforce threshold reached) - the caller
 * composes the reason text from the fetched catalog and resets happen here.
 * Returns false when no deny fires (mode off, class not deniable, or the
 * enforce threshold not reached).
 */
declare function _default(State: AgentState, Match: Match, Config: EnforceConfig): boolean;
