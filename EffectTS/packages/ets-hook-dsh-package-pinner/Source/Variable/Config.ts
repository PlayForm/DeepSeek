import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";

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
 * Since the factory refactor the schema is BUILT BY THE FACTORY - now through
 * the STANDALONE named export (factory v0.1.1, P1): `Schema(shared?, module?)`
 * composes the SHARED block (log, logFile, updateCooldownMs, mutationTools,
 * policyFile, exclude - log/logFile/updateCooldownMs/mutationTools are
 * volatile cells, hot edits commit without remounting; the factory's State
 * builder unwraps them) with the pinner's own `sections` field. The pinner
 * restates its historical defaults for logFile, mutationTools and exclude (its
 * own ledger file; its exclusion fence); log and policyFile match the factory
 * defaults. `updateCooldownMs` (default 3000) comes with the shared block -
 * the pinner never reads it (no update stage).
 *
 * VOLATILE CELLS: `enabled`, `log`, `logFile`, `updateCooldownMs` and
 * `mutationTools` are `.volatile()` - hot edits commit WITHOUT remounting the
 * plugin (the factory's State builder unwraps the cells). `enabled` is the
 * pinner's MASTER SWITCH (distinct from the shared `log` cell, which governs
 * only the durable ledger file).
 *
 * The schema must exist as a MODULE-LEVEL export (the loader reads Config
 * before any apply runs), while the factory is a SERVICE - the named export is
 * the module-load use (the pre-v0.1.1 workaround - instantiating the service
 * on a stub context, exactly like the factory's own smoke - is gone; the
 * schema factory is a pure delegate with no Context use). The REAL service
 * instance (`ctx.pluginFactory`, from inject) is what every runtime call goes
 * through.
 */
export default Compose(
	{
		// Ledger file (SEPARATE from the governor's — the pinner is its own plugin).
		logFile: "~/.dsh/playform/ets-hook-dsh-package-pinner.log",
		// Actor tool names whose fs/observed events trigger pinning.
		mutationTools: ["write", "edit", "str_replace_editor", "raw-write"],
		// Excluded path segments (anywhere mode, exclusion-first) — Variable/Default.
		exclude: Default,
	},
	{
		// THE MASTER SWITCH (volatile): false = the pinner appends
		// `disabled (enabled=false)` to the ledger instead of the activation
		// proof while every surface stays registered (the LIVE disabled
		// posture) - distinct from the shared `log` cell, which governs only
		// the durable ledger file.
		enabled: Schema.boolean().default(true).volatile(),
		// Dependency sections the pinner may rewrite — Variable/Section.
		sections: Schema.array(Schema.string()).default(Section),
	},
);
