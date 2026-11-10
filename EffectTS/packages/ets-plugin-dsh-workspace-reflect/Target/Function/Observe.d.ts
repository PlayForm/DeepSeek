import type Reply from "../Interface/Reply.js";
import type State from "../Interface/State.js";
/**
 * @module Observe
 *
 * The pre-operation read: resolve the path through ctx.fs, stat it, read its
 * text, and hand the caller the exact pieces every reflective op needs.
 *
 * @remarks
 *
 * The pieces are the resolved target (for the guarded write), the observed
 * version (the fence basis), the text lines, and the size guard. A missing
 * file or an oversized file is a `rejected` reply, never a fabricated empty
 * read.
 */
interface Observed {
    target: unknown;
    version: string;
    lines: string[];
}
export default _default;
declare function _default(State: State, Path: string): Promise<{
    Ok: true;
    Observed: Observed;
} | {
    Ok: false;
    Reply: Reply;
}>;
