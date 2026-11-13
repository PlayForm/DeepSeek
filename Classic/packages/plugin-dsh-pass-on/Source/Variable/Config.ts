import Schema from "@deepseek-ai/schemastery";
import { Policy } from "@playform/plugin-dsh-factory";
import { DEFAULT_KINDS } from "@Variable/Kinds.js";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * Every tunable is a field; the shape this schema produces is
 * Interface/Config.ts.
 *
 * The class plugin (`export default class PassOn extends Service`) carries
 * this schema as a static `Config` (the registry applies a plugin's standard
 * schema to the config before the class is constructed). No volatile cells
 * here: the class form has no factory State to hot-refresh, so a config edit
 * reloads the plugin.
 *
 * `enabled` defaults to true once the plugin is ACTIVATED: the pass-on is
 * READ-ONLY - it never writes a file (plan section 3), so its idle risk is
 * nil; the write path lives entirely in the ingester. `log` is the durable
 * journal switch (the Config base's second cell). A disabled mount journals
 * `disabled (enabled=false)` and the service stays registered - `Prepare`
 * refuses at call time (the live disabled posture).
 */
const DefaultEnabled = true;
const DefaultLog = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-pass-on.log";
const DefaultMaxTargets = 20;
const DefaultMaxPreviewBytes = 2048;
const DefaultExpiresSeconds = 3600;

/**
 * The schema constant: built once at load, carried by the class plugin as its
 * static `Config`.
 */
export default Schema.object({
	// The MASTER SWITCH: false = the mount journals `disabled (enabled=false)`
	// and Prepare refuses at call time; the service stays registered.
	enabled: Schema.boolean().default(DefaultEnabled),
	// Ledger enabled - write the durable journal (one log per module).
	log: Schema.boolean().default(DefaultLog),
	logFile: Schema.string().default(DefaultLogFile),
	root: Schema.string().default(process.cwd()),
	maxTargets: Schema.number().default(DefaultMaxTargets),
	maxPreviewBytes: Schema.number().default(DefaultMaxPreviewBytes),
	expiresSeconds: Schema.number().default(DefaultExpiresSeconds),
	// The kind DICT is a plain (non-volatile) table: a configured dict
	// replaces the catalog wholesale.
	kinds: Schema.dict(
		Schema.object({
			// The empty literal stays inline: hoisting it widens the dict's
			// inferred type to a cosmokit Dict the declaration emit cannot
			// name, and this schema's type is what Library.ts re-exports.
			globs: Schema.array(Schema.string()).default([]),
			param: Schema.string(),
		}),
	).default(DEFAULT_KINDS),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The pass-on is READ-ONLY - it reads
	// and proposes (`read`/`suggest`, both automatic) and never writes,
	// commits or spawns; those verdicts are declared for family uniformity and
	// stay the shipped `approve`. A resolved pack's `policy` section overrides
	// the defaults per action (the wiring is the next refinement).
	policy: Policy(),
});
