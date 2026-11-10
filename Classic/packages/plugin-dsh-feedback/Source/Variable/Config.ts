import Schema from "@deepseek-ai/schemastery";
import { Policy } from "@playform/plugin-dsh-factory";

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
 * The class plugin (`export default class Feedback extends Service`) carries
 * this schema as a static `Config` (the registry applies a plugin's standard
 * schema to the config before the class is constructed - registry.d.ts
 * Plugin.Base). Volatile cells here are the two universal ones (`enabled`,
 * `logFile`): the class form has no factory State to hot-refresh, so a config
 * edit reloads the plugin (the PO C decision is recorded in SCHEME.md).
 *
 * `enabled` defaults to true once the plugin is ACTIVATED: the feedback member
 * is a passive collector - it writes only its own ledger and never touches the
 * waterfall - so its idle risk is the ledger size, capped by maxSessions. The
 * bundle patch still ships `enabled: true` explicit so the activation is
 * visible in the patch.
 */
const DefaultEnabled = true;
const DefaultLogFile = "~/.dsh/playform/plugin-dsh-feedback.log";
const DefaultMaxBlockBytes = 4096;
const DefaultMaxChain = 8;
const DefaultMaxSessions = 128;
const DefaultSummaryTerms = 10;
const DefaultMaxOutcomes = 16;

export default Schema.object({
	// The class form has no factory State to hot-refresh, so these stay plain
	// values: a volatile cell would reach the service as a `{ get() }` object
	// and `Config.enabled` would read as truthy forever.
	enabled: Schema.boolean().default(DefaultEnabled),
	logFile: Schema.string().default(DefaultLogFile),
	maxBlockBytes: Schema.number().default(DefaultMaxBlockBytes),
	maxChain: Schema.number().default(DefaultMaxChain),
	maxSessions: Schema.number().default(DefaultMaxSessions),
	summaryTerms: Schema.number().default(DefaultSummaryTerms),
	// The per-session batch-outcome ring bound: the orchestration layer's
	// apply outcomes (applied / rejected / denied / expired) are appended to
	// the session's summary and bounded here.
	maxOutcomes: Schema.number().default(DefaultMaxOutcomes),
	// THE POLICY BLOCK (D6): the per-action allowlist, the shared factory
	// block composed into this schema. The feedback member is a PASSIVE
	// collector: it records outcomes and suggests summaries (`record` and
	// `suggest`, both automatic) and never writes, commits or spawns - the
	// write/commit/spawn verdicts are declared for family uniformity and stay
	// the shipped `approve`. A resolved pack's `policy` section overrides the
	// defaults per action (the wiring is the next refinement).
	policy: Policy(),
});
