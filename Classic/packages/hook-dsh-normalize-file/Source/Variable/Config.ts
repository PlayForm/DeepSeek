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
// universal volatile cells (`log`, `logFile`). The factory's full shared
// block (updateCooldownMs, mutationTools, policyFile, exclude) is fs/observed
// machinery the file-content normalizer has NONE of: it registers no event
// listener at all (the family's first listener-less flavor) and the writes it
// performs go through the factory's shared executor as an explicit actor, so
// shipping those dead fields would advertise behavior the plugin does not
// have. The normalizer's own `logFile` default (its SEPARATE ledger) is
// supplied through its own fields, which override the minimal block's.
//
// `replacement` - the dash step's ONLY knob, exactly like the dash flavor's:
// ASCII hyphen-minus by default (the transform's literal `-`). Volatile:
// hot-editable; the next tool call picks it up with no remount.
//
// P8 - VOLATILE CELLS: `log`, `logFile` and `replacement` are `.volatile()`
// - hot edits commit WITHOUT remounting the plugin; the loader hands volatile
// fields to apply as stable references (`{ get() }` cells) and the factory's
// State builder unwraps them defensively.
//
// This is one of only two modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface;
// the import resolves from the running dsh's own copy,
// docs/user/develop/basic/publish.md:103).
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import Schema from "@deepseek-ai/schemastery";

export default Compose(false, {
	// Ledger file - the file-flavor ledger, SEPARATE from the family's
	// logs (one log per module) - volatile: hot-editable without remounting
	// (overrides the minimal shared block's empty default).
	logFile: Schema.string().default("~/.dsh/hook-dsh-normalize-file.log").volatile(),
	// The dash replacement - the transform's ONLY knob. ASCII hyphen-minus by
	// default (the transform's literal `-`). Volatile: hot-editable; the
	// next tool call picks it up with no remount.
	replacement: Schema.string().default("-").volatile(),
	// Granular scope gates - ALL volatile (live toggling, no remount):
	// conversation=text/block-end, reasoning=its sub-gate, toolInput=tool-call
	// arguments arm, toolResults=tools/post-execute arm, files=the
	// normalize-file tool (the ONLY arm this tool flavor has - off means the
	// tool returns the unchanged changed:false result with no read, no write,
	// no ledger line), batch=agent/pre-step arm. The OTHER five scopes are
	// inert in this flavor but present in the schema so one patch override
	// drives the whole family. The OBJECT carries the volatile marker (its
	// leaves stay plain - schemastery rejects volatile leaves under an
	// enclosing volatile field): one leaf change commits one update whose
	// whole object the State's refresh listener re-reads.
	scopes: Schema.object({
		conversation: Schema.boolean().default(true),
		reasoning: Schema.boolean().default(true),
		toolInput: Schema.boolean().default(false),
		toolResults: Schema.boolean().default(false),
		files: Schema.boolean().default(true),
		batch: Schema.boolean().default(false),
	}).volatile(),
	// Tool-results exemption list (the name-exempt precedent of the core's
	// stream gate, made configurable): a tool result whose exec name is listed
	// passes through by identity - read/edit are byte-contracted, raw-write/
	// normalize-file own their normalization, ccr_retrieve's bytes are the
	// retrieval contract, subagent/ask_user_question carry prompt material
	// matched verbatim.
	toolResultsExempt: Schema.array(Schema.string())
		.default([
			"read",
			"edit",
			"raw-write",
			"normalize-file",
			"ccr_retrieve",
			"subagent",
			"ask_user_question",
		])
		.volatile(),
});
