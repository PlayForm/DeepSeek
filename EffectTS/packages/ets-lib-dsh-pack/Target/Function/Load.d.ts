/**
 * @module Load
 *
 * Memoizes Resolve by (home, root): one pack per key, read once and shared by
 * every call.
 *
 * @remarks
 * The suggester family resolves per workspace root on the hot path, so the
 * memo is what keeps a pack read off it; a pack edit lands on the next process
 * by contract (a boot-time memo, not a watcher).
 */
import type Options from "../Interface/Options.js";
import type Pack from "../Interface/Pack.js";
export default _default;
declare function _default(Root: string, Options?: Options): Pack;
