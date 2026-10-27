// Library - the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// - the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "..." without
// inject` (live-verified 2026-10-03).
//
// @playform/hook-dsh-edit-suggester - the modification-intent COMPANION
// SUGGESTER, the second consumer of the search-suggester's pattern algebra
// and the two-consumer extraction trigger (SEARCH-SUGGESTER-PLUGIN.md section
// 8.1). The evidence: the edit is where the discovery happens - the model
// edited its way to the target sets it never thought to open (section 1.4).
// The plugin hooks the tools/post-execute waterfall for the modification
// tools (write, edit, raw-write) and, when the edited path matches one of
// the convention families (Version, Config, Symbol, Test, Doc, Prose,
// Workflow), prepends ONE labeled additionalContexts note naming the
// companions the model has not touched yet - "this file rarely stands
// alone". Deterministic path rules, no LLM in the hot path, a hard gate, a
// cooldown, a dedupe, a per-turn cap, and an abstention line for every
// silence. The note never claims the Transform: it names the companions;
// deciding the change is the model's.
//
// FULLY CONTRACT-AWARE: one tools/post-execute waterfall listener (next()
// always awaited FIRST; pass-through returns the downstream decision
// unchanged; fail-open try/catch never throws into the waterfall), plus the
// agent/pre-step reset, and a validated Schemastery schema (Variable/Config)
// whose defaults Cordis fills at load. The factory's shared machinery is
// consumed for what applies (State builder + ledger + cell unwrap); the
// fs/observed Wire and the storage Journal do not (a NON-MANIFEST module).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-edit-suggester";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields) and the ledger. Nothing else: the edit vocabulary of tool
// traffic arrives through the tools/post-execute waterfall, not an import.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
