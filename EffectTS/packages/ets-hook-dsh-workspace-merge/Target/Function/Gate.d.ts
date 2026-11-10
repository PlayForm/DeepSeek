/**
 * @module Gate
 *
 * THE ATOMIC GATES: the preflight that runs before ANY write.
 *
 * @remarks
 * Every gate failure rejects the whole batch (in all-or-nothing mode) or is
 * reported per-file (survivors mode) - the gate never lets a partial batch
 * start silently.
 *
 * The gates, in frozen order:
 *   1. empty batch;
 *   2. the batch size (maxFiles);
 *   3. the batch bytes (maxTotalBytes);
 *   4. duplicate paths;
 *   5. a missing version fence (the merge never writes unfenced);
 *   6. per file: resolve through ctx.fs (unresolved = reject) and stat the
 *      observed version (a fence mismatch is a conflict; in
 *      all-or-nothing mode any conflict rejects the whole batch).
 */
import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Operation from "../Interface/Operation.js";
import type State from "../Interface/State.js";
/**
 * One operation's resolved gate state.
 */
export interface GatedFile {
    path: string;
    target: FsTarget;
    expected: string;
    observed: string;
    bytes: number;
    conflict: boolean;
}
/**
 * The gate's verdict: ok, or the reject reason.
 */
export interface GateResult {
    ok: boolean;
    reason?: string;
    files: GatedFile[];
}
export default _default;
declare function _default(State: State, Operations: Operation[]): Promise<GateResult>;
