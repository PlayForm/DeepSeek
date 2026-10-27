import type { GatedFile } from "./Gate.js";
import type Operation from "../Interface/Operation.js";
import type Reply from "../Interface/Reply.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Op: Operation, File: GatedFile): Promise<Reply>;
