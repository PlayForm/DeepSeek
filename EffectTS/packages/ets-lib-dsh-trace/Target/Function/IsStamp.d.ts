import type Stamp from "../Interface/Stamp.js";
export default _default;
/**
 * @module IsStamp
 *
 * Guards the `observe/stamp` payload: a non-empty path, a version and an
 * origin, all strings.
 *
 * @remarks
 *
 * The graph's adapter accepts only a guarded stamp - a malformed payload is
 * ignored (never guessed into a re-index).
 */
declare function _default(Value: unknown): Value is Stamp;
