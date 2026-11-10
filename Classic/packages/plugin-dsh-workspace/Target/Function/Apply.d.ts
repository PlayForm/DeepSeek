/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * durable activation proof, and the FIVE tools.
 *
 * @remarks
 * The State build is the factory's cell unwrap plus the P10 volatile refresh.
 * The five tools are the only conversational surface - WORKSPACE-AGENT.md
 * section 2: the four navigation tools plus the `workspace_index` indexing
 * trigger that fills the graph. There are NO event listeners in v0: the agent
 * is a consumer of the graph service and the surface for the conversation - the
 * invisible flow (the stamps, the indexes, the gates) belongs to the sibling
 * hooks, not to the agent.
 *
 * THE DISABLED POSTURE: enabled=false ships default - the State build logs
 * `disabled (enabled=false)` and every tool no-ops to a clear refusal (each
 * checks State.On first).
 *
 * `inject: ["workspaceGraph", "pluginFactory", "tools"]` (Library.ts) - the
 * graph provides the data, the factory the State builder + the ledger, and
 * tools the registration surface.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
