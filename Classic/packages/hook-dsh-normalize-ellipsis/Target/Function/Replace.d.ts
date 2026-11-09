export default _default;
/**
 * @module Replace
 *
 * The THIN DELEGATE: the ellipsis hook's own name for the CORE's generic
 * class-to-string replacer, pinned to its table.
 *
 * @remarks
 * The mechanism (the function replacer, the per-call regex construction, the
 * `{ text, count }` contract) lives in `@playform/lib-dsh-core`'s
 * `Normalize/Replace`; this file supplies only the two arguments that make it
 * THE ELLIPSIS FLAVOR: the Ellipsis class (the one-member U+2026 horizontal
 * ellipsis class) and the configured replacement (default the ASCII "..."
 * three-dot sequence).
 *
 * The core resolves through the profile's `node_modules` link (the package is
 * installed as a directory link there); the flavor is a table plus a closure,
 * not a fork of the dispatch.
 */
declare function _default(Text: string, Replacement: string): {
    text: string;
    count: number;
};
