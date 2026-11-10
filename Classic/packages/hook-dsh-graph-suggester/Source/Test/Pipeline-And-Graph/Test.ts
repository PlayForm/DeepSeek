import assert from "node:assert/strict";
import {
	Call,
	Check,
	CheckAsync,
	Finish,
	FakeGraph,
	LedgerWith,
	LinesWith,
	MakeCounter,
	PreStep,
	Flip,
	Setup,
	Volatile,
} from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the graph-suggester pipeline against the fake graph
 * service.
 *
 * @remarks
 *
 * The test covers the Neighborhood resolution through the graph (the anchor,
 * the limit, the empty-reason fallback), the graph-only candidate source (an
 * empty component abstains `no-companions`, never a literal target set), the
 * graph-unavailable/abstain paths (absent, throwing, graph:false), the
 * Sibling same-directory projection, the gate (cooldown, per-turn cap + the
 * pre-step reset), the block-decision preservation, the exclusion, the
 * volatile flip, the note truncation, the anchor exclusion (a component that
 * holds only the anchor abstains, and no note ever names the anchor), and the
 * fs purity across a full scenario.
 */
/**
 * The full-evidence Neighborhood probe: the anchor the graph is asked about.
 */
const NEIGHBORHOOD_ARGS = {
	file_path: "src/Source/Core.ts",
	pattern: "export function",
	glob: "**/*.ts",
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the Neighborhood resolution through the graph service.
	{
		const Run = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Use.ts", role: "caller", reason: "the callers" },
			]);
		});
		const Result = await Call(Run, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P1: the suggest line is byte-exact (logger and durable ledger)", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.87 1 candidates call read",
			]);
			assert.equal(LedgerWith("suggest Neighborhood 0.87 1 candidates call read").length, 1);
		});
		await CheckAsync(Count, "P1: the note is one labeled notice prepended to the decision", async () => {
			assert.ok(Array.isArray(Result.additionalContexts));
			assert.equal(Result.additionalContexts.length, 1);
			const Note = Result.additionalContexts[0];
			assert.equal(Note.role, "user");
			assert.deepEqual(Note.source, {
				kind: "graph-suggester",
				form: "notice",
				summary: "Neighborhood 0.87",
			});
			assert.equal(
				Note.content[0].text,
				"[graph-suggester] intent=Neighborhood confidence=0.87\ntargets (1):\n- src/Source/Use.ts - the callers\nnote: the files around this one: importers, dependencies, tests, doc block.",
			);
			assert.equal(Object.isFrozen(Note), true);
			assert.equal(Result.kind, "allow");
		});
		Check(Count, "P1: the graph query receives the anchor and the candidate cap", () => {
			assert.deepEqual(FakeGraph.Calls, [{ path: "src/Source/Core.ts", limit: 7 }]);
		});
	}

	// Group P2: the empty-reason fallback and the empty component.
	{
		const Run = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([{ path: "src/Source/Doc.md", role: "doc", reason: "" }]);
		});
		await Call(Run, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P2: a graph entry without a reason falls back to its role", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.87 1 candidates call read",
			]);
		});
		const Empty = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([]);
		});
		await Call(Empty, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P2: an empty component abstains as no-companions, never a literal target set", () => {
			assert.deepEqual(LinesWith(Empty, "candidates call"), []);
			assert.deepEqual(LinesWith(Empty, "abstained"), [
				"graph-suggester: abstained no-companions Neighborhood 0.87",
			]);
			assert.equal(LinesWith(Empty, "graph unavailable").length, 0);
		});
	}

	// Group P3: the graph-unavailable paths.
	{
		const Run = Setup();
		await Call(Run, "read", NEIGHBORHOOD_ARGS);
		await Call(Run, "grep", {
			file_path: "src/Source/Other.ts",
			pattern: "export function",
			glob: "**/*.ts",
		});
		Check(Count, "P3: an absent service abstains with the byte-exact lines, logged once", () => {
			assert.ok(LinesWith(Run, "graph unavailable").includes("graph-suggester: graph unavailable"));
			assert.equal(LinesWith(Run, "graph unavailable").length, 1);
			assert.equal(LinesWith(Run, "abstained graph-unavailable").length, 2);
			assert.ok(
				LinesWith(Run, "abstained graph-unavailable").every((L) =>
					L.endsWith("abstained graph-unavailable Neighborhood 0.87"),
				),
			);
		});
		const Boom = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph(null, "boom");
		});
		await Call(Boom, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P3: a throwing service abstains with the reason in the line", () => {
			assert.deepEqual(LinesWith(Boom, "graph unavailable"), [
				"graph-suggester: graph unavailable Error: boom",
			]);
			assert.deepEqual(LinesWith(Boom, "abstained graph-unavailable"), [
				"graph-suggester: abstained graph-unavailable Neighborhood 0.87",
			]);
		});
		const Disabled = Setup({ graph: false });
		await Call(Disabled, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P3: graph:false abstains without logging graph unavailable", () => {
			assert.deepEqual(LinesWith(Disabled, "abstained graph-unavailable"), [
				"graph-suggester: abstained graph-unavailable Neighborhood 0.87",
			]);
			assert.equal(LinesWith(Disabled, "graph unavailable").length, 0);
		});
	}

	// Group P4: the Sibling intent (the same-directory projection).
	{
		const Run = Setup({ intents: ["Sibling"] }, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Core.test.ts", role: "test", reason: "the tests" },
			]);
		});
		await Call(Run, "grep", { pattern: "hook-dsh-", file_path: "src/Source/Core.ts" });
		Check(Count, "P4: the Sibling intent names the same-directory peers, the anchor excluded", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"graph-suggester: suggest Sibling 0.87 1 candidates call grep",
			]);
			assert.equal(LinesWith(Run, "abstained").length, 0);
		});
	}

	// Group P5: the gate - cooldown and per-turn cap (one shared agent).
	{
		const Agent = { agent: { id: "agent-a" } };
		const Run = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Core.test.ts", role: "test", reason: "the tests" },
			]);
		});
		await Call(Run, "read", NEIGHBORHOOD_ARGS, Agent);
		await Call(Run, "read", NEIGHBORHOOD_ARGS, Agent);
		Check(Count, "P5: a repeat within the cooldown is suppressed with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "suppressed"), [
				"graph-suggester: suppressed cooldown Neighborhood",
			]);
			assert.equal(LinesWith(Run, "candidates call").length, 1);
		});
		const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 }, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Core.test.ts", role: "test", reason: "the tests" },
			]);
		});
		await Call(Capped, "read", NEIGHBORHOOD_ARGS, Agent);
		await Call(Capped, "read", NEIGHBORHOOD_ARGS, Agent);
		Check(Count, "P5: a note beyond the per-turn cap is suppressed", () => {
			assert.deepEqual(LinesWith(Capped, "suppressed"), ["graph-suggester: suppressed cap Neighborhood"]);
			assert.equal(LinesWith(Capped, "candidates call").length, 1);
		});
		await PreStep(Capped, Agent);
		await Call(Capped, "read", NEIGHBORHOOD_ARGS, Agent);
		Check(Count, "P5: a user turn resets the per-turn counter and the note emits again", () => {
			assert.equal(LinesWith(Capped, "candidates call").length, 2);
		});
	}

	// Group P6: the exclusion and the block decision.
	{
		const Run = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "node_modules/a.ts", role: "caller", reason: "the callers" },
			]);
		});
		await Call(Run, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P6: an excluded candidate set abstains as ambiguous", () => {
			assert.deepEqual(LinesWith(Run, "abstained"), [
				"graph-suggester: abstained ambiguous Neighborhood 0.87",
			]);
		});
		const Partial = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "Target/gen.ts", role: "caller", reason: "the callers" },
				{ path: "src/Live.ts", role: "definition", reason: "the definition" },
			]);
		});
		await Call(Partial, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P6: excluded paths are filtered, the rest still suggest", () => {
			assert.deepEqual(LinesWith(Partial, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.87 1 candidates call read",
			]);
		});
		const Block = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Use.ts", role: "importer", reason: "the importers" },
			]);
		});
		const Downstream = { kind: "block", feedback: "no", additionalContexts: [{ marker: "downstream" }] };
		const Result = await Call(Block, "read", NEIGHBORHOOD_ARGS, undefined, Downstream);
		Check(Count, "P6: a block decision keeps its feedback and prepends the note", () => {
			assert.equal(Result.kind, "block");
			assert.equal(Result.feedback, "no");
			assert.equal(Result.additionalContexts.length, 2);
			assert.equal(Result.additionalContexts[0].source.kind, "graph-suggester");
			assert.equal(Result.additionalContexts[1], Downstream.additionalContexts[0]);
		});
	}

	// Group P7: the volatile flip and the note truncation.
	{
		const Run = Setup();
		Flip(Volatile(Run, "enabled"), false);
		Run.CtxListeners["loader/volatile-update"]([["enabled"]]);
		Check(Count, "P7: the volatile flip of enabled refreshes the state in place", () => {
			assert.equal(Run.State.On, false);
		});
		await Call(Run, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P7: after the flip every call passes through without a note", () => {
			assert.equal(LinesWith(Run, "candidates call").length, 0);
			assert.equal(LinesWith(Run, "abstained").length, 0);
		});
		const Trunc = Setup({ maxNoteChars: 60 }, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Use.ts", role: "importer", reason: "the importers" },
			]);
		});
		const Result = await Call(Trunc, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P7: a note longer than maxNoteChars is truncated with an ellipsis", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			assert.equal(Text.endsWith("..."), true);
			assert.equal(Text.length, 62);
		});
	}

	// Group P8: the fs purity across the full scenario.
	{
		const Pure = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Core.test.ts", role: "test", reason: "the tests" },
			]);
		});
		await Call(Pure, "read", NEIGHBORHOOD_ARGS);
		await Call(Pure, "grep", { pattern: "hook-dsh-", file_path: "src/Source/Core.ts" });
		Check(Count, "P8: the full scenario performs ZERO fs operations", () => {
			assert.equal(Pure.Fs.reads.length, 0);
			assert.equal(Pure.Fs.writes.length, 0);
			assert.equal(Pure.Fs.resolved.length, 0);
			assert.equal(Pure.Fs.stats.length, 0);
		});
	}

	// Group P9: the anchor exclusion - the component includes the file the
	// agent just touched, and naming it back is noise.
	{
		const Alone = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
			]);
		});
		await Call(Alone, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P9: a component that holds only the anchor abstains no-companions", () => {
			assert.deepEqual(LinesWith(Alone, "candidates call"), []);
			assert.deepEqual(LinesWith(Alone, "abstained"), [
				"graph-suggester: abstained no-companions Neighborhood 0.87",
			]);
			assert.equal(LinesWith(Alone, "graph unavailable").length, 0);
		});
		const Mixed = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Use.ts", role: "importer", reason: "the importers" },
				{ path: "src/Source/Dep.ts", role: "dependency", reason: "the dependencies" },
			]);
		});
		const Result = await Call(Mixed, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P9: the anchor is dropped and only its companions are named", () => {
			assert.deepEqual(LinesWith(Mixed, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.87 2 candidates call read",
			]);
			assert.equal(
				Result.additionalContexts[0].content[0].text,
				"[graph-suggester] intent=Neighborhood confidence=0.87\ntargets (2):\n- src/Source/Use.ts - the importers\n- src/Source/Dep.ts - the dependencies\nnote: the files around this one: importers, dependencies, tests, doc block.",
			);
		});
		const Normalized = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([
				{ path: "./src\\Source\\Core.ts", role: "definition", reason: "the definition" },
				{ path: "src/Source/Use.ts", role: "importer", reason: "the importers" },
			]);
		});
		const Backslash = await Call(Normalized, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P9: a backslash or ./-prefixed anchor entry is dropped too", () => {
			assert.deepEqual(LinesWith(Normalized, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.87 1 candidates call read",
			]);
			assert.equal(LinesWith(Normalized, "abstained").length, 0);
		});
		Check(Count, "P9: no note ever names the anchor (plain and backslash forms)", () => {
			for (const Note of [Result, Backslash]) {
				const Text = Note.additionalContexts[0].content[0].text;
				assert.equal(Text.includes("Core.ts"), false);
			}
		});
	}
	return Finish(Count, "Pipeline-And-Graph");
};

// Standalone entry: `node Target/Test/Pipeline-And-Graph/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Pipeline-And-Graph`);
}
