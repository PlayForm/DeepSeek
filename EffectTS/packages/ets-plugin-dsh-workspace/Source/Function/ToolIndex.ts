// ToolIndex - the `workspace_index` tool: the FIFTH tool, the INDEXING
// TRIGGER the conversation can pull (the family's core loop was dead while
// nothing filled the graph). A path (default = the session working directory)
// and an optional maxFiles in, the summary counts out: how many files this
// call indexed / skipped / failed, and how many file records the graph holds
// afterwards.
//
// THE DEFAULT IS THE SESSION'S DIRECTORY, NOT THE PROCESS'S: an absent
// `args.path` resolves through the harness's OPTIONAL `workingDirectory`
// service - `ctx.workingDirectory.get(session)` for the agent the call runs on
// behalf of. The graph's `indexWorkspace` resolves its own absent root as
// `"."` through `ctx.fs.resolve`, which is the PROCESS cwd (`/` in the running
// app), so leaving the path absent indexed nothing live (sweep, 2026-10-24).
// The probe is guarded and never throws: a missing service, an absent agent or
// a throwing getter falls back to the absent path, i.e. the graph's own `.`
// resolution - the documented fallback, kept so a bare mount still works.
//
// The tool is a THIN delegate: the walk, the per-file gates, the bound and
// the counts all live in the graph service's `indexWorkspace` - the workspace
// agent stays a pure consumer and never touches ctx.fs itself (its fs seam is
// a throwing purity guard). The disabled plugin no-ops to the family's
// byte-exact refusal shape.
import { defineTool, type ToolRunContext } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
import type { Log } from "@Interface/State.js";

/**
 * The session cwd, probed from the OPTIONAL harness service - never a hard
 * inject, never an unguarded accessor: the service may be absent (a bare
 * mount) and its getter may throw. The probe must never throw; a missing cwd
 * falls back to the graph's own `.` resolution (the process cwd), the
 * behaviour that predates the default and stays the guarded fallback.
 */
const Session = (State_: State, Exec: ToolRunContext): string | undefined => {
	try {
		const Service = State_.Context.get?.("workingDirectory") as
			{ get?: (Session: unknown) => unknown } | undefined;
		const Cwd = Service && Exec.agent ? Service.get?.(Exec.agent.session) : undefined;
		return typeof Cwd === "string" && Cwd.length > 0 ? Cwd : undefined;
	} catch {
		return undefined;
	}
};

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
		async execute(args, Exec) {
			if (!State_.On) {
				throw new Error(
					"workspace_index: the workspace plugin is disabled (enabled=false)",
				);
			}
			const Request = (args ?? {}) as { path?: string; maxFiles?: number };
			// exactOptionalPropertyTypes: an absent maxFiles is an ABSENT key,
			// never an explicit undefined (the graph falls back to its config).
			const Options = Request.maxFiles === undefined ? {} : { maxFiles: Request.maxFiles };
			// FIX A: an absent path defaults to the SESSION's working directory;
			// an undefined Root is the guarded fallback (the graph's own `.`).
			const Root = Request.path ?? Session(State_, Exec);
			const Result = await State_.Graph.indexWorkspace(Root, Options);
			Append(
				`workspace: index ${Root ?? "(cwd)"} (${Result.indexed} indexed, ${Result.skipped} skipped, ${Result.failed} failed, ${Result.files} files)`,
			);
			return {
				indexRevision: State_.Graph.statistics().indexRevision,
				...Result,
			};
		},
	});
