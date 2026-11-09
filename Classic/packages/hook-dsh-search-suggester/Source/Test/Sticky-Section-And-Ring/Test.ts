/**
 * @module Test
 *
 * The second surface and the ring lifecycle against the fake ctx.
 *
 * @remarks
 * The sticky section off by default (the assemble waterfall passes through
 * untouched), the sticky section built after an emit (the byte-exact section
 * name and text, the `section rebuilt (ttl N)` ledger line in both forms), the
 * TTL rebuild, the tools/change invalidation for the default ring, and the
 * assemble fail-open pass-through.
 *
 * THE SECTION'S SOURCE: the last family the ring noted. For the synthetic
 * History row the section renders the paths the note named, so the scenarios
 * seed the session history through the projection drive. The DEFAULT
 * (agent-less) ring cannot be reached through the projection - an agent-less call
 * carries no session, so its history is empty - so the tools/change scenario
 * arms that ring through the plugin's own `Ring.Mark` API.
 */
import assert from "node:assert/strict";
import {
	AgentOf,
	Assemble,
	CheckAsync,
	Durable,
	DurableLine,
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

/** The two companions touched right after the anchor. */
const Companions = ["CHANGELOG.md", "SCHEME.md"];

/** The temp workspace the scenarios judge. */
const Space = Workspace([Anchor, ...Companions]);

/** One judged read of the anchor. */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

/** The byte-exact sticky section text (the note's paths, the generic reason). */
const Section =
	"[search-suggester] intent=History confidence=1.00\ntargets (2):\n- CHANGELOG.md - touched after a similar call\n- SCHEME.md - touched after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group S1: the second surface is off by default.
	{
		const Run = Setup();
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "S1: with sectionMode off the assemble passes through untouched", async () => {
			await Post(Run, Read("a"));
			const Out = await Assemble(Run, AgentOf("a"));
			assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
			assert.ok(!Run.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
		});
	}

	// Group S2: the sticky section.
	{
		rm();
		const Sticky = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
		SeedHistory(Sticky, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "S2: after an emit the sticky section is appended", async () => {
			await Post(Sticky, Read("a"));
			const Out = await Assemble(Sticky, AgentOf("a"));
			assert.deepEqual(Out.sections.map((Section_: any) => Section_.name), ["base", "hook-dsh-search-suggester"]);
			assert.equal(Out.sections[1].text, Section);
			assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
			assert.match(
				DurableLine("section rebuilt (ttl 20)"),
				Durable("section rebuilt (ttl 20)"),
			);
			assert.equal(LedgerWith("section rebuilt (ttl 20)").length, 1);
		});
		await CheckAsync(Count, "S2: the section is cached until the TTL expires", async () => {
			const Rings = Sticky.State.Rings.State(AgentOf("a"));
			const Built = Rings.sectionBuilt;
			const Out = await Assemble(Sticky, AgentOf("a"));
			assert.deepEqual(Out.sections.map((Section_: any) => Section_.name), ["base", "hook-dsh-search-suggester"]);
			assert.equal(Sticky.State.Rings.State(AgentOf("a")).sectionBuilt, Built);
			assert.equal(LedgerWith("section rebuilt (ttl 20)").length, 1);
		});
	}

	// Group S3: the tools/change invalidation of the DEFAULT (agent-less) ring.
	{
		rm();
		const Sticky = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
		await CheckAsync(Count, "S3: the default ring builds its section from the last noted family", async () => {
			// The default ring is not reachable through the session projection
			// (an agent-less call carries no session, so its history is empty),
			// so the scenario arms the ring through the plugin's own Ring.Mark
			// API and reads back the section the History row renders.
			const Rings = Sticky.State.Rings.State(undefined);
			Sticky.State.Rings.Mark(Rings, "History", ["CHANGELOG.md"], "History CHANGELOG.md");
			const Out = await Assemble(Sticky, undefined);
			assert.deepEqual(Out.sections.map((Section_: any) => Section_.name), ["base", "hook-dsh-search-suggester"]);
			assert.equal(
				Out.sections[1].text,
				"[search-suggester] intent=History confidence=1.00\ntargets (1):\n- CHANGELOG.md - touched after a similar call\nnote: open these before more searches; Target/ is generated, never edit it.",
			);
			assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
		});
		await CheckAsync(Count, "S3: tools/change invalidates the default ring's cache with its ledger line", async () => {
			Sticky.Lines.length = 0;
			Sticky.CtxListeners["tools/change"]();
			assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section invalidated (tools/change)"));
			assert.match(
				DurableLine("section invalidated (tools/change)"),
				Durable("section invalidated (tools/change)"),
			);
			const Out = await Assemble(Sticky, undefined);
			assert.deepEqual(Out.sections.map((Section_: any) => Section_.name), ["base", "hook-dsh-search-suggester"]);
			assert.ok(Sticky.Lines.includes("hook-dsh-search-suggester: section rebuilt (ttl 20)"));
		});
		await CheckAsync(Count, "S3: tools/change on an empty cache is silent", async () => {
			rm();
			const Fresh = Make(Validate({ logFile: Ledger, enabled: true, sectionMode: "sticky" }));
			Fresh.Lines.length = 0;
			Fresh.CtxListeners["tools/change"]();
			assert.deepEqual(Fresh.Lines, []);
		});
	}

	// Group S4: the assemble guard.
	{
		const Run = Setup();
		await CheckAsync(Count, "S4: an assemble with no cooled family passes through with no section", async () => {
			const Out = await Assemble(Run, undefined);
			assert.deepEqual(Out.sections, [{ name: "base", text: "b" }]);
			assert.deepEqual(Run.Lines, [`hook-dsh-search-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`]);
			assert.deepEqual(Run.Warns, []);
		});
	}
	return Finish(Count, "Sticky-Section-And-Ring");
};

// Standalone entry: `node Target/Test/Sticky-Section-And-Ring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Sticky-Section-And-Ring`);
}
