import type { Node, WorkspaceGraph } from "@Interface/Graph.js";
import type { PacketView } from "@Interface/Packet.js";
import type { NodeRow } from "@Interface/Query.js";
import type State from "@Interface/State.js";
/** Compact one node into the row shape the tools print. */
export declare const Row: (Node_: Node) => NodeRow;
export default _default;
declare function _default(State_: State, Graph_: WorkspaceGraph, Request: {
    id?: string;
    query?: string;
    version?: string;
}): {
    view: PacketView;
    rows: NodeRow[];
    truncated: boolean;
};
