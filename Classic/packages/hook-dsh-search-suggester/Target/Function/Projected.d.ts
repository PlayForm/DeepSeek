/**
 * @module Projected
 *
 * The projected index: the top graph paths for one intent, the list the sticky section
 * renders in place of the static pack targets.
 *
 * @remarks
 * This is the P2 re-spec: the section carries the projection, not the hand list. The rows are
 * the intent's candidates measured against the graph (Function/Measure): a candidate the
 * graph cannot prove is not in the index, a literal target contributes the concrete node
 * path(s) it resolves to (a package-relative `Source/Variable/Config.ts` resolves once per
 * package the graph indexed), and a glob contributes every matched path. The rows are ordered
 * by the projected score (scope + literal), then by the pack's own order; the limit is the
 * caller's (maxCandidates).
 *
 * `undefined` means the graph proved none of the intent's candidates: the caller falls back
 * to the static pack list (the documented neutral behavior). The count is rendered only when
 * a row aggregates several matched paths (the family-row convention of Function/Note).
 */
import type { Intent } from "../Interface/Execution.js";
import type Projection from "../Interface/Projection.js";
/** One projected index row. */
export interface Row {
    /** The concrete graph path. */
    path: string;
    /** The pack candidate's reason phrase. */
    reason: string;
    /** The number of matched paths this row aggregates (omitted when 1). */
    count?: number;
}
export default _default;
declare function _default(
/** The built projection (Function/Projection). */
Projection: Projection, 
/** The intent whose index is projected. */
Intent: Intent, 
/** The maximum rows (the caller's maxCandidates). */
Limit: number): Row[] | undefined;
