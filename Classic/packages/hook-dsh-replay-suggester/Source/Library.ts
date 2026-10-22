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
// @playform/hook-dsh-replay-suggester - the replay-suggester hook. It
// answers the question "the last time this was done, what did the model
// actually touch and how did it verify?" (SEARCH-SUGGESTER-PLUGIN.md §9.3):
// when the model searches with an intent it has pursued before, the hook
// recalls the matching record from its history store
// (~/.dsh/replay-suggester/history.json, the seed of the search-suggester's
// journal) and prepends ONE labeled additionalContexts notice: the files
// touched last time and the verification command. The store is loaded once
// at apply (a JSON read on the boot path, not the hot path); a missing or
// corrupt store degrades to silence, never to a guess - without a record
// the hook abstains (`replay no-memory`). Deterministic classifier (no LLM
// in the hot path), high threshold, a cooldown, a per-turn cap, and an
// abstention path.
//
// READ-ONLY by design: the hook never edits, never rewrites arguments,
// never denies, and never writes the history store in v1 (the store is
// seeded by the offline learner / the search-suggester journal - the
// end-phase wiring). Privacy posture (plan §5.4): repo-relative paths only,
// local only.
//
// FULLY CONTRACT-AWARE: every listener awaits next() FIRST and is fail-open
// (never throws into a waterfall). The hook is a NON-MANIFEST module (no
// fs/observed machinery) that consumes the factory for the State builder
// (with the P10 volatile refresh) and the ledger. The per-agent state is
// keyed on the Agent object (the tool-coach precedent); the durable record
// is the ledger file (one log per module).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "replay-suggester";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields + the P10 volatile refresh) and the ledger. The history
// store is the hook's own file read (plain fs, the same exemption the
// ledger append uses) - no service for it.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
