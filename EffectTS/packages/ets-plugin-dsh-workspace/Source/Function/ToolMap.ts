// ToolMap - the `workspace_map` tool (V4-1 §3.4): a path or module and a
// depth in, the top-level modules, the file count, the entry points and the
// hot symbols out - a compact table plus the ids, never full file bodies.
// One canonical JSON value; the presenter is pure. The disabled plugin
// no-ops to a clear refusal (the IDLE-forever posture).
import { defineTool } from "@deepseek-ai/dsh-tools";
import { Map } from "@Function/Query.js";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";

export default (State_: State, Append: Log) =>
	defineTool({
		name: "workspace_map",
		description:
			"Map the workspace: given an optional path or module prefix, return the top-level modules with one-line roles, the file count, the entry-point files (nothing imports them) and the hot symbols (symbols in imported files). No file bodies - ids, paths, spans, kinds only.",
		parameters: {
			path: {
				type: "string",
				description: "Optional path or module prefix to scope the map to.",
			},
			depth: {
				type: "number",
				description: "Optional traversal depth (default from config mapDepth).",
			},
			cursor: {
				type: "string",
				description:
					"Pagination cursor: the id of the last hot symbol of the previous page.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					indexRevision: { type: "string", required: true },
					modules: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								id: { type: "string", required: true },
								path: { type: "string", required: true },
								role: { type: "string", required: true },
							},
						},
					},
					files: { type: "number", required: true },
					entryPoints: { type: "array", required: true, items: { type: "string" } },
					hotSymbols: {
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
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `map @ ${value.indexRevision}: ${value.files} files, ${value.modules.length} modules, ${value.entryPoints.length} entry points`,
				},
			],
		},
		async execute(args) {
			if (!State_.On) {
				throw new Error("workspace_map: the workspace plugin is disabled (enabled=false)");
			}
			const Request = (args ?? {}) as { path?: string; depth?: number; cursor?: string };
			const Result = Map(State_, State_.Graph, {
				...Request,
				depth: Request.depth ?? State_.MapDepth,
			});
			Append(
				`workspace: map ${Request.path ?? "(root)"} (${Result.modules.length} modules, ${Result.files} files)`,
			);
			return Result;
		},
	});
