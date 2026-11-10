import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Input: {
    operation: string;
    parent: string;
    category: Line["category"];
    path: string;
    outcome: Line["outcome"];
    assessment?: string;
}): Line;
