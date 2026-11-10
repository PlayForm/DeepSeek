import type Stamp from "../Interface/Stamp.js";
export default _default;
/**
 * @module IsStamp
 *
 * The `observe/stamp` payload guard: a non-empty path, a version and an
 * origin, all strings.
 *
 * @remarks
 *
 * The graph's adapter accepts only a guarded stamp, so a malformed payload is
 * ignored and never guessed into a re-index.
 */
declare function _default(Value: unknown): Value is Stamp;
