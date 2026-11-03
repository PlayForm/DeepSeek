// Source/Test/Projection/Test.ts - the P2 GRAPH PROJECTION against the fake
// ctx and a fake workspaceGraph: the projected candidate scoring (the note's
// order changes when the graph proves the candidates), the byte-exact
// neutral fallback when the graph is absent, the projected sticky section,
// the kind test, the depth test, and the no-new-ledger-string rule.
//
// THE CANDIDATES COME FROM THE SESSION HISTORY: every scenario commits the
// agent's history through the projection drive (the anchor and its companions
// as `tool/call` events), and the graph then proves (or fails to prove) those
// companion paths.
import assert from "node:assert/strict";
import {
	AgentOf,
	Assemble,
	CheckAsync,
	Durable,
	DurableLine,
	FakeGraph,
	Finish,
	Ledger,
	LedgerWith,
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

/** The companions the scenarios prove against the graph. */
const Companions = ["CHANGELOG.md", "SCHEME.md"];

/** The temp workspace the scenarios judge (every companion exists). */
const Space = Workspace([
	Anchor,
	...Companions,
	"package.json",
	"Source/Function/Apply.ts",
]);

/** One judged read of the anchor. */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

/** The byte-exact note the neutral (no graph) path emits. */
const Neutral =
	"[search-suggester] intent=History confidence=0.87\ntargets (2):\n- CHANGELOG.md - touched 1 time(s) after a similar call\n- SCHEME.md - touched 1 time(s) after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";

/** The byte-exact note a graph that proves the recency order emits. */
const Projected =
	"[search-suggester] intent=History confidence=0.87\ntargets (2):\n- SCHEME.md - touched 1 time(s) after a similar call\n- CHANGELOG.md - touched 1 time(s) after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group J1: the projection drives the note.
	{
		rm();
		const Run = Make(
			Validate({ logFile: Ledger, enabled: true }),
			(Context: any) => {
				Context.workspaceGraph = FakeGraph([
					{ path: "CHANGELOG.md", kind: "File", version: "1" },
					{ path: "SCHEME.md", kind: "File", version: "2" },
				]);
			},
		);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "J1: the projected note leads with the newer proven path", async () => {
			const Out = await Post(Run, Read("a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.equal(Out.additionalContexts[0].content[0].text, Projected);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "J1: the projection adds no ledger string", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"));
			assert.equal(LedgerWith("suggest History 0.87 2 candidates").length, 1);
			assert.match(
				DurableLine("suggest History 0.87 2 candidates"),
				Durable("suggest History 0.87 2 candidates"),
			);
			// The activation and the suggest line are the only lines: no
			// projection/index line was introduced.
			assert.deepEqual(Run.Lines, [
				`hook-dsh-search-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`,
				"hook-dsh-search-suggester: suggest History 0.87 2 candidates",
			]);
		});
	}

	// Group J2: the neutral fallback (no graph).
	{
		const Run = Setup();
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "J2: without a graph the note is the neutral one", async () => {
			const Out = await Post(Run, Read("a"));
			assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
		});
	}

	// Group J3: the projected sticky section.
	{
		rm();
		const Sticky = Make(
			Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }),
			(Context: any) => {
				Context.workspaceGraph = FakeGraph([
					{ path: "CHANGELOG.md", kind: "File", version: "1" },
					{ path: "SCHEME.md", kind: "File", version: "2" },
				]);
			},
		);
		SeedHistory(Sticky, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "J3: the sticky section renders the projected index", async () => {
			await Post(Sticky, Read("a"));
			const Out = await Assemble(Sticky, AgentOf("a"));
			assert.deepEqual(Out.sections.map((Section: any) => Section.name), [
				"base",
				"hook-dsh-search-suggester",
			]);
			assert.equal(
				Out.sections[1].text,
				"[search-suggester] intent=History confidence=1.00\ntargets (2):\n- SCHEME.md - touched after a similar call\n- CHANGELOG.md - touched after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.",
			);
		});
		await CheckAsync(Count, "J3: the section stays gated by the enabled state", async () => {
			rm();
			const Off = Make(
				Validate({ logFile: Ledger, enabled: false, sectionMode: "sticky" }),
				(Context: any) => {
					Context.workspaceGraph = FakeGraph([
						{ path: "CHANGELOG.md", kind: "File", version: "1" },
					]);
				},
			);
			const Out = await Assemble(Off, AgentOf("a"));
			assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
			assert.deepEqual(Off.Lines, ["hook-dsh-search-suggester: disabled (enabled=false)"]);
		});
	}

	// Group J4: a graph that proves nothing leaves the note unchanged.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.workspaceGraph = FakeGraph([{ path: "unrelated/README.md", kind: "File" }]);
		});
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "J4: a graph that proves no candidate keeps the unproven tiers", async () => {
			const Out = await Post(Run, Read("a"));
			assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
		});
	}

	// Group J5: the kind test.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			// CHANGELOG is a File (expected for History); package.json is
			// recorded as a Test node (unexpected), so the kind test drops it
			// below the changelog even though it carries the newer version.
			Context.workspaceGraph = FakeGraph([
				{ path: "package.json", kind: "Test", version: "2" },
				{ path: "CHANGELOG.md", kind: "File", version: "1" },
			]);
		});
		SeedHistory(Run, "a", Space.At(Anchor), ["CHANGELOG.md", "package.json"]);
		await CheckAsync(Count, "J5: an unexpected node kind scores below an expected one", async () => {
			const Out = await Post(Run, Read("a"));
			const Text = Out.additionalContexts[0].content[0].text;
			assert.ok(Text.indexOf("- CHANGELOG.md") < Text.indexOf("- package.json"));
			assert.equal(Text.indexOf("- CHANGELOG.md") > 0, true);
		});
	}

	// Group J6: the depth test.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			// The same version token gives both the same recency: only the
			// depth tier separates them, and the shallow file leads even
			// though the deep one sorts first by path.
			Context.workspaceGraph = FakeGraph([
				{ path: "package.json", kind: "File", version: "1" },
				{ path: "Source/Function/Apply.ts", kind: "File", version: "1" },
			]);
		});
		SeedHistory(Run, "a", Space.At(Anchor), ["Source/Function/Apply.ts", "package.json"]);
		await CheckAsync(Count, "J6: the shallower proven path leads the deeper one", async () => {
			const Out = await Post(Run, Read("a"));
			const Text = Out.additionalContexts[0].content[0].text;
			assert.ok(Text.indexOf("- package.json") < Text.indexOf("- Source/Function/Apply.ts"));
		});
	}

	return Finish(Count, "Projection");
};

// Standalone entry: `node Target/Test/Projection/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Projection`);
}
