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
// @playform/hook-dsh-normalize-file - the FILE-CONTENT normalizer, the
// hermes heritage beyond the tool layer: rewriting family characters in files
// ALREADY on disk. The ancestry is the hermes agent-hooks
// normalize-dashes-for-execute-code.sh hook, which swept files created inside
// scripts (write_file(), open()) that never passed through a write tool - the
// gap DSH's tool layer leaves open too, since only raw-write's explicit
// `normalize: true` touches disk today, and only for NEW writes. The
// inversion of the trigger is the design: hermes rewrote silently after the
// fact (and its normalize-tabs.sh hook is the cautionary tale - a repair hook
// for the first layer's own collateral damage); DSH makes it an explicit,
// visible, opt-in TOOL call instead - zero background activity by
// construction.
//
// The bundle is the family's FIRST LISTENER-LESS flavor: it registers NO
// llm/stream listener (no stream to normalize - the trigger is the tool
// call) and NO fs/observed listener (a background rewriter would break the
// edit tool's old_string contract - the agent read bytes X, the rewriter
// silently changed them to X', the next edit fails or half-matches - and
// interleave with the governance trio's bounded passes; the design report
// rejects that posture outright). Everything happens inside the tool's exec.
//
// The transformation is the family's SIX transforms applied whole, in the
// raw-write `normalize: true` order, through the core's tables and replacers
// (@playform/hook-dsh-core, imported directly - the same source the six
// stream flavors delegate to):
//   1. Dashes    class  -> the configured `replacement` (default "-")
//   2. Quotes    MAP    -> curly -> straight (no knob)
//   3. Ellipsis  class  -> "..."
//   4. Spaces    class  -> " "
//   5. Invisible class  -> "" (removed)
//   6. Fullwidth MAP    -> full-width -> half-width (no knob)
// applied with a per-character count (the core's `{ text, count }` contract,
// summed): N = 0 writes NOTHING (the no-op no-write rule - the file is left
// byte-identical, no ledger line, no journal record), N > 0 writes the
// rewritten content back through the factory's ONE shared write executor
// (`Factory.Write` - the fs/write-intent waterfall, the standing sandbox
// policy, writeText and the root-context fs/observed present emit are all
// the shared executor's), as the actor of the call.
//
// The stream gate EXEMPTS the tool by name (the core's Stream/Chunk +
// Stream/Block name-exempt list, beside `edit` and `raw-write`): the tool's
// call arguments carry a FILE PATH, and a stream flavor normalizing a dash
// inside a filename would corrupt the target - so a call to this tool
// carries its arguments through the stream untouched.
//
// FULLY FACTORY-BASED: the factory's shared machinery is consumed for what
// applies (State builder + ledger + journal + the shared write executor);
// the config is a validated Schemastery schema (Variable/Config) whose
// defaults Cordis fills at load.
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";

export const name = "hook-dsh-normalize-file";

// Loader contract (cordis): the exported schema is validated and defaulted
// while the plugin loads; apply receives a plain validated config object.
export const Config = Definition;

// Required services (skill: declare, never rely on load order). The factory
// (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
// shared fields), the ledger, the journal and the shared write executor;
// `fs` serves the tool's read path (resolve + readText - the vocabulary
// arrives type-only through the factory's own declarations, which import
// @deepseek-ai/dsh-fs); `tools` serves the tool registration.
export const inject = ["pluginFactory", "fs", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };
