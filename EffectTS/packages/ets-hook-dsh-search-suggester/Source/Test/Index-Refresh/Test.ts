// Source/Test/Index-Refresh/Test.ts - the plan's suite 7 (Index-Refresh),
// re-specified onto the P2 graph projection: the projection is built once per
// apply, reused across calls, rebuilt on `tools/change` while `refreshOnBoot`
// holds, frozen when it does not, and re-probed while the graph is empty. The
// suite asserts the SNAPSHOT CALL COUNTS (the refresh evidence) and the
// note's order before and after a re-index.
//
// THE CANDIDATES COME FROM THE SESSION HISTORY: the anchor and its two
// companions are seeded per agent, and the graph proves (or fails to prove)
// the companions.
import assert from "node:assert/strict";
import {
	AgentOf,
	CheckAsync,
	FakeGraph,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Post,
	rm,
	SeedHistory,
	Setup,
	Validate,
	Workspace,
} from "../Harness.js";

/** The judged call's anchor path (relative to the temp workspace). */
const Anchor = "README.md";

/** The two companions touched right after the anchor. */
const Companions = ["CHANGELOG.md", "package.json"];

/** The temp workspace the scenarios judge. */
const Space = Workspace([Anchor, ...Companions]);

/** One judged read of the anchor. */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

/** The byte-exact note the neutral (no graph) path emits. */
const Neutral =
	"[search-suggester] intent=History confidence=0.87\ntargets (2):\n- CHANGELOG.md - touched 1 time(s) after a similar call\n- package.json - touched 1 time(s) after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: build once, reuse.
	{
		rm();
		const Graph = FakeGraph([{ path: "package.json", kind: "File", version: "1" }]);
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.workspaceGraph = Graph;
		});
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		SeedHistory(Run, "b", Space.At(Anchor), Companions);
		await CheckAsync(Count, "R1: the projection is built once and reused", async () => {
			assert.equal(Graph.Calls.snapshots, 1);
			await Post(Run, Read("a"));
			await Post(Run, Read("b"));
			assert.equal(Graph.Calls.snapshots, 1);
		});
	}

	// Group R2: the tools/change rebuild and the changed snapshot.
	{
		rm();
		const Nodes = [{ path: "package.json", kind: "File", version: "1" }];
		const Graph = FakeGraph(Nodes);
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.workspaceGraph = Graph;
		});
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		SeedHistory(Run, "b", Space.At(Anchor), Companions);
		const Before = await Post(Run, Read("a"));
		await CheckAsync(Count, "R2: the first projection leads with the only proven path", async () => {
			const Text = Before.additionalContexts[0].content[0].text;
			assert.equal(
				Text.startsWith(
					"[search-suggester] intent=History confidence=0.87\ntargets (2):\n- package.json - touched 1 time(s) after a similar call",
				),
				true,
			);
		});
		await CheckAsync(Count, "R2: tools/change invalidates the projection lazily", async () => {
			Nodes.push({ path: "CHANGELOG.md", kind: "File", version: "2" });
			Run.CtxListeners["tools/change"]();
			// The invalidation is a cache drop; the rebuild happens on the
			// next read, never inside the tools/change emit.
			assert.equal(Graph.Calls.snapshots, 1);
		});
		await CheckAsync(Count, "R2: the rebuilt projection reflects the re-indexed graph", async () => {
			const Out = await Post(Run, Read("b"));
			assert.equal(Graph.Calls.snapshots, 2);
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text.startsWith(
					"[search-suggester] intent=History confidence=0.87\ntargets (2):\n- CHANGELOG.md - touched 1 time(s) after a similar call",
				),
				true,
			);
		});
	}

	// Group R3: refreshOnBoot=false freezes the projection.
	{
		rm();
		const Nodes = [{ path: "package.json", kind: "File", version: "1" }];
		const Graph = FakeGraph(Nodes);
		const Run = Make(
			Validate({ logFile: Ledger, enabled: true, refreshOnBoot: false }),
			(Context: any) => {
				Context.workspaceGraph = Graph;
			},
		);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		SeedHistory(Run, "b", Space.At(Anchor), Companions);
		await Post(Run, Read("a"));
		await CheckAsync(Count, "R3: a frozen projection is not rebuilt on tools/change", async () => {
			Nodes.push({ path: "CHANGELOG.md", kind: "File", version: "2" });
			Run.CtxListeners["tools/change"]();
			assert.equal(Graph.Calls.snapshots, 1);
			const Out = await Post(Run, Read("b"));
			assert.equal(
				Out.additionalContexts[0].content[0].text.startsWith(
					"[search-suggester] intent=History confidence=0.87\ntargets (2):\n- package.json - touched 1 time(s) after a similar call",
				),
				true,
			);
		});
	}

	// Group R4: an empty snapshot is re-probed.
	{
		rm();
		const Graph = FakeGraph([]);
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.workspaceGraph = Graph;
		});
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "R4: an empty graph is re-probed on every read", async () => {
			assert.equal(Graph.Calls.snapshots, 1);
			await Post(Run, Read("a"));
			await Post(Run, Read("a"));
			assert.equal(Graph.Calls.snapshots, 3);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 1);
		});
	}

	// Group R5: no graph at all.
	{
		const Run = Setup();
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "R5: without a service the note is the neutral one", async () => {
			const Out = await Post(Run, Read("a"));
			assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
			assert.deepEqual(Run.Warns, []);
		});
	}

	return Finish(Count, "Index-Refresh");
};

// Standalone entry: `node Target/Test/Index-Refresh/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Index-Refresh`);
}
