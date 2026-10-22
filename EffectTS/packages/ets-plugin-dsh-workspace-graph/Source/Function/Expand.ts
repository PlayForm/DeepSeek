// Expand - the expand body: a breadth-first walk from the start node over
// OUTGOING edges only, kind-filtered, up to depth (default 1, capped at 3).
// nodes carries the start node first, then every reached node in visit
// order; edges carries the traversed edges. Each reachable node is visited
// once (the cycle guard), so an edge back to a visited node is not
// duplicated. Unknown ids return an empty expansion.
import type { EdgeKind } from "@Interface/Edge.js";
import type Expansion from "@Interface/Expansion.js";
import type State from "@Interface/State.js";

import GetNode from "./GetNode.js";

const DepthCap = 3;

export default (
	StateRef: State,
	Id: string,
	Options: { kinds?: EdgeKind[]; depth?: number } = {},
): Expansion => {
	const Start = GetNode(StateRef, Id);
	if (Start === undefined) {
		return { nodes: [], edges: [] };
	}
	const Depth = Math.min(Math.max(Options.depth ?? 1, 0), DepthCap);
	const Nodes = [Start];
	const Edges: Expansion["edges"] = [];
	const Seen = new Set([Id]);
	let Frontier = [Id];
	for (let Level = 0; Level < Depth; Level++) {
		const Next: string[] = [];
		for (const Current of Frontier) {
			for (const Record of StateRef.Records.values()) {
				for (const Edge of Record.edges) {
					if (Edge.from !== Current || Seen.has(Edge.to)) {
						continue;
					}
					if (Options.kinds !== undefined && !Options.kinds.includes(Edge.kind)) {
						continue;
					}
					const Target = GetNode(StateRef, Edge.to);
					if (Target === undefined) {
						continue;
					}
					Edges.push(Edge);
					Nodes.push(Target);
					Seen.add(Edge.to);
					Next.push(Edge.to);
				}
			}
		}
		Frontier = Next;
	}
	return { nodes: Nodes, edges: Edges };
};
