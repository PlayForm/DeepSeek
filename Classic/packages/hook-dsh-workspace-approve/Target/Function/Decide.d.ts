import type Binding from "../Interface/Binding.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Id: string, Action: "approve" | "deny" | "revoke", Who: string, Constraints: string[] | undefined): Binding | undefined;
