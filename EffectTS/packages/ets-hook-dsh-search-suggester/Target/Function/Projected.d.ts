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
