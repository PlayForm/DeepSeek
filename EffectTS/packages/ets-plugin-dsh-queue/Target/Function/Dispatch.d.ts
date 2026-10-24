import { MAIN } from "./Capacity.js";
import { type Settle } from "./Spawn.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Agent: string, Append: (Message: string) => void, Settle?: Settle): import("../Interface/Task.js").default | undefined;
export { MAIN };
