// Library - the entry module of the WORKSPACE-MERGE hook
// (@playform/hook-dsh-workspace-merge), MERGE.md. Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }` -
// the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified in the factory).
//
// THE ROLE: the step after the approve binds ("the merge commits, through
// Factory.Write"): the batch merge - the atomic gates, the per-file commits
// through the factory's shared write executor (the explicit
// replaceIfVersion intent, the P4 sandbox fence), and the commit reply
// union (applied / conflict / denied / rejected / recovery-required /
// outcome-unknown) derived from the v4.1 edit lifecycle. The v1 engine
// promises preview, version fence, and an explicit conflict - never a
// three-way merge (W4.1 section 3.8).
//
// The plugin is the OBJECT form (name/apply/Config/inject); the
// `workspaceMerge` service is a Service subclass in its own module
// (Function/Service) and is registered from apply.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-workspace-merge";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services. `pluginFactory` provides the State builder, the
// ledger, and - critically - the shared Write executor every per-file
// commit goes through. `fs` backs the gates' resolve/stat and the
// verification read-back.
export const inject = ["pluginFactory", "fs"];

export const apply = Apply;

export default { name, apply, Config, inject };
