import type State from "../Interface/State.js";
export default _default;
declare function _default<Decision>(Payload: unknown, Next: () => Promise<Decision>, State: State): Promise<Decision>;
