import type { Detection, EditView, Family } from "../Interface/Execution.js";
export default _default;
/**
 * @module Detect
 *
 * The deterministic path classifier: a pure function over
 * (edit, pack) -> the ranked detections.
 *
 * @remarks
 *
 * The edit suggester's trigger shape is simpler than the search consumer's:
 * the signal source is the EDITED PATH alone (plan section 3.3: write/edit
 * calls are classified by the file_path only), so each family's rules are
 * matched against the path and the matched weights sum into the evidence.
 */
declare function _default(
/**
 * The pack: the families in priority order.
 */
Pack: Family[], 
/**
 * The current edited call.
 */
Edit: EditView): Detection[];
