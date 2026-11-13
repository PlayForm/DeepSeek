import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema for the cargo module, a Variable:
 * one constant built once at load.
 *
 * @remarks
 *
 * THE FAMILY FORM (the tool-coach/replay-suggester posture, factory v0.1.1
 * P1): the STANDALONE named export in its NON-MANIFEST posture -
 * `Compose(false, {...})` - one flat object instead of the shared-block
 * composition. `shared: false` emits only the two universal volatile cells
 * (`log`, `logFile`); this module restates them (and adds `enabled`) as the
 * THREE BASE FIELDS, then declares every existing knob after them in its
 * current order with every default value VERBATIM: the fs/observed machinery
 * knobs the shared block used to supply (`updateCooldownMs`, `mutationTools`,
 * `policyFile` - the factory's own defaults, unchanged) and the factory's
 * built-in `exclude` list (Variable/Default of the factory, identical to this
 * module's historical one), then the module's OWN fields (`strict`,
 * `maxUpdateFailures`, `cargoBin`, `keepFile`, `updateMode`).
 *
 * Defaults mirror the package.json governor except for the module-specific
 * fields: the SEPARATE ledger (hook-dsh-cargo-governor.log - never the package
 * governor's log), `cargoBin` (bare name resolved by the subprocess seam; set
 * an absolute path when the host PATH lacks cargo), and `updateMode: "cargo"`
 * - the only implemented mode (the Rust-side CLI; Rust does not co-opt into
 * the TypeScript ecosystem).
 *
 * VOLATILE CELLS: `enabled`, `log`, `logFile`, `updateCooldownMs` and
 * `mutationTools` are `.volatile()` - hot edits commit WITHOUT remounting the
 * plugin (the factory's State builder unwraps the cells). `enabled` is the
 * cargo module's MASTER SWITCH (distinct from the shared `log` cell, which
 * governs only the durable ledger file).
 *
 * CONTRACT NOTE: the loader contract requires `Config` as a static named
 * export - built at MODULE LOAD, before any service exists. The factory's
 * Schema is an instance method, so the schema is produced through the
 * STANDALONE named export (factory v0.1.1, P1 - the pre-v0.1.1 workaround,
 * invoking the class prototype with `call(null, ...)`, is gone; the schema
 * factory never reads `this`). The module's own fields are real Schemastery
 * fields built with the same @deepseek-ai/schemastery import the loader
 * consumes (the schema must be a real schemastery instance - the Standard
 * Schema `~standard` interface).
 */
const DefaultLogFile = "~/.dsh/playform/hook-dsh-cargo-governor.log";
// The factory's shared-block defaults, restated verbatim (Variable/Default of
// the factory - the built-in exclude list identical to this module's
// historical one).
const DefaultMutationTools = ["write", "edit", "str_replace_editor", "raw-write"];
const DefaultExclude = ["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"];
const DefaultStrict = false;
const DefaultMaxUpdateFailures = 3;
const DefaultCargoBin = "cargo";
const DefaultKeepFile = "";
const DefaultUpdateMode = "cargo";

export default Compose(false, {
	// THE BASE (the family's three universal fields, in order): the master
	// switch, the ledger switch and the ledger file - the CARGO MODULE's OWN
	// ledger (separate from the package governor's) - volatile so a hot edit
	// commits without remounting. `enabled` and `log` carry the family
	// defaults; `logFile` is the module's own ledger (the module's own field
	// overrides the minimal block's default).
	enabled: Schema.boolean().default(true).volatile(),
	log: Schema.boolean().default(true).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// Cooldown between update-stage dispatches, per directory (the factory
	// shared block's default, restated verbatim).
	updateCooldownMs: Schema.number().default(3000).volatile(),
	// Actor tool names whose fs/observed events trigger the module (the
	// factory shared block's default, restated verbatim).
	mutationTools: Schema.array(Schema.string()).default(DefaultMutationTools).volatile(),
	// Global policy file; empty means discovery (Function/Resolve) - the
	// factory shared block's default, restated verbatim.
	policyFile: Schema.string().default(""),
	// Excluded path segments (anywhere mode, exclusion-first) - the factory's
	// built-in list, restated verbatim.
	exclude: Schema.array(Schema.string()).default(DefaultExclude),
	// Strict chain pass: strip unknown deps (the whole `name = "..."` entry) in
	// a governed workspace - the documented Cargo-specific decision.
	strict: Schema.boolean().default(DefaultStrict),
	// Circuit breaker: consecutive update-stage failures per directory
	// before pause.
	maxUpdateFailures: Schema.number().default(DefaultMaxUpdateFailures),
	// cargo binary for the update stage (bare name resolved through the
	// subprocess seam's resolveExecutable, or an absolute path - the host
	// PATH is not the user's shell PATH).
	cargoBin: Schema.string().default(DefaultCargoBin),
	// Global pin-policy.json (the keep-list of the FULL-VERSION
	// NORMALIZATION directive: kept packages stay byte-identical); empty
	// means discovery - the file's own directory, then the directory
	// co-located with the nearest registry.json, then the built-in empty
	// default (the union of the readable sources, mirroring the pinner;
	// the sidecars and the P3 chain keys come from the factory's
	// ResolvePolicy, the global keepFile source from the transform).
	keepFile: Schema.string().default(DefaultKeepFile),
	// Update stage mode: "cargo" (the Rust-side CLI through ctx.subprocess)
	// is the only implemented mode - kept open for future modes.
	updateMode: Schema.string().default(DefaultUpdateMode),
});
