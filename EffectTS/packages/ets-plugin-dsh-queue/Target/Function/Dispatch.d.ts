import { MAIN } from "@Function/Capacity.js";
import { type Settle } from "@Function/Spawn.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Agent: string, Append: (Message: string) => void, Settle?: Settle): import("../Interface/Task").default | undefined;
export { MAIN };
