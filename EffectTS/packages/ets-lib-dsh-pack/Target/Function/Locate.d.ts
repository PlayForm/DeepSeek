import type Located from "../Interface/Located.js";
import type Options from "../Interface/Options.js";
export default _default;
declare function _default(
/** The call path (absolute or workspace-relative). */
Path: string, 
/** The session cwd, when the harness service exposes one. */
Cwd?: string, 
/** The resolution seam (a smoke's temporary home). */
Options?: Options): Located | undefined;
