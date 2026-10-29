// Source/Test/Projection/Test.ts - the P2 GRAPH PROJECTION against the fake
// ctx and a fake workspaceGraph: the projected candidate scoring (the note's
// order changes when the graph proves the candidates), the byte-exact
// neutral fallback when the graph is absent, the projected sticky section,
// the kind test, the depth test, and the no-new-ledger-string rule.
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
	Setup,
	Validate,
} from "../Harness.js";

/** The strong Version emit call: a grep whose pattern and path both match. */
const StrongVersion = (Id: string): any => ({
	name: "grep",
	arguments: { pattern: "1.2.3 version", path: "package.json" },
	agent: AgentOf(Id),
});

/** The projection the scenarios mount: the Version set, five paths. */
const Nodes = [
	{ path: "package.json", kind: "File", version: "10" },
	{ path: "Site/package.json", kind: "File", version: "9" },
	{ path: "CHANGELOG.md", kind: "File", version: "8" },
	{ path: "Site/Source/Library/Content.ts", kind: "File", version: "7" },
	{ path: "Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts", kind: "File", version: "6" },
	{ path: "Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts", kind: "Symbol", version: "6" },
];

/** The byte-exact note the legacy (no graph) path emits. */
const Neutral =
	"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- Classic/packages/*/package.json - the Classic manifests\n- EffectTS/packages/*/package.json - the EffectTS manifests\n- Site/Source/Library/Content.ts - the site release constant\n- CHANGELOG.md - the new section\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\nnote: open these before more searches; Target/ is generated, never edit it.";

/** The byte-exact note the projection emits: the proven paths lead, the unproven globs fall out. */
const Projected =
	"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- CHANGELOG.md - the new section\n- Site/Source/Library/Content.ts - the site release constant\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\n- Site/Source/pages/reference.astro - the versions page\n- .github/workflows/NPM.yml - the publish trigger\nnote: open these before more searches; Target/ is generated, never edit it.";

/** The byte-exact note a graph that proves NO candidate emits: the unproven literals keep their tier, the unproven globs fall behind. */
const UnprovenNote =
	"[search-suggester] intent=Version confidence=0.92\ntargets (7):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- Site/Source/Library/Content.ts - the site release constant\n- CHANGELOG.md - the new section\n- Documentation/Plugins/PLUGIN-FAMILY.md - the roster versions\n- Site/Source/pages/reference.astro - the versions page\n- .github/workflows/NPM.yml - the publish trigger\nnote: open these before more searches; Target/ is generated, never edit it.";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group J1: the projection drives the note.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			Context.workspaceGraph = FakeGraph(Nodes);
		});
		await CheckAsync(Count, "J1: the projected note leads with the graph-proven paths", async () => {
			const Out = await Post(Run, StrongVersion("a"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.equal(Out.additionalContexts[0].content[0].text, Projected);
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
		});
		await CheckAsync(Count, "J1: the projection adds no ledger string", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.92 7 candidates"));
			assert.equal(LedgerWith("suggest Version 0.92 7 candidates").length, 1);
			assert.match(
				DurableLine("suggest Version 0.92 7 candidates"),
				Durable("suggest Version 0.92 7 candidates"),
			);
			// The activation and the suggest line are the only lines: no
			// projection/index line was introduced.
			assert.deepEqual(Run.Lines, [
				"hook-dsh-search-suggester: activated (bundle 0.2.1, intents 10, threshold 0.75)",
				"hook-dsh-search-suggester: suggest Version 0.92 7 candidates",
			]);
		});
	}

	// Group J2: the neutral fallback (no graph).
	{
		const Run = Setup();
		await CheckAsync(Count, "J2: without a graph the note is byte-identical to the PoC", async () => {
			const Out = await Post(Run, StrongVersion("a"));
			assert.equal(Out.additionalContexts[0].content[0].text, Neutral);
		});
	}

	// Group J3: the projected sticky section.
	{
		rm();
		const Sticky = Make(
			Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }),
			(Context: any) => {
				Context.workspaceGraph = FakeGraph(Nodes);
			},
		);
		await CheckAsync(Count, "J3: the sticky section renders the projected index", async () => {
			await Post(Sticky, StrongVersion("a"));
			const Out = await Assemble(Sticky, AgentOf("a"));
			assert.deepEqual(Out.sections.map((Section: any) => Section.name), [
				"base",
				"hook-dsh-search-suggester",
			]);
			assert.equal(
				Out.sections[1].text,
				"[search-suggester] intent=Version confidence=1.00\ntargets (5):\n- package.json - the monorepo manifest\n- Site/package.json - the site manifest\n- CHANGELOG.md - the new section\n- Site/Source/Library/Content.ts - the site release constant\n- Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts - the const Version\nnote: open these before more searches; Target/ is generated, never edit it.",
			);
		});
		await CheckAsync(Count, "J3: the section stays gated by the enabled state", async () => {
			rm();
			const Off = Make(
				Validate({ logFile: Ledger, enabled: false, sectionMode: "sticky" }),
				(Context: any) => {
					Context.workspaceGraph = FakeGraph(Nodes);
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
		await CheckAsync(Count, "J4: a graph that proves no candidate keeps the unproven tiers", async () => {
			const Out = await Post(Run, StrongVersion("a"));
			assert.equal(Out.additionalContexts[0].content[0].text, UnprovenNote);
		});
	}

	// Group J5: the kind test.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context: any) => {
			// CHANGELOG is a File (expected for Version); package.json is
			// recorded as a Test node (unexpected), so the kind test drops it
			// below the changelog even though it is the shallower path.
			Context.workspaceGraph = FakeGraph([
				{ path: "package.json", kind: "Test", version: "2" },
				{ path: "CHANGELOG.md", kind: "File", version: "1" },
			]);
		});
		await CheckAsync(Count, "J5: an unexpected node kind scores below an expected one", async () => {
			const Out = await Post(Run, StrongVersion("a"));
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
			// depth tier separates them, and the shallow file leads.
			Context.workspaceGraph = FakeGraph([
				{ path: "CHANGELOG.md", kind: "File", version: "1" },
				{ path: "Site/Source/Library/Content.ts", kind: "File", version: "1" },
			]);
		});
		await CheckAsync(Count, "J6: the shallower proven path leads the deeper one", async () => {
			const Out = await Post(Run, StrongVersion("a"));
			const Text = Out.additionalContexts[0].content[0].text;
			assert.ok(Text.indexOf("- CHANGELOG.md") < Text.indexOf("- Site/Source/Library/Content.ts"));
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
