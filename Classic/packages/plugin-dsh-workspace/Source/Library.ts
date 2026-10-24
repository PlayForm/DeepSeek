// Library - the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// - the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw (live-verified 2026-10-03).
//
// @playform/plugin-dsh-workspace - the workspace agent: the workspace regime's
// conversational surface (the CONTROLLER the conversation addresses,
// WORKSPACE-AGENT.md section 4). The operational view is what the
// conversation sees; the four navigation tools (workspace_map, workspace_find,
// workspace_expand, workspace_context) are its query surface (V4-1 §3.4), the
// FIFTH tool (workspace_index) is the indexing trigger that fills the graph,
// and the orientation packet is the orient step of the orient -> drill ->
// act loop (§3.5). Everything else is the INVISIBLE plugin flow until an
// event surfaces it (the visibility rule). The plugin is a pure CONSUMER:
// it injects the Wave-1 graph service, the factory and the tools surface,
// registers the five tools, and owns no event listeners in v0 - the
// invisible flow belongs to the sibling hooks (the distribution law).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "plugin-dsh-workspace";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The graph
// (@playform/plugin-dsh-workspace-graph) provides the data and the indexing
// trigger; the factory provides the State builder + the ledger; tools serves
// the five registrations.
export const inject = ["workspaceGraph", "pluginFactory", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };
