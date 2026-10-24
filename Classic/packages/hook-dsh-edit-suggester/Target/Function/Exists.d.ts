export default _default;
declare function _default(
/** The companion path or glob (one of the pack's three bases). */
Companion: string, 
/** The call path the pack is judged against (absolute or cwd-relative). */
CallPath: string, 
/** The resolved workspace root (the gate's root). */
Root: string, 
/** The session cwd, when the harness service exposes one. */
Cwd: string | undefined): boolean;
