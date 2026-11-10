/**
 * @module ToolIndex
 *
 * The `workspace_index` tool: the FIFTH tool, the INDEXING TRIGGER the
 * conversation can pull.
 *
 * @remarks
 * The family's core loop was dead while nothing filled the graph. A path
 * (default = the session working directory) and an optional maxFiles in, the
 * summary counts out: how many files this call indexed / skipped / failed, and
 * how many file records the graph holds afterwards.
 *
 * THE DEFAULT IS THE SESSION'S DIRECTORY, NOT THE PROCESS'S: an absent
 * `args.path` resolves through the harness's OPTIONAL `workingDirectory`
 * service - `ctx.workingDirectory.get(session)` for the agent the call runs on
 * behalf of. The graph's `indexWorkspace` resolves its own absent root as `"."`
 * through `ctx.fs.resolve`, which is the PROCESS cwd (`/` in the running app),
 * so leaving the path absent indexed nothing live (sweep, 2026-10-24). The
 * probe is guarded and never throws: a missing service, an absent agent or a
 * throwing getter falls back to the absent path, i.e. the graph's own `.`
 * resolution - the documented fallback, kept so a bare mount still works.
 *
 * The tool is a THIN delegate: the walk, the per-file gates, the bound and the
 * counts all live in the graph service's `indexWorkspace` - the workspace agent
 * stays a pure consumer and never touches ctx.fs itself (its fs seam is a
 * throwing purity guard). The disabled plugin no-ops to the family's byte-exact
 * refusal shape.
 */
import type State from "../Interface/State.js";
import type { Log } from "../Interface/State.js";
export default _default;
declare function _default(State_: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
