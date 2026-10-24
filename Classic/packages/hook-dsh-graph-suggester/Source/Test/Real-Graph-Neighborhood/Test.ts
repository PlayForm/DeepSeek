// Source/Test/Real-Graph-Neighborhood/Test.ts - the Neighborhood intent
// against a REAL populated graph: the real workspace-graph service (from its
// built Target) is indexed through its own indexing trigger over a
// deterministic file map, and the suggester's declared `neighborhood` query
// answers from the real `contains`/`imports` edges. Today every other folder
// proves the intent against FakeGraph; this one proves the consumer chain the
// POC gap analysis named ("the live graph is empty; only FakeGraph-proven").
import assert from "node:assert/strict";
import {
	Call,
	Check,
	Finish,
	LinesWith,
	MakeCounter,
	RealGraph,
	Setup,
} from "../Harness.js";

const CORE = "export function core(): number {\n\treturn 1;\n}\n";
const USE = 'import { core } from "./Core.ts";\n\nexport const used = core;\n';
const TEST_FILE = 'import { core } from "./Core.ts";\n\nexport const suite = core;\n';
const MARKDOWN = "# The workspace\n\nText.\n";

const FILES = {
	"/ws/Source/Core.ts": CORE,
	"/ws/Source/Use.ts": USE,
	"/ws/Source/Core.test.ts": TEST_FILE,
	"/ws/README.md": MARKDOWN,
};

/** The full-evidence Neighborhood probe: path + symbol + glob shapes. */
const ARGS = {
	file_path: "/ws/Source/Core.ts",
	pattern: "export function",
	glob: "**/*.ts",
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// The real graph, populated by the real indexing trigger, attached before
	// apply (the suggester probes ctx.workspaceGraph at use time).
	const Graph = RealGraph(FILES);
	const Summary = await Graph.indexWorkspace("/ws");
	const Run = Setup({}, (Context: any) => {
		Context.workspaceGraph = Graph;
	});
	const Result = await Call(Run, "read", ARGS);

	// Group G1: the real neighborhood.
	{
		Check(Count, "G1: the real graph yielded the neighborhood component", () => {
			assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
			assert.deepEqual(
				Graph.neighborhood("/ws/Source/Core.ts").map((Entry: any) => `${Entry.path} ${Entry.role}`),
				[
					"/ws/Source/Core.ts definition",
					"/ws/Source/Core.test.ts test",
					"/ws/Source/Use.ts importer",
				],
			);
		});
		Check(Count, "G1: the suggest line is byte-exact and the graph answered", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.65 3 candidates call read",
			]);
			assert.equal(LinesWith(Run, "graph unavailable").length, 0);
			assert.equal(LinesWith(Run, "abstained").length, 0);
		});
		Check(Count, "G1: the note carries the real candidate paths and reasons", () => {
			assert.ok(Array.isArray(Result.additionalContexts));
			assert.equal(Result.additionalContexts.length, 1);
			assert.equal(
				Result.additionalContexts[0].content[0].text,
				"[graph-suggester] intent=Neighborhood confidence=0.65\ntargets (3):\n- /ws/Source/Core.ts - the definition\n- /ws/Source/Core.test.ts - the tests\n- /ws/Source/Use.ts - the importers\nnote: the neighborhood is the connected component: definition, callers, tests, doc block.",
			);
			assert.equal(Result.kind, "allow");
		});
		Check(Count, "G1: the candidates are the real graph's, never the static fallback set", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			for (const Fallback of [
				"Source/Interface/*.ts",
				"Source/Function/*.ts",
				"Source/Test/<Suite>/Test.ts",
			]) {
				assert.equal(Text.includes(Fallback), false, `no fallback target ${Fallback}`);
			}
		});
	}

	// Group G2: an anchor the real graph does not know.
	{
		const Unknown = Setup({}, (Context: any) => {
			Context.workspaceGraph = Graph;
		});
		await Call(Unknown, "read", { ...ARGS, file_path: "/ws/Source/Missing.ts" });
		Check(Count, "G2: an unknown anchor is an empty component, so the static set answers", () => {
			assert.deepEqual(LinesWith(Unknown, "candidates call"), [
				"graph-suggester: suggest Neighborhood 0.65 3 candidates call read",
			]);
			assert.equal(LinesWith(Unknown, "graph unavailable").length, 0);
			assert.deepEqual(Graph.neighborhood("/ws/Source/Missing.ts"), []);
		});
	}

	// Group G3: the hook's own fs stays untouched (the graph owns the reads).
	{
		Check(Count, "G3: the suggester's fs capture records ZERO operations", () => {
			assert.equal(Run.Fs.reads.length, 0);
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.resolved.length, 0);
			assert.equal(Run.Fs.stats.length, 0);
		});
	}

	return Finish(Count, "Real-Graph-Neighborhood");
};

// Standalone entry: `node Target/Test/Real-Graph-Neighborhood/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Real-Graph-Neighborhood`);
}
