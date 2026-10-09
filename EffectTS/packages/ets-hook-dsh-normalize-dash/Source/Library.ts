// Library — the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// — the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports — inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "fs" without
// inject` (live-verified 2026-10-03; a smoke that calls apply directly never
// catches this).
//
// @playform/ets-hook-dsh-normalize-dash — the dash normalizer for MODEL OUTPUT. The
// the file-hook precedent rewrites the
// unicode dash family to ASCII hyphen-minus in files after the fact; the
// dsh plugin family can go where a file hook cannot: the llm/stream waterfall,
// the interceptable wrapper around EVERY streaming model call (retry,
// replay, routing), bound to the LlmRuntime. The normalization there flows
// into both the live UI and the durable transcript — VISIBLE by design, the
// opposite of the governance family's silence, because the normalization IS
// the feature.
//
// The transform is exactly the core's dash class — no context rules, whole-chunk
// single-character replacement, chunk-boundary safe (no lookahead):
//   text-delta / reasoning-delta (when on) → the `text` field;
//   block-end → the assembled TextBlock.text / ReasoningBlock.text (plus a
//               runtime `thinking` string field, defensively), and the
//               ToolCallBlock.arguments when the tool-args flag is on;
//   tool-call-delta → the `argumentsDelta` text when the tool-args flag is
//               on (`normalizeToolArguments` — IMPLEMENTED, default OFF:
//               the arguments are execution-critical raw JSON, so enabling
//               it is the user's accepted risk; this profile's patch yml
//               turns it on; the gate is THREE-WAY with the flag on: a
//               delta/block whose `name` is "edit" or "raw-write" passes
//               through BY IDENTITY (the edit tool's `old_string` must match
//               the real file bytes; the raw-write tool owns its
//               normalization via the explicit `normalize` parameter —
//               Function/Write), and a call whose arguments open with the
//               `{"__normalize":false` first-key marker passes through
//               UNNORMALIZED with the marker entry stripped, so the
//               executed call carries no unknown key);
//   block-start / usage / finish → passthrough BY IDENTITY, ALWAYS.
//
// FULLY API-AWARE: one waterfall listener (next() always called — omitting
// it short-circuits the model call; options never touched — LOOP-built
// requests are deep-frozen and must not be rewritten), chunk order
// preserved, no buffering, upstream throws propagate, and configuration is
// a validated Schemastery schema (Variable/Config) whose defaults Cordis
// fills at load. The factory's shared machinery is consumed for what
// applies (State builder + ledger + cell unwrap); the fs/observed Wire and
// the storage Journal do not (this is the factory's first NON-MANIFEST
// module: no fs/observed, no gate, no Stash traffic, no policy discovery).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-normalize-dash";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/ets-dsh-plugin-factory) provides the State builder (cell unwrap +
// shared fields) and the ledger — the dash normalizer is the factory's SECOND
// consumer, and the first NON-MANIFEST module. `fs` + `tools` serve the
// family's raw-write tool (Function/Write): the tool registry receives the
// definition, and the fs service carries the write path (resolve →
// fs/write-intent → writeText → fs/observed — the built-in write's exact
// sequence). Nothing else: the chunk vocabulary arrives through the
// llm/stream waterfall, not an import.
export const inject = ["pluginFactory", "fs", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };
