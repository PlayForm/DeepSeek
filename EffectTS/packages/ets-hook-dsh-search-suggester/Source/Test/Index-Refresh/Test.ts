// Source/Test/Index-Refresh/Test.ts - the plan's suite 7 (Index-Refresh),
// re-specified onto the P2 graph projection: the projection is built once
// per apply, reused across calls, rebuilt on `tools/change` while
// `refreshOnBoot` holds, frozen when it does not, and re-probed while the
// graph is empty. The suite asserts the SNAPSHOT CALL COUNTS (the refresh
// evidence) and the note's order before and after a re-index.
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
	Setup,
	Validate,
} from "../Harness.js";

/** The strong Version emit call: a grep whose pattern and path both match. */
const StrongVersion = (Id: string): any => ({
	name: "grep",
	arguments: { pattern: "1.2.3 version", path: "package.json" },
	agent: AgentOf(Id),
});

/** The byte-exact note the legacy (no graph) path emits. */
const Neutral =
	"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- Classic/packages/*/package.json - the Classic manifests\n- EffectTS/packages/*/package.json - the EffectTS manifests\n- Site/Source/Library/Content.ts - the site release constant\n- CHANGELOG.md - the new section\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\nnote: open these before more searches; Target/ is generated, never edit it.";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: build once, reuse.
	{
		rm();
		const Nodes = [{ path: "package.json", kind: "File", version: "1" }];
		const Graph = FakeGraph(Nodes);
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.workspaceGraph = Graph;
		});
		await CheckAsync(Count, "R1: the projection is built once and reused", async () => {
			assert.equal(Graph.Calls.snapshots, 1);
			await Post(Run, StrongVersion("a"));
			await Post(Run, StrongVersion("b"));
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
		const Before = await Post(Run, StrongVersion("a"));
		await CheckAsync(Count, "R2: the first projection leads with the only proven path", async () => {
			const Text = Before.additionalContexts[0].content[0].text;
			assert.equal(
				Text.startsWith(
					"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest",
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
			const Out = await Post(Run, StrongVersion("b"));
			assert.equal(Graph.Calls.snapshots, 2);
			const Text = Out.additionalContexts[0].content[0].text;
			assert.equal(
				Text.startsWith(
					"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- CHANGELOG.md - the new section\n- package.json - the monorepo manifest",
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
		await Post(Run, StrongVersion("a"));
		await CheckAsync(Count, "R3: a frozen projection is not rebuilt on tools/change", async () => {
			Nodes.push({ path: "CHANGELOG.md", kind: "File", version: "2" });
			Run.CtxListeners["tools/change"]();
			assert.equal(Graph.Calls.snapshots, 1);
			const Out = await Post(Run, StrongVersion("b"));
			assert.equal(
				Out.additionalContexts[0].content[0].text.startsWith(
					"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest",
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
		await CheckAsync(Count, "R4: an empty graph is re-probed on every read", async () => {
			assert.equal(Graph.Calls.snapshots, 1);
			await Post(Run, StrongVersion("a"));
			await Post(Run, StrongVersion("a"));
			assert.equal(Graph.Calls.snapshots, 3);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 1);
		});
	}

	// Group R5: no graph at all.
	{
		const Run = Setup();
		await CheckAsync(Count, "R5: without a service the note is the neutral one", async () => {
			const Out = await Post(Run, StrongVersion("a"));
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
