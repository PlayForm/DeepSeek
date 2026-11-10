import type { GraphEdge } from "@Interface/Graph.js";

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
export default (Edges: GraphEdge[], Weights: Record<string, number>): GraphEdge[] =>
	[...Edges].sort((Left, Right) => {
		const A = Weights[Left.kind] ?? 0;
		const B = Weights[Right.kind] ?? 0;
		return B - A || `${Left.from}->${Left.to}`.localeCompare(`${Right.from}->${Right.to}`);
	});
