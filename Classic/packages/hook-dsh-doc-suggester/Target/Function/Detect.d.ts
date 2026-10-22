import type { Detection, DocView, Family } from "../Interface/Execution.js";
export default _default;
declare function _default(
/** The pack: the families in priority order. */
Pack: Family[], 
/** The current doc-task call. */
Call: DocView): Detection[];
