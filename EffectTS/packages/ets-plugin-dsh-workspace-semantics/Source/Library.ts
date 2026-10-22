// Library - the entry module of the WORKSPACE-SEMANTICS service
// (@playform/plugin-dsh-workspace-semantics), SEMANTICS.md. Loader contract:
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
// THE ROLE: the semantic model - the symbols + the references + the
// dependencies + the index. The second step of the invisible flow, right
// after the observe stamps. On every fs/observed event (heard on the ROOT
// context, the factory's Wire registration) the stale model for the path is
// dropped and the index revision advances; a resolve() builds the model
// lazily through the file type's adapter. The rename semantics are
// per-adapter and a missing adapter is the refusal-to-guess answer.
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceSemantics` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "plugin-dsh-workspace-semantics";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services. `pluginFactory` provides the State builder (cell unwrap
// + shared fields + the P10 volatile refresh), the ledger, the match and the
// Wire registration. `fs` backs the lazy model build (readText for the
// adapter scan).
export const inject = ["pluginFactory", "fs"];

export const apply = Apply;

export default { name, apply, Config, inject };
