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
// @playform/hook-dsh-search-suggester - the search-intent TARGET SUGGESTER.
// The evidence (Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md section 1):
// 46% of every tool call in the measured sessions is a search-class call,
// and the model's discovery is late - in the release lane only 6% of the
// files it eventually edited had been read before its first edit. The plugin
// infers the intent from the call and the recent context and names the likely
// targets BEFORE the model finishes searching: one labeled additionalContexts
// note on the tools/post-execute waterfall, deterministic (no LLM in the hot
// path), gated hard (threshold 0.75, 0.85 for the destructive intents), at
// most 7 candidates each with a stated reason, with a cooldown, a dedupe, a
// per-turn cap, and an explicit abstention path where every abstention is a
// ledger line - the algebra's identity element is silence.
//
// FULLY CONTRACT-AWARE: one tools/post-execute waterfall listener (next()
// always awaited FIRST; pass-through returns the downstream decision
// unchanged; fail-open try/catch never throws into the waterfall), plus the
// agent/pre-step reset, the optional sticky section (system-prompt/assemble,
// off by default), the tools/change invalidation, and a validated Schemastery
// schema (Variable/Config, the plan section 4.8 schema) whose defaults Cordis
// fills at load. The factory's shared machinery is consumed for what applies
// (State builder + ledger + cell unwrap); the fs/observed Wire and the
// storage Journal do not (a NON-MANIFEST module).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-search-suggester";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's four names (name, apply,
// Config, inject) are unchanged, and the default object below stays exactly
// { name, apply, Config, inject }.
export { Version };

// Required services (skill: declare, never rely on load order). The factory
// (@playform/ets-plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields) and the ledger. Nothing else: the search vocabulary of tool
// traffic arrives through the tools/post-execute waterfall, not an import,
// and the knowledge file uses the plain-fs exemption (Function/Persist).
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
