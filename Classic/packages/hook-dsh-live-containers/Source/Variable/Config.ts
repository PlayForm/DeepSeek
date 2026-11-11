import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";
import { DEFAULT_BLOCKS } from "@Variable/DefaultBlocks.js";
import { DEFAULT_CHECK_SETS } from "@Variable/DefaultCheckSets.js";

/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config
 * object. The shape this schema produces is `Interface/Config.ts`; this is
 * IMPLEMENTATION-DESIGN.md section 2.1 + 2.2, with the 14-entry catalog
 * supplied from the sibling `Variable/DefaultBlocks`.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`). The plugin hooks the tool waterfalls and
 * the assemble waterfall, not fs/observed, so the schema never advertises
 * updateCooldownMs/mutationTools/policyFile/exclude - machinery the module
 * has none of. The plugin's own `logFile` default (its SEPARATE ledger, one
 * log per module) is supplied through its own fields, which override the
 * minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin via the loader's loader/volatile-update
 * event; the factory's State builder refreshes the mapped State fields IN
 * PLACE, so a flip (enabled, refresh, ttlCalls, separator, budget, the block
 * table, ...) takes effect on the next assembly. The block TABLE (an array)
 * carries the volatile marker and its leaves stay PLAIN - schemastery rejects
 * volatile leaves under an enclosing volatile field (the tool-coach's
 * patternTable precedent); one table edit commits one update whose whole
 * array the State's refresh listener re-reads. A kind change lands on the
 * next assembly, which is safe: the render engine dispatches per block id
 * and keeps NO per-kind structural state (design section 2.2).
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
 * disabled, never appears in the profile's bundles, and enables only by an
 * explicit ACTIVATE.
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 */
const DefaultLogFile = "~/.dsh/playform/hook-dsh-live-containers.log";
const DefaultEnabled = false;
const DefaultSectionName = "live-containers";
const DefaultRefresh = "request";
const DefaultTTLCalls = 8;
const DefaultSeparator = "---";
const DefaultSectionBudgetBytes = 4096;
const DefaultBlockEnabled = true;
const DefaultBlockTrigger = "request";
const DefaultBlockScope = "always";
const DefaultDetachMode = "off";
const DefaultDetachAllRequiresConfirm = false;
const DefaultDetachLongRunningMarkers = [
	"cargo build",
	"pnpm build",
	"npm install",
	"pnpm install",
	"pip install",
	"cmake",
	"make",
	"go build",
	"tsc -b",
	"next build",
];
const DefaultDetachMinHistoricalMs = 20000;
const DefaultDetachHistoryWindow = 5;
const DefaultDetachSelectedTools: string[] = [];
const DefaultDetachSelectedPatterns: string[] = [];
const DefaultDetachMaxLivePerAgent = 5;
const DefaultDetachMinLatencyMs = 2000;
const DefaultDetachLiveTimeoutMs = 120000;
const DefaultDetachDedup = true;
const DefaultDetachRetryFailsafeCount = 3;
const DefaultPlantStallMs = 45000;
const DefaultPlantCloseMs = 300000;
const DefaultPlantReportRateMs = 2000;
const DefaultPlantStallBudgetMs = 180000;
const DefaultPlantStallAction = "warn-only";
const DefaultPlantOrphanBudgetMs = 600000;
const DefaultPlantBoardsPerAgent = 4;
const DefaultPlantLeaseTurns = 3;
const DefaultFailsafes = "off";
const DefaultHangBudgetMs = 120000;
const DefaultHangAction = "warn-only";
const DefaultFailsafesPerTurn = 5;
const DefaultSuggester = "off";
const DefaultSuggesterPrivacy = "redact";
const DefaultSuggestGateMinChars = 40;
const DefaultMaxSuggestionsPerHour = 6;
const DefaultMaxPromptBytes = 4000;
const DefaultSuggestTimeoutMs = 8000;
const DefaultAutoPlant = false;
const DefaultRouteProvider = "cloudflare-workers-ai";
const DefaultRouteModel = "@cf/zai-org/glm-5.3-flash";
const DefaultRouteReasoningEffort = "low";
const DefaultSuggesterRoute = {
	provider: DefaultRouteProvider,
	model: DefaultRouteModel,
	reasoningEffort: DefaultRouteReasoningEffort,
};
const DefaultCompletionCapBytes = 4096;
const DefaultMonitors = "off";
const DefaultWatchlist: Array<{ glob: string; checks: string[] }> = [];
const DefaultWatchlistChecks: string[] = [];
const DefaultCheckFast = true;
const DefaultCheckIntervalMs = 0;
const DefaultMonitorDebounceMs = 1500;
const DefaultMonitorMaxMonitors = 8;
const DefaultMonitorMaxMonitorJobs = 3;
const DefaultMonitorRetireMs = 600000;
const DefaultMonitorStaleMs = 300000;
const DefaultMonitorSlowCheckIntervalMs = 0;
const DefaultMonitorBandCapBytes = 2048;
const DefaultMonitorCheckTimeoutMs = 120000;
const DefaultMonitorLinkageAlertVersions = 3;
const DefaultMonitorDedupWindowMs = 30000;

/**
 * The plugin's Config schema: `shared: false`, every knob volatile.
 */
export default Compose(false, {
	logFile: Schema.string().default(DefaultLogFile).volatile(),
	enabled: Schema.boolean().default(DefaultEnabled).volatile(),
	sectionName: Schema.string().default(DefaultSectionName).volatile(),
	refresh: Schema.union(["request", "ttl"]).default(DefaultRefresh).volatile(),
	// Assemblies between section rebuilds when refresh = "ttl" (the
	// tool-coach's sectionTtl pattern). The design's 8 (not the research
	// draft's 1): the TTL exists for KV-cache friendliness, and 8 is the
	// design's recommended cadence for always-differing blocks.
	ttlCalls: Schema.number().default(DefaultTTLCalls).volatile(),
	// The frame dashes; the fixed frame becomes `--- LIVE CONTAINER <id> ...`
	// with the default.
	separator: Schema.string().default(DefaultSeparator).volatile(),
	// When the rendered body exceeds this, the OLDEST frames collapse to
	// one-line summaries (the failsafe 8 path; ledger
	// `failsafe section-collapse <n>` - never silently dropped).
	sectionBudgetBytes: Schema.number().default(DefaultSectionBudgetBytes).volatile(),
	// The block table. The ARRAY is the volatile cell; its leaves stay plain.
	blocks: Schema.array(
		Schema.object({
			id: Schema.string().required(),
			kind: Schema.string().required(),
			template: Schema.string().required(),
			enabled: Schema.boolean().default(DefaultBlockEnabled),
			vars: Schema.dict(Schema.string()),
			trigger: Schema.union(["request", "event", "ttl", "manual"]).default(
				DefaultBlockTrigger,
			),
			ttlCalls: Schema.number().default(DefaultTTLCalls),
			scope: Schema.union([
				"always",
				"when-agents-active",
				"when-tasks-live",
				"never",
			]).default(DefaultBlockScope),
		}),
	)
		.default(DEFAULT_BLOCKS)
		.volatile(),
	// The detach policy (design section 2.3, every leaf volatile through the
	// enclosing object cell). `mode "all"` FAILS LOUD at load unless
	// allRequiresConfirm is true (the DANGEROUS flag, 01 section 5).
	detach: Schema.object({
		mode: Schema.union(["off", "long-running", "all", "selected"]).default(DefaultDetachMode),
		allRequiresConfirm: Schema.boolean().default(DefaultDetachAllRequiresConfirm),
		longRunningMarkers: Schema.array(Schema.string()).default(DefaultDetachLongRunningMarkers),
		minHistoricalMs: Schema.number().default(DefaultDetachMinHistoricalMs),
		historyWindow: Schema.number().default(DefaultDetachHistoryWindow),
		selectedTools: Schema.array(Schema.string()).default(DefaultDetachSelectedTools),
		selectedPatterns: Schema.array(Schema.string()).default(DefaultDetachSelectedPatterns),
		maxLivePerAgent: Schema.number().default(DefaultDetachMaxLivePerAgent),
		minLatencyMs: Schema.number().default(DefaultDetachMinLatencyMs),
		// liveTimeoutMs <= the inline deadline for the tool family is a
		// composition contract (the I1 sandbox rule; the bash executor's inline
		// default is timeoutMs 120000) - the SCHEME documents it; the schema
		// validates the 1000..600000 range.
		liveTimeoutMs: Schema.number().default(DefaultDetachLiveTimeoutMs),
		dedup: Schema.boolean().default(DefaultDetachDedup),
		retryFailsafeCount: Schema.number().default(DefaultDetachRetryFailsafeCount),
	}).volatile(),
	// The planted-block knobs (design section 2.4 + I5 section 8).
	plant: Schema.object({
		stallMs: Schema.number().default(DefaultPlantStallMs),
		closeMs: Schema.number().default(DefaultPlantCloseMs),
		reportRateMs: Schema.number().default(DefaultPlantReportRateMs),
		stallBudgetMs: Schema.number().default(DefaultPlantStallBudgetMs),
		stallAction: Schema.union(["warn-only", "prune"]).default(DefaultPlantStallAction),
		orphanBudgetMs: Schema.number().default(DefaultPlantOrphanBudgetMs),
		boardsPerAgent: Schema.number().default(DefaultPlantBoardsPerAgent),
		// The I5 lease window (parent turns per member).
		leaseTurns: Schema.number().default(DefaultPlantLeaseTurns),
	}).volatile(),
	// The failsafe master switch (design section 2.5): on = only templates
	// render; failsafes are a second explicit flip.
	failsafes: Schema.union(["off", "on"]).default(DefaultFailsafes).volatile(),
	hangBudgetMs: Schema.number().default(DefaultHangBudgetMs).volatile(),
	hangAction: Schema.union(["warn-only", "kill"]).default(DefaultHangAction).volatile(),
	failsafesPerTurn: Schema.number().default(DefaultFailsafesPerTurn).volatile(),
	// The suggester (design section 2.6 + I6 section 8). "section" = the plain
	// LIVE SUGGESTION note; "plant" = the configured-block flow.
	suggester: Schema.union(["off", "section", "plant"]).default(DefaultSuggester).volatile(),
	// The privacy gate: "redact" sends the first 200 chars of the request plus
	// its length; "verbatim" forwards the whole excerpt (<= maxPromptBytes) to
	// the configured route - the config flag IS the consent surface (the
	// SCHEME carries the disclosure paragraph).
	suggesterPrivacy: Schema.union(["redact", "verbatim"])
		.default(DefaultSuggesterPrivacy)
		.volatile(),
	suggestGateMinChars: Schema.number().default(DefaultSuggestGateMinChars).volatile(),
	maxSuggestionsPerHour: Schema.number().default(DefaultMaxSuggestionsPerHour).volatile(),
	maxPromptBytes: Schema.number().default(DefaultMaxPromptBytes).volatile(),
	suggestTimeoutMs: Schema.number().default(DefaultSuggestTimeoutMs).volatile(),
	autoPlant: Schema.boolean().default(DefaultAutoPlant).volatile(),
	suggesterRoute: Schema.object({
		provider: Schema.string().default(DefaultRouteProvider),
		model: Schema.string().default(DefaultRouteModel),
		reasoningEffort: Schema.string().default(DefaultRouteReasoningEffort),
	})
		.default(DefaultSuggesterRoute)
		.volatile(),
	// The merged pending-text cap in bytes (the I4 1.3 4 KiB cap; R4: raising
	// it is a config field, not a grammar change).
	completionCapBytes: Schema.number().default(DefaultCompletionCapBytes).volatile(),
	// WAVE-3 CELLS (the C3 extension - appended only; the phase-1 and wave-2
	// cells above are untouched). Every knob is a volatile cell; the
	// watchlist ARRAY and the checksets DICT are the volatile cells with
	// plain leaves (the schemastery rule - the blocks table precedent).
	// `monitors` is the SECOND explicit flip after the plugin's own `enable`
	// (the IDLE-forever posture: "off" even when the plugin is enabled).
	monitors: Schema.union(["off", "on"]).default(DefaultMonitors).volatile(),
	// The watchlist: the automatic enrollment is watchlist-gated. Default
	// EMPTY - enroll-on-write only, no scan, no watch-all (privacy and cost
	// contained; the R3 point 5 rule).
	watchlist: Schema.array(
		Schema.object({
			glob: Schema.string().required(),
			checks: Schema.array(Schema.string()).default(DefaultWatchlistChecks),
		}),
	)
		.default(DefaultWatchlist)
		.volatile(),
	// The check-set catalog: dict name -> spec. Default: the shipped catalog
	// (Variable/DefaultCheckSets - data, not code). The DICT is the volatile
	// cell; a configured dict replaces the catalog wholesale (the blocks
	// table precedent).
	checksets: Schema.dict(
		Schema.object({
			glob: Schema.string(),
			command: Schema.string(),
			link: Schema.union(["none", "governance"]),
			fast: Schema.boolean().default(DefaultCheckFast),
			intervalMs: Schema.number().default(DefaultCheckIntervalMs),
			timeoutMs: Schema.number(),
		}),
	)
		.default(DEFAULT_CHECK_SETS)
		.volatile(),
	// The monitor knobs (design section 2). checkTimeoutMs <= the inline
	// deadline 120000 is a composition contract (the 12.2 rule, like
	// detach.liveTimeoutMs) - validated at load, never configurable above it.
	// linkageAlertVersions / dedupWindowMs are the SEVERE extension knobs:
	// accepted, defaulted, inert in v1 (the extension ships after v1 - the
	// same posture the wave-2 catalog kinds had in phase 1).
	monitor: Schema.object({
		debounceMs: Schema.number().default(DefaultMonitorDebounceMs),
		maxMonitors: Schema.number().default(DefaultMonitorMaxMonitors),
		maxMonitorJobs: Schema.number().default(DefaultMonitorMaxMonitorJobs),
		retireMs: Schema.number().default(DefaultMonitorRetireMs),
		staleMs: Schema.number().default(DefaultMonitorStaleMs),
		slowCheckIntervalMs: Schema.number().default(DefaultMonitorSlowCheckIntervalMs),
		bandCapBytes: Schema.number().default(DefaultMonitorBandCapBytes),
		checkTimeoutMs: Schema.number().default(DefaultMonitorCheckTimeoutMs),
		linkageAlertVersions: Schema.number().default(DefaultMonitorLinkageAlertVersions),
		dedupWindowMs: Schema.number().default(DefaultMonitorDedupWindowMs),
	}).volatile(),
});
