import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

import Default from "./Default.js";
import Section from "./Section.js";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default (docs/user/develop/basic/config.md:45), so invalid configuration
 * fails LOUD at load instead of silently falling back per-field, and `apply`
 * receives a validated plain config object.
 *
 * THE FAMILY FORM (the tool-coach/replay-suggester posture, factory v0.1.1
 * P1): the STANDALONE named export in its NON-MANIFEST posture -
 * `Compose(false, {...})` - one flat object instead of the shared-block
 * composition. `shared: false` emits only the two universal volatile cells
 * (`log`, `logFile`); this module restates them (and adds `enabled`) as the
 * THREE BASE FIELDS, then declares every existing knob after them in its
 * current order with every default value VERBATIM: the fs/observed machinery
 * knobs the shared block used to supply (`updateCooldownMs` - present for
 * family parity, the pinner never reads it -, `mutationTools`, `policyFile` -
 * the factory's own defaults, unchanged), the pinner's own fence (`exclude` -
 * Variable/Default) and its own field (`sections` - Variable/Section).
 *
 * The schema must exist as a MODULE-LEVEL export (the loader reads Config
 * before any apply runs), while the factory is a SERVICE - the named export is
 * the module-load use (the pre-v0.1.1 workaround - instantiating the service
 * on a stub context, exactly like the factory's own smoke - is gone; the
 * schema factory is a pure delegate with no Context use). The REAL service
 * instance (`ctx.pluginFactory`, from inject) is what every runtime call goes
 * through.
 *
 * VOLATILE CELLS: `enabled`, `log`, `logFile`, `updateCooldownMs` and
 * `mutationTools` are `.volatile()` - hot edits commit WITHOUT remounting
 * (the factory's State builder unwraps the cells). `enabled` is the pinner's
 * MASTER SWITCH (distinct from the shared `log` cell, which governs only the
 * durable ledger file).
 *
 * Runtime import of @deepseek-ai/schemastery (the schema must be a real
 * schemastery instance - the loader consumes it through the Standard Schema
 * `~standard` interface; the import resolves from the running dsh's own copy,
 * docs/user/develop/basic/publish.md:103).
 */
const DefaultLogFile = "~/.dsh/playform/hook-dsh-package-pinner.log";

export default Compose(false, {
	// THE BASE (the family's three universal fields, in order): the master
	// switch, the ledger switch and the ledger file (SEPARATE from the
	// governor's - the pinner is its own plugin) - volatile so a hot edit
	// commits without remounting. `enabled` and `log` carry the family
	// defaults; `logFile` is the pinner's own ledger (the module's own field
	// overrides the minimal block's default).
	enabled: Schema.boolean().default(true).volatile(),
	log: Schema.boolean().default(true).volatile(),
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// Cooldown between update-stage dispatches - included for family parity;
	// the pinner never reads it (no update stage). The factory shared block's
	// default, restated verbatim.
	updateCooldownMs: Schema.number().default(3000).volatile(),
	// Actor tool names whose fs/observed events trigger pinning (the factory
	// shared block's default, restated verbatim).
	mutationTools: Schema.array(Schema.string())
		.default(["write", "edit", "str_replace_editor", "raw-write"])
		.volatile(),
	// Global pin-policy.json; empty means discovery (Function/Resolve) - the
	// factory shared block's default, restated verbatim.
	policyFile: Schema.string().default(""),
	// Excluded path segments (anywhere mode, exclusion-first) -
	// Variable/Default (the pinner's fence).
	exclude: Schema.array(Schema.string()).default(Default),
	// Dependency sections the pinner may rewrite - Variable/Section.
	sections: Schema.array(Schema.string()).default(Section),
});
