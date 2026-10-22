import type RecoveryRule from "../Interface/Recovery.js";
/** The per-obligation failure behavior. */
export type Behavior = "fail-open" | "fail-closed";
/** The resolved table, one named row per obligation. */
export interface Table {
    contributes: Behavior;
    scope: Behavior;
    policy: Behavior;
    preconditions: Behavior;
}
export default _default;
declare function _default(Overrides: RecoveryRule[]): Table;
