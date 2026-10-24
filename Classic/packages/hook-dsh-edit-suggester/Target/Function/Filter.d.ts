import type { Detection } from "../Interface/Execution.js";
export default _default;
declare function _default(
/** The ranked detections (Detect's output). */
Detections: Detection[], 
/** The call path the pack is judged against. */
CallPath: string, 
/** The resolved workspace root (the gate's root). */
Root: string, 
/** The session cwd, when the harness service exposes one. */
Cwd: string | undefined): Detection[];
