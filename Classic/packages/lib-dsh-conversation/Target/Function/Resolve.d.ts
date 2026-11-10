/**
 * @module Resolve
 *
 * The shared touch resolution: one `tool/call`'s name and arguments become the
 * file touches it performs, in argument order, resolved against the session's
 * working directory and normalized.
 *
 * @remarks
 *
 * A tool the vocabulary does not map and a malformed or alien arguments value
 * yield no touches; the parser never throws.
 *
 * Both `Function/Fold` and `Function/Emits` import this one module, so the
 * rule lives here alone.
 *
 * It is pure: `node:path` reads no filesystem, and a relative path with no
 * session cwd resolves to nothing (never the process's own cwd).
 */
type Kind = "read" | "write" | "edit" | "delete" | "search";
type Touched = {
    Path: string;
    Kind: Kind;
};
export default _default;
declare function _default(Name: string, Arguments: unknown, Cwd: string): readonly Touched[];
