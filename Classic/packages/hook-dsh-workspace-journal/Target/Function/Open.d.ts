import type BatchRecord from "../Interface/Batch.js";
import type EntryRecord from "../Interface/Entry.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Batch: BatchRecord, Entries: EntryRecord[]): Promise<void>;
