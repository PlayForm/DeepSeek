/**
 * @module Select
 *
 * The adapter lookup for one path: the exact BASENAME first, then the
 * extension.
 *
 * @remarks
 * The exact BASENAME is checked first (the file adapters - package.json - win
 * over their extension), then the lowercase dotted extension. The returned key
 * is the registry key that matched, so the caller can look the deepener up
 * under the same extension; the suffix is the path's extension ("" when there
 * is none) for the byte-exact
 * `refused <path> (no adapter for <suffix>)` line.
 */
import type Adapter from "../Interface/Adapter.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Path: string): {
    Adapter: Adapter | undefined;
    Key: string;
    Suffix: string;
};
