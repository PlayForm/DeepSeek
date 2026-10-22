// Library - the entry module of the WORKSPACE-CONTEXT service
// (@playform/plugin-dsh-workspace-context). Loader contract: `export const
// name` + `export const apply` + `export const Config` + `export const
// inject` + `export default { name, apply, Config, inject }` - the ONLY
// named exports in the tree (cordis requires them); every other module is a
// nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory).
//
// THE ROLE: the attention projection - the required/relevant/deferred - the
// context economy. The service (registered as `workspaceContext` from apply)
// builds the ORIENTATION PACKET from the sibling workspace-graph's index:
// WORKSPACE / SCOPE / MAP / FOCUS / NEIGHBORS / EVIDENCE / OPEN / STALE
// (V4-1 section 3.5), bounded by the budget (target 2k tokens, configurable
// hard cap; the harness tokenMeter where available, else chars/4) and
// filtered through the lenses (code, docs, tests). The model-facing surface
// is the read-only `workspace_context` tool. The sibling graph shape is
// declared in this package's own Interface/ (the self-contained PoC rule);
// the end-phase wires the real import. The plugin ships DISABLED - the
// IDLE-forever posture.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "plugin-dsh-workspace-context";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh) and the ledger. The sibling
// `workspaceGraph` is NOT an inject: it is probed at apply/packet time so an
// absent sibling degrades to an honest OPEN line instead of blocking the
// loader (the factory's optional-facility pattern).
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
