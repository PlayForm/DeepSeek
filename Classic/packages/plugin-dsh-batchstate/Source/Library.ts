// Library - the entry module of the BATCH-STATE plugin
// (@playform/plugin-dsh-batchstate), BATCH-STATE-PLUGIN.md sections 2 and
// 7. Loader contract: `export const name` + `export const apply` +
// `export const Config` + `export const inject` + `export default { name,
// apply, Config, inject }` - the ONLY named exports in the tree (cordis
// requires them); every other module is a nameless default export composed
// Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the
// default object, or service accessors throw `cannot get property ...
// without inject` (live-verified in the factory; a smoke that calls apply
// directly never catches this).
//
// THE ROLE: the cooperative batch's live state board. The plugin owns the
// open-batch state (the members: id, role, the CURRENT ACTIVITY task, the
// status, the queue position, the owned surfaces, the timestamps), the
// write API (setTask/setStatus/setScope/queue - the parent's activations
// and the agents' phase reports), the read API (the `batchstate` service:
// getState/getContext/getScope/whoElse), the compiled presentation (the
// dynamic table-of-contents block, recompiled on every state change -
// Context = Compile(State)), and the ledger (one global log per module).
// Every state change emits the batch/state-change event and persists the
// full state into its store: the PRIMARY is the storage-domain KV domain
// (config `domain`), the FALLBACK the well-known JSON state file (config
// `stateFile`) - see SCHEME section 6. The presentation is READ-ONLY for the
// agents - it never modifies their own content.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `batchstate` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "plugin-dsh-batchstate";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. `pluginFactory` provides the State builder (cell
// unwrap + shared fields + the P10 volatile refresh) and the ledger. The
// store is OPTIONAL: the storage facility is probed once at apply (never an
// inject - an absent storage must degrade to the JSON fallback, not fail the
// load), and the JSON state file is the plugin's own plain-fs store (the
// documented exemption). No other service is consumed.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
