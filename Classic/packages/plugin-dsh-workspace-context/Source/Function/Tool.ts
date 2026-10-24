// Tool - the model-facing surface (Function/Tool): the `workspace_context`
// tool (V4-1 section 3.4), read-only, one canonical JSON value, a pure
// presenter. Registered from apply through the context's `tools` facility
// (the live-containers registration posture). The tool delegates to the
// packet builder (Function/Packet) and renders the packet's text form
// (Function/Render); it never writes.
import { defineTool } from "@deepseek-ai/dsh-tools";
import PacketBuild from "@Function/Packet.js";
import Render from "@Function/Render.js";
import type State from "@Interface/State.js";

export default (Agent: State) =>
	defineTool({
		name: "workspace_context",
		description:
			"Workspace orientation packet: the situation view of the workspace index (MAP, FOCUS, NEIGHBORS, EVIDENCE, OPEN, STALE) within a bounded token budget, through a lens (code, docs, tests). Read-only: it never writes. Pass id or query to set the focus; the STALE section appears when your held version differs from the current one.",
		parameters: {
			id: {
				type: "string",
				description: "The node id to focus on (e.g. Symbol:<path>:<name>).",
			},
			query: {
				type: "string",
				description: "A name query to resolve the focus from.",
			},
			lens: {
				type: "string",
				description: "The lens: code (default), docs, or tests.",
			},
			callerVersion: {
				type: "string",
				description: "The version you currently hold, to detect a stale view.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					text: { type: "string", required: true },
					tokens: { type: "integer", required: true },
					lens: { type: "string", required: true },
					stale: { type: "boolean", required: true },
				},
			},
			render: (_args, value) => {
				const V = value as { text: string };
				return [{ type: "text", text: V.text }];
			},
		},
		async execute(args) {
			const Read = (Key: string): string | undefined => {
				const Value = (args as Record<string, unknown> | null)?.[Key];
				return typeof Value === "string" && Value.length > 0 ? Value : undefined;
			};
			const Id = Read("id");
			const Query = Read("query");
			const Lens = Read("lens");
			const CallerVersion = Read("callerVersion");
			const Item = PacketBuild(Agent, {
				...(Id !== undefined ? { id: Id } : {}),
				...(Query !== undefined ? { query: Query } : {}),
				...(Lens !== undefined ? { lens: Lens } : {}),
				...(CallerVersion !== undefined ? { callerVersion: CallerVersion } : {}),
			});
			return {
				text: Render(Item),
				tokens: Item.tokens,
				lens: Item.lens,
				stale: Item.stale !== undefined,
			};
		},
	});
