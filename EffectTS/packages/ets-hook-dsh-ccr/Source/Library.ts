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
// @playform/ets-hook-dsh-ccr - the CCR hook (compress-cache-retrieve) for TOOL
// OUTPUT. The file-hook precedent rewrites files after the fact and the
// normalize family rewrites model output; neither can shrink the model's
// CONTEXT: every DSH agent turn floods it with raw tool output (bash runs,
// grep matches, read slices, web pages, path lists). The CCR hook goes where
// that traffic flows: the tools/post-execute waterfall - the interceptable
// wrapper around every NORMALIZED dispatch result, bound to the ToolRuntime,
// before it becomes model content - and replaces oversized results with a
// one-line type-aware preview plus a retrieval marker, keeping the original
// retrievable through the registered ccr_retrieve tool. The compression is
// deliberately VISIBLE at the result layer (it IS the feature), the opposite
// of the governance family's silence.
//
// FULLY CONTRACT-AWARE: one waterfall listener (next() always awaited FIRST
// - the spill-policy precedent's discipline; pass-through returns the
// downstream decision unchanged; fail-open try/catch never throws into the
// waterfall), plus ONE registered tool (ccr_retrieve, ToolRuntime.register),
// and configuration is a validated Schemastery schema (Variable/Config, the
// plan §5 schema verbatim) whose defaults Cordis fills at load. The
// factory's shared machinery is consumed for what applies (State builder +
// ledger + cell unwrap); the fs/observed Wire and the storage Journal do not
// (a NON-MANIFEST module, like the normalize flavors).
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "ccr";

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
// shared fields) and the ledger; `tools` serves the ccr_retrieve
// registration (ToolRuntime.register accepts the ToolDefinition the
// Function/Retrieve builder returns). Nothing else: the chunk vocabulary of
// tool traffic arrives through the tools/post-execute waterfall, not an
// import, and the store's optional journal uses the plain-fs exemption.
export const inject = ["pluginFactory", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };
