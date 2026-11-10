import type { Detection, DocView, Family } from "../Interface/Execution.js";
export default _default;
/**
 * @module Detect
 *
 * The deterministic path classifier: a pure function over
 * (docCall, pack) -> the ranked detections.
 *
 * @remarks
 *
 * The doc suggester's trigger shape is the doc path the call names (the read
 * file_path, the grep path/include, the edited path), so each family's rules
 * are matched against that path and the matched weights sum into the
 * evidence.
 */
declare function _default(
/**
 * The pack: the families in priority order.
 */
Pack: Family[], 
/**
 * The current doc-task call.
 */
Call: DocView): Detection[];
