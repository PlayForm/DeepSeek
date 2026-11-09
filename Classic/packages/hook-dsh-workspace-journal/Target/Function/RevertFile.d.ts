import type EntryRecord from "@Interface/Entry.js";
import type Result from "@Interface/Result.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, BatchId: string, Entry: EntryRecord): Promise<Result["files"][number]>;
