import type { GatedFile } from "./Gate.js";
import type Operation from "../Interface/Operation.js";
import type Reply from "../Interface/Reply.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module CommitOne
 *
 * One per-file commit through the factory's WRITE EXECUTOR.
 *
 * @remarks
 *
 * The write carries the explicit replaceIfVersion intent (the waterfall
 * skipped), the P4 sandbox fence, and the root-context fs/observed emit -
 * the factory's own guarded path. After the write the file is read back and
 * compared to the intended content: equal -> applied; not equal -> conflict
 * (the preview-mismatch arm of the v4.1 conflict rule). A thrown write is
 * classified honestly: a sandbox/policy refusal -> denied; a version
 * failure -> conflict (with expected/observed); anything else ->
 * outcome-unknown, never a guess.
 */
declare function _default(State: State, Op: Operation, File: GatedFile): Promise<Reply>;
