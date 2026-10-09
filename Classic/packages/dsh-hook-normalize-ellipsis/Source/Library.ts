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
// @playform/hook-dsh-normalize-ellipsis — the ellipsis normalizer for MODEL
// OUTPUT. The horizontal ellipsis (U+2026) is the typographic three-dot run
// collapsed into one code point by text processors; it renders
// inconsistently across fonts and terminals, while the plain ASCII "..."
// three-dot sequence is what every reader, shell and diff understands. The
// dsh plugin family hooks the llm/stream waterfall — the interceptable
// wrapper around EVERY streaming model call (retry, replay, routing), bound
// to the LlmRuntime. The normalization there flows into both the live UI
// and the durable transcript — VISIBLE by design, the opposite of the
// governance family's silence, because the normalization IS the feature.
//
// The transform is the core's Ellipsis CLASS with the configured replacement
// (default "..." — the ASCII three-dot sequence) — no context rules,
// whole-chunk replacement, chunk-boundary safe (no lookahead):
//   U+2026 — the horizontal ellipsis, the class's one member;
//   text-delta / reasoning-delta (when on) → the `text` field;
//   block-end → the assembled TextBlock.text / ReasoningBlock.text (plus a
//               runtime `thinking` string field, defensively), and the
//               ToolCallBlock.arguments when the tool-args flag is on;
//   tool-call-delta → the `argumentsDelta` text when the tool-args flag is
//               on (`normalizeToolArguments` — IMPLEMENTED, default OFF:
//               the arguments are execution-critical raw JSON, so enabling
//               it is the user's accepted risk; this profile's patch yml
//               turns it on; the gate is THREE-WAY with the flag on: a
//               delta/block whose `name` is "edit" passes through BY
//               IDENTITY (the edit tool's `old_string` must match the real
//               file bytes), and a call whose arguments open with the
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
// the storage Journal do not (this is a NON-MANIFEST module: no fs/observed,
// no gate, no Stash traffic, no policy discovery).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-normalize-ellipsis";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields) and the ledger — the stream-normalization flavors are
// NON-MANIFEST factory consumers. Nothing else: the chunk vocabulary arrives
// through the llm/stream waterfall, not an import.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
