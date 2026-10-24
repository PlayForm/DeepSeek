// Source/Test/References/Test.ts - the `references` edge's consumer wiring
// over a REAL temp tree and the REAL built semantics service: the graph probes
// the service (never injects it), asks it for the file's reference list after
// the parse, and emits one honest edge per resolved reference - from the node
// that USES the symbol to the Symbol node it uses. The folder also pins the
// honesty rules: no service means NO references edges, a disabled service is
// silence, a service that answers with a target the file does not declare
// produces NO dangling edge, and the plan's short service alias `semantics` is
// honored.
import assert from "node:assert/strict";
import { Check, Finish, GraphClass, LinesWith, MakeCounter, MakeDisk, Tree } from "../Harness.js";
import Semantics from "../../../../plugin-dsh-workspace-semantics/Target/Library.js";

/** The fixture file: a top-level symbol used inside a function and again at the
 *  top level (two owners: the enclosing Symbol, then the File). */
const CORE = [
	"export const config = { port: 1 };",
	"",
	"export function core(): number {",
	"\treturn config.port;",
	"}",
	"",
	"config.port;",
	"",
].join("\n");

/** A second file so the walk indexes more than one record. */
const LIB = "export const helper = 1;\n";

/** A Markdown file whose link target is a reference the graph cannot resolve. */
const DOC = "# The workspace\n\nSee [the helper](./helper.md).\n";

/** The validated config shape the semantics loader hands to its apply (the
 *  schema call; the cast is fixture-only scaffolding, the semantics harness's
 *  own posture). */
const Definition = (Raw: Record<string, unknown>): any =>
	(Semantics.Config as unknown as (Raw: Record<string, unknown>) => any)({ ...Raw });

/** Mount the REAL semantics plugin on the graph's fake context. */
const Mount = (Run: any, Config: Record<string, unknown> = {}): void => {
	Semantics.apply(
		Run.Context,
		Definition({ enabled: true, log: false, ...Config }),
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Fixture = Tree({ "src/core.ts": CORE, "src/lib.ts": LIB, "README.md": DOC });
	const Root = Fixture.root;
	const CorePath = `${Root}/src/core.ts`;
	const DocPath = `${Root}/README.md`;

	// Group R1: the real index with the service mounted.
	{
		const Run = MakeDisk(Root, { enabled: true });
		Mount(Run);
		await Run.Graph.indexWorkspace(Root);
		const Snapshot = Run.Graph.snapshot();
		Check(Count, "R1: the service is probed through ctx.get, never injected", () => {
			assert.deepEqual(GraphClass.inject, ["fs", "storage"]);
			assert.ok(Run.Context.get("workspaceSemantics") !== undefined);
			assert.ok(
				Run.loggerLines.some((Line: string) => Line === `semantics: resolved ${CorePath} (2 symbols, 2 references)`),
				JSON.stringify(LinesWith(Run, "semantics: resolved")),
			);
		});
		Check(Count, "R1: the real index produces honest references edges", () => {
			assert.deepEqual(
				Snapshot.edges
					.filter((Edge: any) => Edge.kind === "references")
					.map((Edge: any) => [Edge.from, Edge.to, Edge.span.startLine, Edge.span.endLine]),
				[
					[`Symbol:${CorePath}:core`, `Symbol:${CorePath}:config`, 4, 4],
					[`File:${CorePath}`, `Symbol:${CorePath}:config`, 7, 7],
				],
			);
		});
		Check(Count, "R1: the indexed line and the snapshot count the references edges", () => {
			const Indexed = LinesWith(Run, `indexed ${CorePath}`);
			assert.equal(Indexed.length, 1);
			assert.match(Indexed[0] as string, /\(4 nodes, 5 edges\)$/);
			assert.equal(Snapshot.nodes.length, 8);
			assert.equal(Snapshot.edges.length, 7);
		});
		Check(Count, "R1: expand follows a references edge from the using symbol", () => {
			const Expansion = Run.Graph.expand(`Symbol:${CorePath}:core`);
			assert.ok(
				Expansion.edges.some(
					(Edge: any) =>
						Edge.kind === "references" && Edge.to === `Symbol:${CorePath}:config`,
				),
			);
			assert.deepEqual(
				Expansion.nodes.map((Node: any) => Node.id),
				[`Symbol:${CorePath}:core`, `Symbol:${CorePath}:config`],
			);
		});
	}

	// Group R2: the same tree with NO service.
	{
		const Run = MakeDisk(Root, { enabled: true });
		await Run.Graph.indexWorkspace(Root);
		const Snapshot = Run.Graph.snapshot();
		Check(Count, "R2: without the service there are NO references edges (never faked)", () => {
			assert.equal(Snapshot.edges.filter((Edge: any) => Edge.kind === "references").length, 0);
			assert.equal(Snapshot.edges.length, 5, "the three core contains edges plus lib and the doc");
		});
		Check(Count, "R2: the indexed line counts only the parsed edges", () => {
			const Indexed = LinesWith(Run, `indexed ${CorePath}`);
			assert.equal(Indexed.length, 1);
			assert.match(Indexed[0] as string, /\(4 nodes, 3 edges\)$/);
			assert.deepEqual(LinesWith(Run, "semantics:"), []);
		});
	}

	// Group R3: a DISABLED service is silence, not a guess.
	{
		const Run = MakeDisk(Root, { enabled: true });
		Mount(Run, { enabled: false });
		await Run.Graph.indexFile(CorePath);
		Check(Count, "R3: a disabled service answers undefined and adds no edge", () => {
			assert.equal(
				Run.Graph.snapshot().edges.filter((Edge: any) => Edge.kind === "references").length,
				0,
			);
			assert.ok(Run.loggerLines.includes("semantics: disabled (enabled=false)"));
		});
		Check(Count, "R3: the record keeps its parsed edge count", () => {
			const Indexed = LinesWith(Run, `indexed ${CorePath}`);
			assert.match(Indexed[0] as string, /\(4 nodes, 3 edges\)$/);
		});
	}

	// Group R4: the service answers, the target is not a node - no dangling edge.
	{
		const Run = MakeDisk(Root, { enabled: true });
		Mount(Run, { adapters: ["markdown"] });
		await Run.Graph.indexFile(DocPath);
		Check(Count, "R4: a resolved markdown reference with no Symbol node adds no edge", () => {
			assert.equal(
				Run.Graph.snapshot().edges.filter((Edge: any) => Edge.kind === "references").length,
				0,
			);
			assert.ok(
				Run.loggerLines.includes(
					`semantics: resolved ${DocPath} (1 symbols, 1 references)`,
				),
				JSON.stringify(LinesWith(Run, "semantics: resolved")),
			);
		});
	}

	// Group R5: the plan's short service alias is honored.
	{
		const Run = MakeDisk(Root, { enabled: true });
		const At = CORE.lastIndexOf("config.port");
		Run.Context.semantics = {
			resolve: async () => ({
				references: [{ target: "config.port", span: { start: At, end: At + 11 } }],
			}),
		};
		await Run.Graph.indexFile(CorePath);
		Check(Count, "R5: a service registered under the `semantics` alias is probed too", () => {
			assert.deepEqual(
				Run.Graph
					.snapshot()
					.edges.filter((Edge: any) => Edge.kind === "references")
					.map((Edge: any) => [Edge.from, Edge.to, Edge.span.startLine]),
				[[`File:${CorePath}`, `Symbol:${CorePath}:config`, 7]],
			);
		});
	}

	return Finish(Count, "References");
};

// Standalone entry: `node Target/Test/References/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - References`);
}
