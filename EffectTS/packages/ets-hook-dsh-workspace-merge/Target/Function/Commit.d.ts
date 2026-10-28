import type Batch from "../Interface/Batch.js";
import type Commit from "../Interface/Commit.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Request: Batch): Promise<Commit>;
