// Library - the entry module (the loader contract): `export const name` +
// `export const apply` + `export const Config` + `export const inject` +
// `export default { name, apply, Config, inject }` - the ONLY named exports in
// the tree (cordis requires them); every other module is a nameless default
// export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "fs" without
// inject` (live-verified 2026-10-03; a smoke that calls apply directly never
// catches this).
//
// @playform/hook-dsh-comment-filter - a NEW OVERPASS FLAVOR: it hooks
// tools/post-execute and strips CODE COMMENTS from the `read` and
// `ccr_retrieve` tool results before they re-enter the model, and hooks
// agent/pre-step to stash the last user message as the per-task intent that
// gates the strip. The family's overpass arms normalize bytes AFTER the fact;
// this one OMITS them, which is why it is a flavor of the same machinery and
// not a governance module: the result is PRE-COMMIT (the tools/post-execute
// waterfall settles before the result is appended to the durable log), so the
// omission is not history rewriting - the transcript records what the model
// actually saw.
//
// THE INTENT GATE IS THE FEATURE'S ETHICS: a task whose last user message is
// ABOUT comments (docstring, jsdoc, license header, annotation, inline
// comment, ...) must keep them - stripping the very bytes the task is asking
// about would sabotage it. Any other task gets the comment-free view: fewer
// bytes, the code intact, and an omission notice that tells the model the
// comments existed.
//
// THE DELIBERATE OPPOSITE: the normalize flavors exempt `read` from their
// tool-results arm as byte-contracted; this flavor TARGETS it. `read` is not
// exempt here, because the omission IS the feature; the exemption list keeps
// the family's other byte contracts (edit, raw-write, normalize-file,
// subagent, ask_user_question).
//
// FULLY API-AWARE: the tool-result listener is a waterfall that ALWAYS calls
// next() first (Function/Overpass) and never throws into it (fail-open); the
// step listener is a pure observer that returns the downstream decision
// unchanged (Function/Intent); configuration is a validated Schemastery schema
// (Variable/Config) whose defaults Cordis fills at load. The factory's shared
// machinery is consumed for the State builder + the ledger + the core's
// tool-results arm factory; the fs/observed Wire and the storage Journal are
// not (non-manifest module: no fs, no gate, no Stash traffic).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-comment-filter";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields), the ledger (Append/Journal), and the core arm factory it
// feeds. Nothing else: the tool-result vocabulary arrives through the
// tools/post-execute waterfall, and the step payload through agent/pre-step -
// no fs, no tools registry, no llm runtime.
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
