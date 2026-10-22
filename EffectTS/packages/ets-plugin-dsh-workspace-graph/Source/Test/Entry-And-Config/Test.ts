// Source/Test/Entry-And-Config/Test.ts - the entry seam and the config
// contract: the service registers on the fake ctx under the exact name
// workspaceGraph (A3), the class carries the loader contract (static inject,
// static Config), the byte-exact activation line, the schema defaults,
// the volatile-cell unwrap, the Schemastery type throw, the fail-loud
// validation messages, and the declaration-merging compile proof.
// Unit smoke of @playform/plugin-dsh-workspace-graph: the fake ctx + the REAL
// built class, from the Harness.
import assert from "node:assert/strict";
import type { Context } from "@deepseek-ai/cordis";
import { Check, Finish, MakeCounter, MakeGraph } from "../Harness.js";
import type WorkspaceGraph from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: the entry seam (A3).
	{
		const Run = MakeGraph({ files: {} });
		Check(Count, "entry: the service registers on the fake ctx under workspaceGraph (A3)", () => {
			assert.equal(Run.provided["workspaceGraph"], Run.Graph);
			assert.equal(Run.Graph.name, "workspaceGraph");
		});
		Check(Count, "entry: the class carries the loader contract (static inject, static Config)", () => {
			const Graph = Run.Graph.constructor as any;
			assert.deepEqual(Graph.inject, ["fs", "storage"]);
			assert.equal(typeof Graph.Config, "function");
			assert.equal(Run.Graph.name, "workspaceGraph");
		});
		Check(Count, "entry: the activation line is byte-exact", () => {
			assert.ok(
				Run.loggerLines.includes("graph: activated (domain=workspace_graph, languages=3)"),
			);
		});
		Check(Count, "entry: the declaration-merged accessor types as the service (A3 compile proof)", () => {
			const Accessor = (Typed: Context): WorkspaceGraph => Typed.workspaceGraph;
			assert.equal(typeof Accessor, "function");
		});
	}

	// Group: the config defaults and the volatile cells.
	{
		const Defaults = MakeGraph({ files: {} });
		Check(Count, "config: the schema defaults flow into the plain State config", () => {
			assert.deepEqual(Defaults.State.Config, {
				enabled: false,
				domain: "workspace_graph",
				languages: ["typescript", "javascript", "markdown"],
				include: [],
				exclude: ["node_modules/**", "**/Target/**", "**/.git/**"],
				maxFileBytes: 1000000,
				maxNodesPerFile: 5000,
				limitDefault: 50,
				limitMaximum: 500,
			});
		});
		Check(Count, "config: every volatile field arrives as a cell and unwraps", () => {
			const Cells = (Defaults.Graph.constructor as any).Config({});
			for (const Key of ["enabled", "domain", "languages", "include", "exclude", "maxFileBytes", "maxNodesPerFile", "limitDefault", "limitMaximum"]) {
				assert.equal(typeof Cells[Key]?.get, "function", `cell for ${Key}`);
			}
			assert.equal(Defaults.State.Config.domain, "workspace_graph");
		});
	}

	// Group: fail-loud validation (each refusal on the exact message). The
	// Schemastery type throw runs first for wrong-typed fields; the structural
	// refusals are the service's own Validate.
	{
		const Fails = (Raw: any): string => {
			try {
				MakeGraph({ ...Raw, files: {} });
			} catch (Error_) {
				return (Error_ as Error).message;
			}
			return "no throw";
		};
		let SchemaError: any = null;
		try {
			MakeGraph({ maxFileBytes: {} as any, files: {} });
		} catch (Error_) {
			SchemaError = Error_;
		}
		Check(Count, "config: a wrong-typed field fails loud at the schema (Schemastery)", () => {
			assert.match(SchemaError?.message ?? "", /expected number/);
		});
		Check(Count, "fail-loud: an empty domain is rejected", () => {
			assert.equal(Fails({ domain: "" }), "invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/");
		});
		Check(Count, "fail-loud: a domain outside the unit-name pattern is rejected", () => {
			assert.equal(Fails({ domain: "Workspace Graph" }), "invalid config: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/");
		});
		Check(Count, "fail-loud: empty languages are rejected", () => {
			assert.equal(Fails({ languages: [] }), 'invalid config: languages must be a non-empty array of "typescript" | "javascript" | "markdown"');
		});
		Check(Count, "fail-loud: limitDefault above limitMaximum is rejected", () => {
			assert.equal(Fails({ limitDefault: 10, limitMaximum: 5 }), "invalid config: limitDefault must not exceed limitMaximum");
		});
	}

	return Finish(Count, "Entry-And-Config");
};

// Standalone entry: `node Target/Test/Entry-And-Config/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Entry-And-Config`);
}
