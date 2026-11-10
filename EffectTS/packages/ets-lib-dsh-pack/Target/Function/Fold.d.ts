/**
 * @module Fold
 *
 * Turns one session event into a Touch, the history unit.
 *
 * @remarks
 * Only `tool/call` events count, the arguments arrive either as a JSON string
 * (parsed defensively - a malformed payload is skipped, never thrown) or as an
 * already-parsed object, and the first path-shaped field that is a non-empty
 * string names the touched file. The path is normalized (backslashes become
 * slashes, a leading `./` is stripped) so the fold can group calls by path.
 */
import type Touch from "../Interface/Touch.js";
export default _default;
declare function _default(Event: {
    readonly type?: string;
    readonly name?: string;
    readonly arguments?: unknown;
}, Seq: number): Touch | undefined;
