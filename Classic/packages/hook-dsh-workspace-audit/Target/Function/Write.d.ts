import type Line from "../Interface/Line.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Write
 *
 * The line-recording path: build the AuditLine from the caller's input,
 * assign the monotonic id/sequence, ledger it, and persist it (Function/
 * Record).
 *
 * @remarks
 *
 * This is the ONE path every line takes - the listener's and the service's -
 * so the id format and the ledger line format have exactly one definition.
 *
 * The ledger line format (module-owned, byte-stable):
 *
 * - `audit <category> <operation> (<outcome>) <path>`;
 * - with an assessment suffix for intent-assessment lines:
 *   `audit intent-assessment <operation> (satisfied|unsatisfied)
 *   <assessment>`.
 */
declare function _default(State: State, Input: {
    operation: string;
    parent: string;
    category: Line["category"];
    path: string;
    outcome: Line["outcome"];
    assessment?: string;
}): Line;
