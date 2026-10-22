// Source/Test/Pipeline-And-Graph/Test.ts - the pipeline against the fake
// graph service: the Neighborhood resolution through the graph (the anchor,
// the limit, the empty-reason fallback), the static fallback on an empty
// component, the graph-unavailable/abstain paths (absent, throwing,
// graph:false), the Sibling static intent, the gate (cooldown, per-turn cap
// + the pre-step reset), the block-decision preservation, the exclusion, the
// volatile flip, the note truncation, and the fs purity across a full
// scenario.
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

/** The full-evidence Neighborhood probe: path + symbol + glob shapes. */
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
				"graph-suggester: suggest Neighborhood 0.65 2 candidates call read",
			]);
			assert.equal(LedgerWith("suggest Neighborhood 0.65 2 candidates call read").length, 1);
		});
		await CheckAsync(Count, "P1: the note is one labeled notice prepended to the decision", async () => {
			assert.ok(Array.isArray(Result.additionalContexts));
			assert.equal(Result.additionalContexts.length, 1);
			const Note = Result.additionalContexts[0];
			assert.equal(Note.role, "user");
			assert.deepEqual(Note.source, {
				kind: "graph-suggester",
				form: "notice",
				summary: "Neighborhood 0.65",
			});
			assert.equal(
				Note.content[0].text,
				"[graph-suggester] intent=Neighborhood confidence=0.65\ntargets (2):\n- src/Source/Core.ts - the definition\n- src/Source/Use.ts - the callers\nnote: the neighborhood is the connected component: definition, callers, tests, doc block.",
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
				"graph-suggester: suggest Neighborhood 0.65 1 candidates call read",
			]);
		});
		const Empty = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([]);
		});
		await Call(Empty, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P2: an empty component falls back to the static target set", () => {
			assert.deepEqual(LinesWith(Empty, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.65 3 candidates call read",
			]);
			assert.equal(LinesWith(Empty, "abstained").length, 0);
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
					L.endsWith("abstained graph-unavailable Neighborhood 0.65"),
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
				"graph-suggester: abstained graph-unavailable Neighborhood 0.65",
			]);
		});
		const Disabled = Setup({ graph: false });
		await Call(Disabled, "read", NEIGHBORHOOD_ARGS);
		Check(Count, "P3: graph:false abstains without logging graph unavailable", () => {
			assert.deepEqual(LinesWith(Disabled, "abstained graph-unavailable"), [
				"graph-suggester: abstained graph-unavailable Neighborhood 0.65",
			]);
			assert.equal(LinesWith(Disabled, "graph unavailable").length, 0);
		});
	}

	// Group P4: the Sibling intent (static resolution).
	{
		const Run = Setup();
		await Call(Run, "grep", { pattern: "hook-dsh-", query: "PLUGIN-FAMILY inventory" });
		Check(Count, "P4: the Sibling intent resolves statically and suggests", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"graph-suggester: suggest Sibling 0.55 3 candidates call grep",
			]);
		});
	}

	// Group P5: the gate - cooldown and per-turn cap (one shared agent).
	{
		const Agent = { agent: { id: "agent-a" } };
		const Run = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" }]);
		});
		await Call(Run, "read", NEIGHBORHOOD_ARGS, Agent);
		await Call(Run, "read", NEIGHBORHOOD_ARGS, Agent);
		Check(Count, "P5: a repeat within the cooldown is suppressed with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "suppressed"), [
				"graph-suggester: suppressed cooldown Neighborhood",
			]);
			assert.equal(LinesWith(Run, "candidates call").length, 1);
		});
		const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 });
		await Call(Capped, "grep", { pattern: "hook-dsh-", query: "PLUGIN-FAMILY inventory" }, Agent);
		await Call(Capped, "grep", { pattern: "hook-dsh-", query: "PLUGIN-FAMILY inventory" }, Agent);
		Check(Count, "P5: a note beyond the per-turn cap is suppressed", () => {
			assert.deepEqual(LinesWith(Capped, "suppressed"), ["graph-suggester: suppressed cap Sibling"]);
			assert.equal(LinesWith(Capped, "candidates call").length, 1);
		});
		await PreStep(Capped, Agent);
		await Call(Capped, "grep", { pattern: "hook-dsh-", query: "PLUGIN-FAMILY inventory" }, Agent);
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
				"graph-suggester: abstained ambiguous Neighborhood 0.65",
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
				"graph-suggester: suggest Neighborhood 0.65 1 candidates call read",
			]);
		});
		const Block = Setup({}, (Context: any) => {
			Context.workspaceGraph = FakeGraph([{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" }]);
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
			Context.workspaceGraph = FakeGraph([{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" }]);
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
			Context.workspaceGraph = FakeGraph([{ path: "src/Source/Core.ts", role: "definition", reason: "the definition" }]);
		});
		await Call(Pure, "read", NEIGHBORHOOD_ARGS);
		await Call(Pure, "grep", { pattern: "hook-dsh-", query: "PLUGIN-FAMILY inventory" });
		Check(Count, "P8: the full scenario performs ZERO fs operations", () => {
			assert.equal(Pure.Fs.reads.length, 0);
			assert.equal(Pure.Fs.writes.length, 0);
			assert.equal(Pure.Fs.resolved.length, 0);
			assert.equal(Pure.Fs.stats.length, 0);
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
