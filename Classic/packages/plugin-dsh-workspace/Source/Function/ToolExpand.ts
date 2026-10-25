// ToolExpand - the `workspace_expand` tool (V4-1 §3.4): a node id, optional
// edge kinds and depth in, the neighbors out (references, calls, imports,
// tests). The W1 graph serves the contains/imports kinds it parses; a
// requested deferred kind yields an honest empty set, never a fake edge.
// The disabled plugin no-ops to a clear refusal (the IDLE-forever posture).
import { defineTool } from "@deepseek-ai/dsh-tools";
import { Expand } from "@Function/Query.js";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";

export default (State_: State, Append: Log) =>
	defineTool({
		name: "workspace_expand",
		description:
			"Expand a node: for a node id (from workspace_map or workspace_find), return the connected nodes and edges. Edge kinds: contains, imports (references, calls and tests are deferred to W2+ and return empty honestly). Depth is capped at 3 by the graph contract.",
		parameters: {
			id: { type: "string", description: "Node id to expand (required)." },
			kinds: { type: "array", description: 'Optional edge-kind filter, e.g. ["imports"].' },
			depth: {
				type: "number",
				description: "Traversal depth (default: config expandDepth, capped at 3).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					indexRevision: { type: "string", required: true },
					node: {
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
					edges: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								kind: { type: "string", required: true },
								from: { type: "string", required: true },
								to: { type: "string", required: true },
								startLine: { type: "number" },
							},
						},
					},
					truncated: { type: "boolean", required: true },
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `expand @ ${value.indexRevision}: ${value.nodes.length} neighbors, ${value.edges.length} edges`,
				},
			],
		},
		async execute(args) {
			if (!State_.On) {
				throw new Error(
					"workspace_expand: the workspace plugin is disabled (enabled=false)",
				);
			}
			const Request = (args ?? {}) as { id: string; kinds?: string[]; depth?: number };
			const Result = Expand(State_, State_.Graph, Request);
			Append(
				`workspace: expand ${Request.id} (${Result.nodes.length} nodes, ${Result.edges.length} edges)`,
			);
			return Result;
		},
	});
