// Carry - the reflective carry (Function/Carry): after an applied operation,
// ask the optional `workspaceGraph` sibling service to re-index the changed
// file, so the graph's representation stays current (the State:State ->
// State:Operational reference case of the family map's phase 6).
//
// THE GRAPH IS NEVER INJECTED: it is probed at use time through the generic
// `ctx.get` fetch (a service accessor without the `inject` declaration
// throws - live-verified in the factory - while `ctx.get` returns undefined
// for an absent service). The graph handle's shape is the SELF-DECLARED
// Interface/Graph.ts (the WAVE-1-BRIEF frozen contract, section 4.3).
//
// Contained by construction: an absent graph is a silent skip (the operation
// is already complete; only the carry does not run), a graph failure is
// swallowed after one ledger line - the applied write is never undone by a
// failed carry.
import type GraphHandle from "@Interface/Graph.js";
import type State from "@Interface/State.js";

export default async (State: State, Path: string): Promise<void> => {
	try {
		const Graph = (await Promise.resolve(
			(State.Context as { get?: (name: string) => unknown }).get?.("workspaceGraph"),
		)) as GraphHandle | undefined;
		if (Graph === undefined || typeof Graph.indexFile !== "function") {
			return;
		}
		await Graph.indexFile(Path);
		State.Factory.Append(State, `carried ${Path} (graph reindexed)`);
	} catch (Cause) {
		State.Factory.Append(
			State,
			`failed ${Path} (carry: ${Cause instanceof Error ? Cause.message : String(Cause)})`,
		);
	}
};
