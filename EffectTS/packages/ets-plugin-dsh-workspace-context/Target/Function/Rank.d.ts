import type { GraphEdge } from "@Interface/Graph.js";
export default _default;
/**
 * @module Rank
 *
 * The edge-strength ranking over the module-owned weight table.
 *
 * @remarks
 *
 * Sort the graph's edges by the module-owned weight table
 * (Variable/EdgeWeight), strongest first, ties broken by the edge's
 * "from -> to" text for determinism. Unknown edge kinds rank weakest (0)
 * and are never silently promoted.
 */
declare function _default(Edges: GraphEdge[], Weights: Record<string, number>): GraphEdge[];
