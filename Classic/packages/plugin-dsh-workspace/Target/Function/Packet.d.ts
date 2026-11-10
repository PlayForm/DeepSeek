/**
 * @module Packet
 *
 * The orientation packet builder: resolve the focus, assemble the PacketView,
 * rank the neighbors, and estimate the tokens against the budget.
 *
 * @remarks
 * V4-1 §3.5. The packet is the orient step of the orient -> drill -> act loop;
 * it carries the version always, so a stale view is detectable.
 *
 * HONESTY RULES (the smallest faithful readings, recorded in the SCHEME):
 *
 * - Rank order is edge-kind strength: "imports" beats "contains" (V4-1 §3.5: a
 *   call beats a reference, a test beats a mention - the W1 graph has neither
 *   calls nor references, so only imports and contains are ranked).
 * - The OPEN lines name exactly what the W1 graph cannot answer (the
 *   references/calls/tests edges are deferred to W2+ and are NOT faked).
 * - The token estimate is characters / tokenCharsPerToken - no token counter is
 *   injected in v0; the budget enforcement is honest about being an estimate.
 */
import type { Node, WorkspaceGraph } from "../Interface/Graph.js";
import type { PacketView } from "../Interface/Packet.js";
import type { NodeRow } from "../Interface/Query.js";
import type State from "../Interface/State.js";
/**
 * Compact one node into the row shape the tools print.
 */
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
