export default _default;
/**
 * @module Replace
 *
 * The spaces hook's own name for the CORE's generic class-to-string replacer,
 * pinned to its table: the THIN DELEGATE.
 *
 * @remarks
 *
 * The mechanism (the function replacer, the per-call regex construction, the
 * `{ text, count }` contract) lives in @playform/lib-dsh-core's
 * Normalize/Replace; this file supplies only the two arguments that make it
 * THE SPACES FLAVOR: the Spaces class (Unicode's Zs category minus the ASCII
 * space) and the configured replacement (default the plain ASCII space
 * U+0020).
 *
 * The core resolves through the profile's node_modules link (the package is
 * installed as a directory link there); the flavor is a table plus a closure,
 * not a fork of the dispatch.
 */
declare function _default(Text: string, Replacement: string): {
    text: string;
    count: number;
};
