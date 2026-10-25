import type { AgentState, Match } from "../Interface/Execution.js";
/** The knobs Enforce reads (the live State values, already unwrapped). */
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
