/**
 * Whether a path exists AND is a regular file - never a bare directory, and
 * never a path the recall store remembers but the tree no longer has. The
 * recalled history's predicate (Function/Apply), exported here so the check
 * lives in ONE place; a race (the file disappears between the two calls) is a
 * miss, never a throw.
 */
export declare const IsFile: (Path: string) => boolean;
export default _default;
declare function _default(
/**
 * The companion path or glob (one of the pack's three bases).
 */
Companion: string, 
/**
 * The call path the pack is judged against (absolute or cwd-relative).
 */
CallPath: string, 
/**
 * The resolved workspace root (the gate's root).
 */
Root: string, 
/**
 * The session cwd, when the harness service exposes one.
 */
Cwd: string | undefined): boolean;
