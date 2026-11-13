import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

import Default from "./Default.js";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every default
 * (docs/user/develop/basic/config.md:45), so invalid configuration fails LOUD at load instead
 * of silently falling back per-field, and `apply` receives a validated plain config object.
 * Defaults mirror the previous Access/* fallbacks; the load-crash lesson of the deprecated
 * dev.1 build is covered by the runtime resolution rule - the schema import resolves from the
 * running dsh's own copy (docs/user/develop/basic/publish.md:103). The shape this schema
 * produces is Interface/Config.ts; every default below is the schema-level home of that
 * shape's field values.
 *
 * THE FAMILY FORM (the tool-coach/replay-suggester posture, factory v0.1.1 P1): the
 * STANDALONE named export in its NON-MANIFEST posture - `Compose(false, {...})` - one flat
 * object instead of the shared-block composition. `shared: false` emits only the two
 * universal volatile cells (`log`, `logFile`); this module restates them (and adds
 * `enabled`) as the THREE BASE FIELDS, then declares every existing knob after them in its
 * current order with every default value VERBATIM: the fs/observed machinery knobs the
 * shared block used to supply (`updateCooldownMs`, `mutationTools`, `policyFile` - the
 * factory's own defaults, unchanged) and the governor's own fields (`exclude` stays
 * Variable/Default's list - the governor's fence, see Function/Transform - then `strict`,
 * `maxUpdateFailures`, `updateMode`, `ncuBin`).
 *
 * P8 - VOLATILE CELLS: `enabled`, `log`, `logFile`, `updateCooldownMs` and `mutationTools`
 * are `.volatile()` - hot edits to them commit WITHOUT remounting the plugin (the fiber, and
 * with it the ledger file handle state, the in-flight map and the circuit breaker, stay
 * alive). The loader hands volatile fields to apply as stable references (`{ get }` cells,
 * not raw values) - the FACTORY'S State builder already unwraps them defensively (SCHEME.md
 * §2.10), so the State still sees the same plain config shape (the smoke's defaults hold).
 * `enabled` is the governor's MASTER SWITCH (distinct from the shared `log` cell, which
 * governs only the durable ledger file).
 *
 * This is the ONLY module in the tree with a runtime import of @deepseek-ai/schemastery (the
 * schema must be a real schemastery instance - the loader consumes it through the Standard
 * Schema `~standard` interface).
 */
const DefaultLogFile = "~/.dsh/playform/hook-dsh-package-governor.log";
const DefaultStrict = false;
const DefaultMaxUpdateFailures = 3;
const DefaultUpdateMode = "programmatic";
const DefaultNcuBin = "ncu";

export default Compose(false, {
	// THE BASE (the family's three universal fields, in order): the master switch, the
	// ledger switch and the ledger file (one global log; defaults to the active profile's
	// DSH_HOME) - volatile so a hot edit commits without remounting. `enabled` and `log`
	// carry the family defaults; `logFile` is the governor's SEPARATE ledger (the module's
	// own field overrides the minimal block's default).
	enabled: Schema.boolean().default(true).volatile(),
	log: Schema.boolean().default(true).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// Cooldown between update-stage dispatches, per directory (the factory shared block's
	// default, restated verbatim).
	updateCooldownMs: Schema.number().default(3000).volatile(),
	// Actor tool names whose fs/observed events trigger governing (the factory shared
	// block's default, restated verbatim).
	mutationTools: Schema.array(Schema.string())
		.default(["write", "edit", "str_replace_editor", "raw-write"])
		.volatile(),
	// Global update-policy.json; empty means discovery + built-in default (the factory
	// shared block's default, restated verbatim).
	policyFile: Schema.string().default(""),
	// Excluded path segments (anywhere mode, exclusion-first) - Variable/Default (the
	// governor's fence - see Function/Transform).
	exclude: Schema.array(Schema.string()).default(Default),
	// Strict chain pass: strip unknown deps in a governed workspace.
	strict: Schema.boolean().default(DefaultStrict),
	// Circuit breaker: consecutive update-stage failures per directory before pause.
	maxUpdateFailures: Schema.number().default(DefaultMaxUpdateFailures),
	// Update stage mode: "programmatic" (ncu library in-process) or "bin".
	updateMode: Schema.string().default(DefaultUpdateMode),
	// ncu binary for bin mode (binary name or absolute path - resolved via the host PATH).
	ncuBin: Schema.string().default(DefaultNcuBin),
});
