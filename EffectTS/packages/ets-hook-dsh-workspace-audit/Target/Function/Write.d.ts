import type Line from "../Interface/Line.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Write
 *
 * The line-recording path: build the AuditLine, assign the id/sequence,
 * ledger it, and persist it.
 *
 * @remarks
 *
 * Builds the AuditLine from the caller's input, assigns the monotonic
 * id/sequence, ledgers it, and persists it (Function/Record). This is the
 * ONE path every line takes - the listener's and the service's - so the id
 * format and the ledger line format have exactly one definition.
 *
 * The ledger line format (module-owned, byte-stable):
 *   audit <category> <operation> (<outcome>) <path>
 *   with an assessment suffix for intent-assessment lines:
 *   audit intent-assessment <operation> (satisfied|unsatisfied) <assessment>
 */
declare function _default(State: State, Input: {
    operation: string;
    parent: string;
    category: Line["category"];
    path: string;
    outcome: Line["outcome"];
    assessment?: string;
}): Line;
