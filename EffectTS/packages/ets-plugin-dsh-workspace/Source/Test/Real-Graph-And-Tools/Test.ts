// Source/Test/Real-Graph-And-Tools/Test.ts - the FIVE tools over a REAL
// populated graph (not FakeGraph): the real workspace-graph service is
// constructed from its built Target, indexed over a deterministic file map
// through `indexWorkspace`, and then addressed through workspace_index,
// workspace_map, workspace_find, workspace_expand and workspace_context. Every
// assertion reads real ids, real spans, real fingerprints and the real
// indexRevision - the consumer chain the empty graph could never prove.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	RealGraph,
	rm,
	Tool,
	Validate,
} from "../Harness.js";

const CORE = 'import { util } from "./util.ts";\n\nexport function core(): number {\n\treturn util;\n}\n';
const UTIL = "export const util = 1;\n";
const TEST_FILE = 'import { core } from "./core.ts";\n\nexport const suite = core;\n';
const MARKDOWN = "# The workspace\n\nIntro text.\n\n## Section\n";

const FILES = {
	"/ws/src/core.ts": CORE,
	"/ws/src/util.ts": UTIL,
	"/ws/src/core.test.ts": TEST_FILE,
	"/ws/README.md": MARKDOWN,
};

/** A fresh enabled mount over a graph populated by the real indexing trigger. */
const Setup = async (): Promise<any> => {
	rm();
	const Graph = RealGraph(FILES);
	await Graph.indexWorkspace("/ws");
	return Make(Validate({ logFile: Ledger, enabled: true }), Graph);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Run = await Setup();

	// Group R1: the indexing trigger through the tool.
	{
		const Result = await Tool(Run, "workspace_index").execute({ path: "/ws" }, {});
		Check(Count, "R1: workspace_index fills the graph and returns the real counts", () => {
			assert.deepEqual(Result, {
				indexRevision: "8",
				indexed: 4,
				skipped: 0,
				failed: 0,
				files: 4,
			});
			assert.ok(
				Run.Lines.includes(
					"plugin-dsh-workspace: workspace: index /ws (4 indexed, 0 skipped, 0 failed, 4 files)",
				),
				JSON.stringify(Run.Lines),
			);
		});
		Check(Count, "R1: the index render is the pure one-line summary", () => {
			const Definition = Tool(Run, "workspace_index");
			assert.deepEqual(
				Definition.output.render(
					{},
					{ indexRevision: "8", indexed: 4, skipped: 0, failed: 0, files: 4 },
				),
				[
					{
						type: "text",
						text: "index @ 8: 4 indexed, 0 skipped, 0 failed, 4 files",
					},
				],
			);
		});
	}

	// Group R2: workspace_map over the real graph.
	{
		const Result = await Tool(Run, "workspace_map").execute({}, {});
		Check(Count, "R2: workspace_map returns the real modules, roles, entry points and hot symbols", () => {
			assert.equal(Result.indexRevision, "8");
			assert.equal(Result.files, 4);
			assert.deepEqual(
				Result.modules.map((Row: any) => `${Row.path} (${Row.role})`),
				[
					"/ws/README.md (The workspace)",
					"/ws/src/core.test.ts (module)",
					"/ws/src/core.ts (module)",
					"/ws/src/util.ts (module)",
				],
			);
			assert.deepEqual(Result.entryPoints, [
				"File:/ws/README.md",
				"File:/ws/src/core.test.ts",
			]);
			assert.deepEqual(
				Result.hotSymbols.map((Row: any) => Row.name),
				["core", "util"],
			);
			assert.equal(Result.truncated, false);
		});
	}

	// Group R3: workspace_find over the real graph.
	{
		const Find = Tool(Run, "workspace_find");
		const Result = await Find.execute({ kind: "Symbol" }, {});
		Check(Count, "R3: workspace_find returns real rows with real spans and fingerprints", async () => {
			assert.deepEqual(
				Result.nodes.map((Row: any) => Row.id),
				[
					"Symbol:/ws/src/core.test.ts:suite",
					"Symbol:/ws/src/core.ts:core",
					"Symbol:/ws/src/util.ts:util",
				],
			);
			const Core = Result.nodes[1];
			assert.equal(Core.path, "/ws/src/core.ts");
			assert.equal(Core.startLine, 3);
			assert.equal(Core.endLine, 5);
			assert.match(Core.fingerprint, /^[0-9a-f]{64}$/);
			assert.equal(Core.version, "v1");
			assert.equal(Result.truncated, false);
		});
		await CheckAsync(Count, "R3: cursor pagination resumes over the real node order", async () => {
			const First = await Find.execute({ kind: "Symbol", limit: 1 }, {});
			assert.deepEqual(First.nodes.map((Row: any) => Row.id), [
				"Symbol:/ws/src/core.test.ts:suite",
			]);
			assert.equal(First.cursor, "Symbol:/ws/src/core.test.ts:suite");
			const Second = await Find.execute(
				{ kind: "Symbol", limit: 1, cursor: First.cursor },
				{},
			);
			assert.deepEqual(Second.nodes.map((Row: any) => Row.id), [
				"Symbol:/ws/src/core.ts:core",
			]);
			assert.equal(Second.truncated, true);
		});
	}

	// Group R4: workspace_expand over the real graph.
	{
		const Result = await Tool(Run, "workspace_expand").execute(
			{ id: "File:/ws/src/core.ts" },
			{},
		);
		Check(Count, "R4: workspace_expand follows the real contains and imports edges", () => {
			assert.equal(Result.indexRevision, "8");
			assert.equal(Result.node.id, "File:/ws/src/core.ts");
			// The graph contract: expand() carries the START node first.
			assert.deepEqual(
				Result.nodes.map((Row: any) => Row.id),
				[
					"File:/ws/src/core.ts",
					"Symbol:/ws/src/core.ts:core",
					"Block:/ws/src/core.ts:4:body",
					"File:/ws/src/util.ts",
				],
			);
			assert.deepEqual(
				Result.edges.map((Edge: any) => `${Edge.kind} ${Edge.to}`),
				[
					"contains Symbol:/ws/src/core.ts:core",
					"contains Block:/ws/src/core.ts:4:body",
					"imports File:/ws/src/util.ts",
				],
			);
			assert.equal(Result.truncated, false);
		});
	}

	// Group R5: workspace_context over the real graph.
	{
		const Result = await Tool(Run, "workspace_context").execute(
			{ id: "File:/ws/src/core.ts" },
			{},
		);
		const Lines = Result.text.split("\n");
		const Fingerprint = Run.Graph.getNode("File:/ws/src/core.ts").fingerprint.slice(0, 12);
		Check(Count, "R5: the orientation packet carries real graph content", () => {
			assert.equal(Lines[0], "WORKSPACE workspace @ 8");
			assert.equal(Lines[1], "SCOPE File:/ws/src/core.ts");
			assert.deepEqual(Lines.slice(2, 6), [
				"MAP /ws/README.md (The workspace)",
				"MAP /ws/src/core.test.ts (module)",
				"MAP /ws/src/core.ts (module)",
				"MAP /ws/src/util.ts (module)",
			]);
			// The graph's version token is already `v1`; the packet's grammar
			// prefixes a literal `v` (the existing render, unchanged here).
			assert.equal(
				Lines[6],
				`FOCUS File:/ws/src/core.ts (1-5, ${Fingerprint}, vv1)`,
			);
			assert.deepEqual(Lines.slice(7, 10), [
				"NEIGHBORS File:/ws/src/core.ts -imports-> File:/ws/src/util.ts",
				"NEIGHBORS File:/ws/src/core.ts -contains-> Symbol:/ws/src/core.ts:core",
				"NEIGHBORS File:/ws/src/core.ts -contains-> Block:/ws/src/core.ts:4:body",
			]);
			assert.equal(Lines[10], "EVIDENCE /ws/src/core.ts:1-5");
			assert.equal(Result.packet.workspace, "workspace");
			assert.equal(Result.packet.indexRevision, "8");
			assert.ok(
				Result.text.includes("OPEN references edges are deferred to W2+"),
				"the deferred kinds stay honest",
			);
		});
	}

	// Group R6: the index scope and the walk bound through the tool.
	{
		rm();
		const Scoped = Make(
			Validate({ logFile: Ledger, enabled: true }),
			RealGraph(FILES),
		);
		const ScopedResult = await Tool(Scoped, "workspace_index").execute({ path: "/ws/src" }, {});
		Check(Count, "R6: a scoped index walks only that subtree", () => {
			assert.deepEqual(
				{ indexed: ScopedResult.indexed, files: ScopedResult.files },
				{ indexed: 3, files: 3 },
			);
			assert.ok(
				Scoped.Lines.includes(
					"plugin-dsh-workspace: workspace: index /ws/src (3 indexed, 0 skipped, 0 failed, 3 files)",
				),
			);
		});
		rm();
		const Bounded = Make(
			Validate({ logFile: Ledger, enabled: true }),
			RealGraph(FILES),
		);
		const BoundedResult = await Tool(Bounded, "workspace_index").execute(
			{ path: "/ws", maxFiles: 2 },
			{},
		);
		Check(Count, "R6: maxFiles is passed through to the graph walk", () => {
			assert.deepEqual(
				{ indexed: BoundedResult.indexed, files: BoundedResult.files },
				{ indexed: 2, files: 2 },
			);
			assert.equal(BoundedResult.indexRevision, "2");
		});
	}

	// Group R7: the agent stays a pure consumer.
	{
		Check(Count, "R7: the five tools never touch the workspace ctx's fs seam", () => {
			assert.deepEqual(Run.Fs.resolves, []);
			assert.deepEqual(Run.Fs.stats, []);
			assert.deepEqual(Run.Fs.reads, []);
			assert.deepEqual(Run.Fs.writes, []);
		});
	}

	return Finish(Count, "Real-Graph-And-Tools");
};

// Standalone entry: `node Target/Test/Real-Graph-And-Tools/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Real-Graph-And-Tools`);
}
