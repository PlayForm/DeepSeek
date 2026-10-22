// ToolFind - the `workspace_find` tool (V4-1 §3.4): a name or pattern, a
// kind and a limit in, the matching nodes with id, path, span, kind out -
// a compact table plus the ids. Pagination is by CURSOR (the id of the last
// node of the previous page), never by offset. The disabled plugin no-ops
// to a clear refusal (the IDLE-forever posture).
import { defineTool } from "@deepseek-ai/dsh-tools";
import { Find } from "@Function/Query.js";
import type { NodeKind } from "@Interface/Graph.js";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";

export default (State_: State, Append: Log) =>
	defineTool({
		name: "workspace_find",
		description:
			"Find nodes in the workspace graph: by exact name or by glob pattern, optionally filtered by kind (File, Symbol, Block, Test, DocSection) and limited. Returns id, path, span, kind, fingerprint, version - no file bodies. Pagination is by cursor, not offset.",
		parameters: {
			name: { type: "string", description: "Exact node name to find." },
			pattern: { type: "string", description: "Glob pattern on the node id or path." },
			kind: {
				type: "string",
				description: "Optional kind filter: File | Symbol | Block | Test | DocSection.",
			},
			limit: {
				type: "number",
				description: "Max results (default and hard cap from config).",
			},
			cursor: {
				type: "string",
				description: "Pagination cursor: the id of the last node of the previous page.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					indexRevision: { type: "string", required: true },
					nodes: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								id: { type: "string", required: true },
								kind: { type: "string", required: true },
								path: { type: "string", required: true },
								name: { type: "string" },
								startLine: { type: "number" },
								endLine: { type: "number" },
								fingerprint: { type: "string", required: true },
								version: { type: "string", required: true },
							},
						},
					},
					truncated: { type: "boolean", required: true },
					cursor: { type: "string" },
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `find @ ${value.indexRevision}: ${value.nodes.length} nodes${value.truncated ? " (more)" : ""}`,
				},
			],
		},
		async execute(args) {
			if (!State_.On) {
				throw new Error("workspace_find: the workspace plugin is disabled (enabled=false)");
			}
			const Request = (args ?? {}) as {
				name?: string;
				pattern?: string;
				kind?: NodeKind;
				limit?: number;
				cursor?: string;
			};
			const Result = Find(State_, State_.Graph, Request);
			Append(
				`workspace: find ${Request.name ?? Request.pattern ?? "(all)"} (${Result.nodes.length} nodes)`,
			);
			return Result;
		},
	});
