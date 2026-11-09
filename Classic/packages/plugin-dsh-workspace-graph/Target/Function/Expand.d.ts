import type { EdgeKind } from "../Interface/Edge.js";
import type Expansion from "../Interface/Expansion.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(StateRef: State, Id: string, Options?: {
    kinds?: EdgeKind[];
    depth?: number;
}): Expansion;
