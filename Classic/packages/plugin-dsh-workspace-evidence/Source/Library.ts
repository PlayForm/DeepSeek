// Library - the entry module of the WORKSPACE-EVIDENCE service
// (@playform/plugin-dsh-workspace-evidence), EVIDENCE.md. Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }` -
// the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory; a smoke that calls apply directly
// never catches this).
//
// THE ROLE: the validation objects + the evidence dependencies + the four
// kinds of truth + the stale-validation invalidation. The four kinds of
// truth (the Representation-First research): reality, observation,
// representation, intent. The validation objects declare their
// dependencies; the stale-validation invalidation fires when a dependency
// changes (the incremental-computation principle - the Acar seam), from the
// fs/observed stream through the factory's Wire, or from an explicit
// invalidate(key). A stale validation is never guessed back to fresh; a
// revalidation is a new validation object.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceEvidence` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "plugin-dsh-workspace-evidence";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh), the ledger, the match and the
// Wire registration. `fs` is not needed: the service reads only the events
// and the explicit calls, never file content.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
