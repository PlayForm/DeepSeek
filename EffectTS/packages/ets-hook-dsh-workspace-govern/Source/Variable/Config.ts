// Config - the hook's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load,
// and `apply` receives a validated plain config object. The shape this schema
// produces is Interface/Config.ts; the contract is GOVERN.md +
// WORKSPACE-FAMILY-V4-1.md section 3.9.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`).
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, tools, scope, policy, recovery, ...) takes
// effect on the next gated call.
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/govern.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	// The gated tools: the tool names whose calls carry the gate (the
	// mutating surface of the workspace family's operate step).
	tools: Schema.array(Schema.string())
		.default(["write", "edit", "bash", "applyPatch"])
		.volatile(),
	// The authorized-scope allowlist (globs). Empty = unrestricted (the
	// scope obligation evaluates "n/a"); non-empty = every gated target must
	// match at least one glob, and an unevaluable match FAILS CLOSED.
	scope: Schema.array(Schema.string()).default([]).volatile(),
	// The excluded target globs - never gated (the family's internals).
	exclude: Schema.array(Schema.string())
		.default(["node_modules/**", "**/Target/**", "**/.git/**"])
		.volatile(),
	// The policy table: rules per proposal kind; the first match wins.
	policy: Schema.array(
		Schema.object({
			kind: Schema.string().required(),
			decision: Schema.string().default("allow"),
			operation: Schema.string(),
		}),
	)
		.default([])
		.volatile(),
	// The recovery-table overrides: per-obligation failure behavior. The
	// default table is fail-open for contributes / policy / preconditions
	// and fail-closed for scope (Function/Recovery).
	recovery: Schema.array(
		Schema.object({
			obligation: Schema.string().required(),
			behavior: Schema.string().default("fail-open"),
		}),
	)
		.default([])
		.volatile(),
	// The loop bound (recursion prevention): an operation identifier gated
	// more than loopBound times in one session is dropped.
	loopBound: Schema.number().default(4).volatile(),
	// The decision ring bound: the last maxDecisions decisions survive.
	maxDecisions: Schema.number().default(500).volatile(),
});
