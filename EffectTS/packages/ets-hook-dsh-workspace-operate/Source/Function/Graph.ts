// Graph - the probe-once workspaceGraph seam (Function/Graph): the
// resolution rules' data source. The service is probed through
// `ctx.get("workspaceGraph")` exactly once per State lifetime and cached in
// State.Graph; an ABSENT service is a legitimate state (the graph package
// may not be mounted) - the rules answer with the `graph-unavailable`
// refusal, they never guess without the graph. A PRESENT service that
// fails the structural shape check is treated as absent for the same
// reason: a half-mounted graph is worse than an honest refusal.
import type { GraphHandle } from "@Interface/Graph.js";
import type State from "@Interface/State.js";

/** The structural shape check (the three methods the rules call). */
const LooksReal = (Candidate: unknown): Candidate is GraphHandle => {
	const Shape = Candidate as Partial<GraphHandle> | null;
	return (
		Shape !== null &&
		typeof Shape === "object" &&
		typeof Shape.find === "function" &&
		typeof Shape.expand === "function" &&
		typeof Shape.snapshot === "function"
	);
};

export default (State: State): GraphHandle | undefined => {
	switch (true) {
		case State.Graph !== undefined:
			return State.Graph;
		default:
	}
	try {
		const Candidate = (
			State.Context as unknown as {
				get?: (name: string) => unknown;
			}
		).get?.("workspaceGraph");
		if (LooksReal(Candidate)) {
			State.Graph = Candidate;
			return Candidate;
		}
		return undefined;
	} catch {
		return undefined;
	}
};
