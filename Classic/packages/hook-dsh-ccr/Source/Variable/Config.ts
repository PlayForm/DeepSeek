/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every
 * default (docs/user/develop/basic/config.md:45), so invalid configuration
 * fails LOUD at load instead of silently falling back per-field, and `apply`
 * receives a validated plain config object. The shape this schema produces is
 * Interface/Config.ts; every default below is the schema-level home of that
 * shape's field values (the plan's §5 schema, verbatim -
 * Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md).
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false`
 * - the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
 * `logFile`). The CCR hook hooks tools/post-execute, not fs/observed, so the
 * schema never advertises updateCooldownMs/mutationTools/policyFile/exclude -
 * machinery the module has none of. The CCR hook's own `logFile` default (its
 * SEPARATE ledger, one log per module) is supplied through its own fields,
 * which override the minimal block's.
 *
 * VOLATILE CELLS: `log`, `logFile`, `thresholdBytes`, `previewMaxChars` and
 * `multipliers` are `.volatile()` - hot edits commit WITHOUT remounting the
 * plugin, matching Aphrodite's hot-reload thresholds. `thresholdBytes` is the
 * gate's only numeric knob that needs mid-session retuning; `multipliers` is
 * its per-type extension; `previewMaxChars` shapes the model-visible line.
 * The structural knobs (targets, exempt, the store, the journal, auto-expand,
 * the context-engine phase-4 flags) change the dispatch SEMANTICS, so they
 * remount on edit (plain fields). `contextEngine` and its three knobs are
 * phase 4: the engine is implemented and OFF by default - the field set is
 * fixed so tuning it is config-only (Function/Engine, SCHEME.md §9).
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface;
 * the import resolves from the running dsh's own copy,
 * docs/user/develop/basic/publish.md:103).
 */
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

const DefaultLogFile = "~/.dsh/playform/hook-dsh-ccr.log";
const DefaultTargets = [
	"bash",
	"glob",
	"grep",
	"read",
	"web_fetch",
	"web_search",
	"list",
	"search",
];
const DefaultExempt = [
	"write",
	"edit",
	"raw-write",
	"subagent",
	"ask_user_question",
	"ccr_retrieve",
];
const DefaultThresholdBytes = 1024;
const DefaultInlineThresholdBytes = 1024;
const DefaultAutoExpand = true;
const DefaultAutoExpandLimitBytes = 102400;
const DefaultCompressFailures = false;
const DefaultMultiplierTerminal = 1;
const DefaultMultiplierError = 8;
const DefaultMultiplierGrep = 2;
const DefaultMultiplierPaths = 2;
const DefaultMultiplierFile = 1;
const DefaultMultiplierJson = 1;
const DefaultMultiplierWeb = 2;
const DefaultMultiplierFallback = 1;
const DefaultPreviewMaxChars = 240;
const DefaultTtlSeconds = 3600;
const DefaultStoreBudgetBytes = 268435456;
const DefaultJournalPath = "";
const DefaultContextEngine = false;
const DefaultContextEngineThresholdPct = 30;
const DefaultProtectFirstTurns = 2;
const DefaultProtectLastTurns = 4;

export default Compose(false, {
	// Ledger file - the CCR hook's ledger, SEPARATE from the family's logs (one
	// log per module) - volatile: hot-editable without remounting (overrides
	// the minimal shared block's empty default).
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	// The target allow-list: tools whose oversized results are compressed (the
	// terminal/search/fetch family). Structural: remounts on edit.
	targets: Schema.array(String).default(DefaultTargets),
	// The exemption list: never compressed (execution-critical mutators and
	// their own echo, the plugin's own retrieval tool, another agent's brief,
	// a user gate). Structural: remounts on edit.
	exempt: Schema.array(String).default(DefaultExempt),
	// The one byte gate for all tools (volatile: hot-editable).
	thresholdBytes: Schema.number().default(DefaultThresholdBytes).volatile(),
	// Results at or below this size are inlined in the store and previewed
	// fully (Aphrodite's inline_threshold). Structural: remounts on edit.
	inlineThresholdBytes: Schema.number().default(DefaultInlineThresholdBytes),
	// Auto-expand: store + preview, but return the FULL content while under
	// the limit - no marker reaches the model. Structural: remounts on edit.
	autoExpand: Schema.boolean().default(DefaultAutoExpand),
	// The auto-expand ceiling in bytes (Aphrodite's auto_expand_limit).
	autoExpandLimitBytes: Schema.number().default(DefaultAutoExpandLimitBytes),
	// Compress failing results too (default off - the error x8 tier is the
	// only beneficiary). Structural: remounts on edit.
	compressFailures: Schema.boolean().default(DefaultCompressFailures),
	// Per-type multipliers on the byte gate (volatile: hot-editable). Errors
	// are high-signal and compress late (x8); grep/paths/web compress early
	// (x2); the rest at parity (x1).
	multipliers: Schema.object({
		terminal: Schema.number().default(DefaultMultiplierTerminal),
		error: Schema.number().default(DefaultMultiplierError),
		grep: Schema.number().default(DefaultMultiplierGrep),
		paths: Schema.number().default(DefaultMultiplierPaths),
		file: Schema.number().default(DefaultMultiplierFile),
		json: Schema.number().default(DefaultMultiplierJson),
		web: Schema.number().default(DefaultMultiplierWeb),
		default: Schema.number().default(DefaultMultiplierFallback),
	}).volatile(),
	// Hard character cap on every preview line (volatile: hot-editable).
	previewMaxChars: Schema.number().default(DefaultPreviewMaxChars).volatile(),
	// Store TTL in seconds (Aphrodite's ccr_ttl_seconds).
	ttlSeconds: Schema.number().default(DefaultTtlSeconds),
	// The LRU budget in bytes (Aphrodite's inline store, 256 MiB).
	storeBudgetBytes: Schema.number().default(DefaultStoreBudgetBytes),
	// Optional JSONL disk journal; empty (the default) = memory-only
	// (Aphrodite's inline mode - Aphrodite's SQLite ccr.db is adapted to JSONL
	// because SQLite is a native dep the family does not carry).
	journalPath: Schema.string().default(DefaultJournalPath),
	// Phase-4 context engine (middle-turn archiving): implemented and OFF by
	// default - when on, the agent/pre-step engine listener is registered
	// (Function/Engine, SCHEME.md §9).
	contextEngine: Schema.boolean().default(DefaultContextEngine),
	// Phase-4: the context-usage percent that starts archiving (30% of the
	// nominal budget = the store's storeBudgetBytes).
	contextEngineThresholdPct: Schema.number().default(DefaultContextEngineThresholdPct),
	// Phase-4: turns protected from archiving at the head.
	protectFirstTurns: Schema.number().default(DefaultProtectFirstTurns),
	// Phase-4: turns protected from archiving at the tail.
	protectLastTurns: Schema.number().default(DefaultProtectLastTurns),
});
