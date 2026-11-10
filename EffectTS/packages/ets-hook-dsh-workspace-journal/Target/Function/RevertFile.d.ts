import type EntryRecord from "../Interface/Entry.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module RevertFile
 *
 * One file's replay: the per-file half of Revert.
 *
 * @remarks
 *
 * See Revert.ts for the semantics; this module holds the two replay arms
 * (the pre-image write-back and the absence unlink) and their ledger lines.
 */
declare function _default(State: State, BatchId: string, Entry: EntryRecord): Promise<Result["files"][number]>;
