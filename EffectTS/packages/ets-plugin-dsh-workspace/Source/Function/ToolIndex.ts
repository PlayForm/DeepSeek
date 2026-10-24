// ToolIndex - the `workspace_index` tool: the FIFTH tool, the INDEXING
// TRIGGER the conversation can pull (the family's core loop was dead while
// nothing filled the graph). A path (default = the session working directory)
// and an optional maxFiles in, the summary counts out: how many files this
// call indexed / skipped / failed, and how many file records the graph holds
// afterwards.
//
// The tool is a THIN delegate: the walk, the per-file gates, the bound and
// the counts all live in the graph service's `indexWorkspace` - the workspace
// agent stays a pure consumer and never touches ctx.fs itself (its fs seam is
// a throwing purity guard). The disabled plugin no-ops to the family's
// byte-exact refusal shape.
import { defineTool } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";

export default (State_: State, Append: Log) =>
	defineTool({
		name: "workspace_index",
		description:
			"Index the workspace into the graph: walk a root (default = the session working directory), index every supported file through the graph service's per-file gates, and return the counts (indexed, skipped, failed, files). Bounded by maxFiles. Run it before workspace_map/workspace_find/workspace_expand/workspace_context when the graph is empty.",
		parameters: {
			path: {
				type: "string",
				description: "The root to index (default = the session working directory).",
			},
			maxFiles: {
				type: "number",
				description:
					"The walk bound: at most this many candidate files (default from the graph config, maxFiles).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					indexRevision: { type: "string", required: true },
					indexed: { type: "number", required: true },
					skipped: { type: "number", required: true },
					failed: { type: "number", required: true },
					files: { type: "number", required: true },
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `index @ ${value.indexRevision}: ${value.indexed} indexed, ${value.skipped} skipped, ${value.failed} failed, ${value.files} files`,
				},
			],
		},
		async execute(args) {
			if (!State_.On) {
				throw new Error(
					"workspace_index: the workspace plugin is disabled (enabled=false)",
				);
			}
			const Request = (args ?? {}) as { path?: string; maxFiles?: number };
			// exactOptionalPropertyTypes: an absent maxFiles is an ABSENT key,
			// never an explicit undefined (the graph falls back to its config).
			const Options = Request.maxFiles === undefined ? {} : { maxFiles: Request.maxFiles };
			const Result = await State_.Graph.indexWorkspace(Request.path, Options);
			Append(
				`workspace: index ${Request.path ?? "(cwd)"} (${Result.indexed} indexed, ${Result.skipped} skipped, ${Result.failed} failed, ${Result.files} files)`,
			);
			return {
				indexRevision: State_.Graph.statistics().indexRevision,
				...Result,
			};
		},
	});
