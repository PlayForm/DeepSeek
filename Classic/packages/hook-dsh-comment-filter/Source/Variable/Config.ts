// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default (docs/user/develop/basic/config.md:45), so
// invalid configuration fails LOUD at load instead of silently falling back
// per-field, and `apply` receives a validated plain config object. The shape
// this schema produces is Interface/Config.ts; every default below is the
// schema-level home of that shape's field values.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (factory v0.1.1, P1 -
// `Schema(shared?, module?)` as a MODULE-LEVEL named export): the NON-MANIFEST
// posture uses `shared: false` - the MINIMAL shared block, ONLY the two
// universal volatile cells (`log`, `logFile`). The comment filter hooks
// tools/post-execute and agent/pre-step, not fs/observed, so shipping the
// fs/observed fields (updateCooldownMs, mutationTools, policyFile, exclude)
// would advertise behavior the plugin does not have. The module's own
// `logFile` default (its SEPARATE ledger) is supplied through its own fields,
// which override the minimal block's.
//
// P8 - VOLATILE CELLS: `logFile`, `enabled`, `intent`, `intentKeywords` and
// `notice` are `.volatile()` - hot edits commit WITHOUT remounting the
// plugin; the next dispatch reads the refreshed State through the factory's
// P10 volatile-refresh listener. `enabled` is the whole filter switch, so a
// mid-session off must not drop the registrations; `intentKeywords` is the
// tuning surface of the per-task gate; `notice` is the output's only
// cosmetic knob. `targets` and `exempt` change WHICH tool names the filter
// may ever touch (the decision surface), so they are plain fields and remount
// on edit - the honest posture.
//
// THE `enabled` FLAG IS NOT THE LEDGER GATE: the factory's shared `log` cell
// lands on `State.Enabled` (the durable-ledger switch), and the module's
// `fields` map (Function/Apply) copies `enabled` onto the DISTINCT
// `State.Active` cell. Keeping them apart is deliberate: a filter switched
// off still writes its activation line and its refusals to the ledger - the
// family's "did it activate is answerable from the ledger alone" contract.
// The minimal block's `log` cell therefore keeps its full meaning here, and
// Interface/Config.ts declares it.
//
// This is the ONLY module in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface;
// the import resolves from the running dsh's own copy,
// docs/user/develop/basic/publish.md:103).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	// Ledger file - the comment-filter ledger, SEPARATE from the family's logs
	// (one log per module) - volatile: hot-editable without remounting
	// (overrides the minimal shared block's empty default).
	logFile: Schema.string().default("~/.dsh/playform/hook-dsh-comment-filter.log").volatile(),
	// The whole filter on/off - the per-call Gate's FIRST arm. It maps onto
	// `State.Active`, NOT the shared `State.Enabled` (the ledger gate - see
	// the header), so switching the filter off still records the activation
	// line. Volatile: a mid-session off takes effect on the next dispatch
	// with no remount.
	enabled: Schema.boolean().default(true).volatile(),
	// The tool names the filter may touch. `read` is HERE - the deliberate
	// opposite of the normalize flavors, which exempt it as byte-contracted;
	// `ccr_retrieve` is here because a retrieval re-enters the model exactly
	// like a read. Structural (plain): editing it remounts the plugin.
	targets: Schema.array(Schema.string()).default(["read", "ccr_retrieve"]),
	// The tool names that always pass by identity. `read` and `ccr_retrieve`
	// are ABSENT by design (that is the whole point of the flavor); the rest
	// are the family's standard byte-contracted / verbatim contracts: edit's
	// old_string must match real file bytes, raw-write/normalize-file own
	// their content decisions, subagent/ask_user_question carry prompt
	// material matched verbatim. Structural (plain).
	exempt: Schema.array(Schema.string()).default([
		"edit",
		"raw-write",
		"normalize-file",
		"subagent",
		"ask_user_question",
	]),
	// Consult the per-task intent gate stashed at agent/pre-step. Off means
	// "always strip" (the Gate's fourth arm returns true) - the blunt mode
	// for a profile that wants the bytes gone unconditionally. Volatile.
	intent: Schema.boolean().default(true).volatile(),
	// The intent keywords: a task text containing one (case-insensitive
	// substring) means the task is ABOUT comments, so the read result must
	// stay untouched - stripping the very bytes the task is asking about
	// would sabotage it. Volatile: the tuning surface of the gate.
	intentKeywords: Schema.array(Schema.string())
		.default([
			"comment",
			"comments",
			"commented",
			"commenting",
			"docstring",
			"docstrings",
			"jsdoc",
			"tsdoc",
			"license",
			"licence",
			"annotation",
			"annotations",
			"inline comment",
			"block comment",
			"comment out",
		])
		.volatile(),
	// Append the omission notice line to a stripped result: the model must be
	// able to tell that the result is complete code with comments removed,
	// not a file that never had comments. Volatile.
	notice: Schema.boolean().default(true).volatile(),
});
