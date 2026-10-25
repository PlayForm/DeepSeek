// ToolContext - the `workspace_context` tool (V4-1 §3.4 + §3.5): a node id
// or a query and a token budget in, the ORIENTATION PACKET out - the orient
// step of the orient -> drill -> act loop, in the fixed
// WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE grammar, bounded,
// ranked by edge strength, always versioned. A stale caller version sets
// the STALE line. The disabled plugin no-ops to a clear refusal.
import { defineTool } from "@deepseek-ai/dsh-tools";
import { Context } from "@Function/Query.js";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";

export default (State_: State, Append: Log) =>
	defineTool({
		name: "workspace_context",
		description:
			"Build the orientation packet for a node or query: WORKSPACE, SCOPE, MAP, FOCUS, NEIGHBORS (ranked by edge strength), EVIDENCE, OPEN (what the packet cannot answer) and STALE (when the caller's version differs). Bounded by a token budget (target 2k tokens); an overrun marks truncated instead of silently exceeding.",
		parameters: {
			id: {
				type: "string",
				description: "Focus node id (from workspace_map/workspace_find).",
			},
			query: { type: "string", description: "A query string when no focus node is known." },
			budget: {
				type: "number",
				description:
					"Token budget (default from config packetTokenBudget, capped at packetTokenMax).",
			},
			version: {
				type: "string",
				description: "Index revision the caller holds - a mismatch sets the STALE line.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					indexRevision: { type: "string", required: true },
					packet: {
						type: "object",
						additionalProperties: false,
						required: true,
						properties: {
							workspace: { type: "string", required: true },
							indexRevision: { type: "string", required: true },
							scope: { type: "string", required: true },
							map: { type: "array", required: true, items: { type: "string" } },
							focus: { type: "string" },
							neighbors: { type: "array", required: true, items: { type: "string" } },
							evidence: { type: "array", required: true, items: { type: "string" } },
							open: { type: "array", required: true, items: { type: "string" } },
							stale: { type: "string" },
						},
					},
					text: { type: "string", required: true },
					tokens: { type: "number", required: true },
					budget: { type: "number", required: true },
					truncated: { type: "boolean", required: true },
				},
			},
			render: (_args, value) => [{ type: "text", text: value.text }],
		},
		async execute(args) {
			if (!State_.On) {
				throw new Error(
					"workspace_context: the workspace plugin is disabled (enabled=false)",
				);
			}
			const Request = (args ?? {}) as {
				id?: string;
				query?: string;
				budget?: number;
				version?: string;
			};
			const Result = Context(State_, State_.Graph, Request);
			State_.LastPacketTokens = Result.tokens;
			Append(
				`workspace: packet ${Request.id ?? Request.query ?? "(overview)"} (${Result.tokens} tokens, budget ${Result.budget})`,
			);
			return Result;
		},
	});
