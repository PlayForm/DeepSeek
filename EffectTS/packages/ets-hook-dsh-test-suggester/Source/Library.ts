// Library - the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// - the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property ... without
// inject` (live-verified 2026-10-03; a smoke that calls apply directly never
// catches this).
//
// @playform/hook-dsh-test-suggester - the test-suggester hook. The model
// runs search after search to find the proof for a change (PASS/FAIL/error
// TS greps, Test.ts reads, error sweeps). This hook answers the TEST intent
// with a TARGET SET: at the first call of the intent, it prepends ONE
// labeled additionalContexts notice naming the standard locations - the
// suite's Test.ts, the suite README (the expected count), the aggregate
// runner, the README badge. Deterministic classifier (no LLM in the hot
// path), high threshold, at most maxCandidates candidates with a stated
// reason each, a cooldown, a per-turn cap, and an abstention path: a wrong
// target set costs more than a missing one (SEARCH-SUGGESTER-PLUGIN.md
// sections 3, 4, 8 - the test consumer of the suggester family).
//
// THE RECONCILIATION (the completion spec's wave 2c re-spec) rides the same
// listener: on a judged call in a package, the package's smoke claims (the
// folder READMEs' `## Expected count`) are compared with the tree (the
// folders, the suite files, the aggregate runner's roster) and, when the
// workspace graph is present, its `Test` nodes. A drift emits ONE note naming
// the drifted files and the expected/actual counts; the consistent tree logs
// one clear line and stays silent. It is READ-ONLY (`node:fs` reads, never
// `ctx.fs`) and gated by the same enabled/cooldown/dedupe/cap knobs.
//
// READ-ONLY by design: the hook never edits, never rewrites arguments, and
// never denies - its only surface is the additionalContexts notice, so a
// ccr-compressed result is unaffected.
//
// FULLY CONTRACT-AWARE: every listener awaits next() FIRST and is fail-open
// (never throws into a waterfall). The hook is a NON-MANIFEST module (no
// fs/observed machinery) that consumes the factory for the State builder
// (with the P10 volatile refresh) and the ledger. The per-agent state is
// keyed on the Agent object (the tool-coach precedent); the durable record
// is the ledger file (one log per module).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "test-suggester";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/ets-plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields + the P10 volatile refresh) and the ledger. Nothing else:
// the hook registers no tool, reads no registry, and writes only its own
// ledger.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
