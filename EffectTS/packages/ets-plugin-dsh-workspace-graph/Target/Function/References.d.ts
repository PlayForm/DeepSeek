import type Edge from "@Interface/Edge.js";
import type Node from "@Interface/Node.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(StateRef: State, Path: string, Text: string, Nodes: Node[]): Promise<Edge[]>;
