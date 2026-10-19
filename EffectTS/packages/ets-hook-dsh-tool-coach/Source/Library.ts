// Library - the entry module (mirrors Source/Library.rs). Loader contract:
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`
// - the ONLY named exports in the tree (cordis requires them); every other
// module is a nameless default export composed Rust-style.
//
// THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
// SHADOWS the named exports - inject and Config MUST also sit on the default
// object, or service accessors throw `cannot get property "fs" without
// inject` (live-verified 2026-10-03; a smoke that calls apply directly never
// catches this).
//
// @playform/hook-dsh-tool-coach - the tool-coach hook. The model "is still
// regressing to use bash and sed for simple read write calls which can be
// tool calls". The coach goes where that regression flows and teaches the
// full harness toolset through a FOUR-TIER ladder over the TERMINAL tool
// calls (plan Documentation/Plans/TOOL-COACH-OPERATIVE-PLAN.md):
//
//   tier 0  tools/post-execute   a durable ledger line for EVERY detected
//                                content-class offense (write/read/search/
//                                discovery/control - the terminal runs
//                                COMMANDS; the tools handle CONTENT);
//   tier 1  tools/post-execute   a labeled additionalContexts notice (source
//                                {kind: 'tool-coach', form: 'notice',
//                                summary}) once a class accumulates
//                                `threshold` strikes within `window` judged
//                                calls, cooled down by `cooldown` - the note
//                                names the correct tool with its LIVE
//                                registry description (ctx.tools.schemas(),
//                                first sentence + key parameter) and the
//                                fs/observed traceability mechanism;
//   tier 2  system-prompt/assemble  a persistent "Tool discipline" section
//                                (three fixed rules + a live-fetched tool
//                                table capped at maxSectionTools rows) while
//                                the strikes last - the PTC carrier (PTC
//                                sub-calls omit additionalContexts) - turned
//                                off again after cleanWindow clean judged
//                                calls, cache-invalidated on tools/change;
//   tier 3  tools/pre-execute    (opt-in, enforce) the call is DENIED and
//                                the reason text is the model-facing tool
//                                result - self-teaching.
//
// Detection is deliberately adversarial (plan Part 2 §2.7): command
// normalization, an intent-marker scan, a craft library, and a catch-all that
// lands any write-intent marker on a real path - novel zero-day forms still
// count. The dedicated tools are never judged; legitimate bash (builds,
// tests, git, package managers, file lifecycle) is exempt by default.
//
// FULLY CONTRACT-AWARE: the post-execute listener runs AFTER the ccr
// {prepend:true} listener and normalize's post-execute (plain registration
// order); every listener awaits next() FIRST and is fail-open (never throws
// into a waterfall). The coach does NOT use factory Wire/Attach/Schema: it is
// a NON-MANIFEST module (no fs/observed machinery) that consumes the factory
// for the State builder (with the P10 volatile refresh - every knob is
// hot-editable) and the ledger. The per-agent coaching state lives in a
// WeakMap keyed on the Agent object (the repeat-tool-reminder precedent); the
// durable record is the ledger file (one log per module).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-tool-coach";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields + the P10 volatile refresh) and the ledger; `tools` serves
// the live registry fetch (ctx.tools.schemas(), plan Part 3 §3.1). Nothing
// else: the coach registers NO fs/observed listener, never touches the
// factory executor, and never writes files outside its own ledger.
export const inject = ["pluginFactory", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };
