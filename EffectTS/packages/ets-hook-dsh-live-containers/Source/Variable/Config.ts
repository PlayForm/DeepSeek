// Config - the plugin's Schemastery Config schema (a Variable: one constant
// built once at load). Cordis validates the exported schema while the plugin
// loads and fills every default, so invalid configuration fails LOUD at load
// instead of silently falling back per-field, and `apply` receives a
// validated plain config object. The shape this schema produces is
// Interface/Config.ts; this is IMPLEMENTATION-DESIGN.md section 2.1 + 2.2,
// with the 14-entry catalog supplied from the sibling Variable/DefaultBlocks.
//
// COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
// MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
// uses `shared: false` - the MINIMAL shared block, ONLY the two universal
// volatile cells (`log`, `logFile`). The plugin hooks the tool waterfalls and
// the assemble waterfall, not fs/observed, so the schema never advertises
// updateCooldownMs/mutationTools/policyFile/exclude - machinery the module
// has none of. The plugin's own `logFile` default (its SEPARATE ledger, one
// log per module) is supplied through its own fields, which override the
// minimal block's.
//
// VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
// commit WITHOUT remounting the plugin via the loader's loader/volatile-update
// event; the factory's State builder refreshes the mapped State fields IN
// PLACE, so a flip (enabled, refresh, ttlCalls, separator, budget, the block
// table, ...) takes effect on the next assembly. The block TABLE (an array)
// carries the volatile marker and its leaves stay PLAIN - schemastery rejects
// volatile leaves under an enclosing volatile field (the tool-coach's
// patternTable precedent); one table edit commits one update whose whole
// array the State's refresh listener re-reads. A kind change lands on the
// next assembly, which is safe: the render engine dispatches per block id
// and keeps NO per-kind structural state (design section 2.2).
//
// `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
// disabled, never appears in the profile's bundles, and enables only by an
// explicit ACTIVATE.
//
// This is one of the modules in the tree with a runtime import of
// @deepseek-ai/schemastery (the schema must be a real schemastery instance -
// the loader consumes it through the Standard Schema `~standard` interface).
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/ets-plugin-dsh-factory";
import { DEFAULT_BLOCKS } from "@Variable/DefaultBlocks.js";
import { DEFAULT_CHECK_SETS } from "@Variable/DefaultCheckSets.js";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/playform/hook-dsh-live-containers.log").volatile(),
	enabled: Schema.boolean().default(false).volatile(),
	sectionName: Schema.string().default("live-containers").volatile(),
	refresh: Schema.union(["request", "ttl"]).default("request").volatile(),
	// Assemblies between section rebuilds when refresh = "ttl" (the
	// tool-coach's sectionTtl pattern). The design's 8 (not the research
	// draft's 1): the TTL exists for KV-cache friendliness, and 8 is the
	// design's recommended cadence for always-differing blocks.
	ttlCalls: Schema.number().default(8).volatile(),
	// The frame dashes; the fixed frame becomes `--- LIVE CONTAINER <id> ...`
	// with the default.
	separator: Schema.string().default("---").volatile(),
	// When the rendered body exceeds this, the OLDEST frames collapse to
	// one-line summaries (the failsafe 8 path; ledger
	// `failsafe section-collapse <n>` - never silently dropped).
	sectionBudgetBytes: Schema.number().default(4096).volatile(),
	// The block table. The ARRAY is the volatile cell; its leaves stay plain.
	blocks: Schema.array(
		Schema.object({
			id: Schema.string().required(),
			kind: Schema.string().required(),
			template: Schema.string().required(),
			enabled: Schema.boolean().default(true),
			vars: Schema.dict(Schema.string()),
			trigger: Schema.union(["request", "event", "ttl", "manual"]).default("request"),
			ttlCalls: Schema.number().default(8),
			scope: Schema.union([
				"always",
				"when-agents-active",
				"when-tasks-live",
				"never",
			]).default("always"),
		}),
	)
		.default(DEFAULT_BLOCKS)
		.volatile(),
	// The detach policy (design section 2.3, every leaf volatile through the
	// enclosing object cell). `mode "all"` FAILS LOUD at load unless
	// allRequiresConfirm is true (the DANGEROUS flag, 01 section 5).
	detach: Schema.object({
		mode: Schema.union(["off", "long-running", "all", "selected"]).default("off"),
		allRequiresConfirm: Schema.boolean().default(false),
		longRunningMarkers: Schema.array(Schema.string()).default([
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
		]),
		minHistoricalMs: Schema.number().default(20000),
		historyWindow: Schema.number().default(5),
		selectedTools: Schema.array(Schema.string()).default([]),
		selectedPatterns: Schema.array(Schema.string()).default([]),
		maxLivePerAgent: Schema.number().default(5),
		minLatencyMs: Schema.number().default(2000),
		// liveTimeoutMs <= the inline deadline for the tool family is a
		// composition contract (the I1 sandbox rule; the bash executor's inline
		// default is timeoutMs 120000) - the SCHEME documents it; the schema
		// validates the 1000..600000 range.
		liveTimeoutMs: Schema.number().default(120000),
		dedup: Schema.boolean().default(true),
		retryFailsafeCount: Schema.number().default(3),
	}).volatile(),
	// The planted-block knobs (design section 2.4 + I5 section 8).
	plant: Schema.object({
		stallMs: Schema.number().default(45000),
		closeMs: Schema.number().default(300000),
		reportRateMs: Schema.number().default(2000),
		stallBudgetMs: Schema.number().default(180000),
		stallAction: Schema.union(["warn-only", "prune"]).default("warn-only"),
		orphanBudgetMs: Schema.number().default(600000),
		boardsPerAgent: Schema.number().default(4),
		// The I5 lease window (parent turns per member).
		leaseTurns: Schema.number().default(3),
	}).volatile(),
	// The failsafe master switch (design section 2.5): on = only templates
	// render; failsafes are a second explicit flip.
	failsafes: Schema.union(["off", "on"]).default("off").volatile(),
	hangBudgetMs: Schema.number().default(120000).volatile(),
	hangAction: Schema.union(["warn-only", "kill"]).default("warn-only").volatile(),
	failsafesPerTurn: Schema.number().default(5).volatile(),
	// The suggester (design section 2.6 + I6 section 8). "section" = the plain
	// LIVE SUGGESTION note; "plant" = the configured-block flow.
	suggester: Schema.union(["off", "section", "plant"]).default("off").volatile(),
	// The privacy gate: "redact" sends the first 200 chars of the request plus
	// its length; "verbatim" forwards the whole excerpt (<= maxPromptBytes) to
	// the configured route - the config flag IS the consent surface (the
	// SCHEME carries the disclosure paragraph).
	suggesterPrivacy: Schema.union(["redact", "verbatim"]).default("redact").volatile(),
	suggestGateMinChars: Schema.number().default(40).volatile(),
	maxSuggestionsPerHour: Schema.number().default(6).volatile(),
	maxPromptBytes: Schema.number().default(4000).volatile(),
	suggestTimeoutMs: Schema.number().default(8000).volatile(),
	autoPlant: Schema.boolean().default(false).volatile(),
	suggesterRoute: Schema.object({
		provider: Schema.string().default("cloudflare-workers-ai"),
		model: Schema.string().default("@cf/zai-org/glm-5.3-flash"),
		reasoningEffort: Schema.string().default("low"),
	})
		.default({
			provider: "cloudflare-workers-ai",
			model: "@cf/zai-org/glm-5.3-flash",
			reasoningEffort: "low",
		})
		.volatile(),
	// The merged pending-text cap in bytes (the I4 1.3 4 KiB cap; R4: raising
	// it is a config field, not a grammar change).
	completionCapBytes: Schema.number().default(4096).volatile(),
	// WAVE-3 CELLS (the C3 extension - appended only; the phase-1 and wave-2
	// cells above are untouched). Every knob is a volatile cell; the
	// watchlist ARRAY and the checksets DICT are the volatile cells with
	// plain leaves (the schemastery rule - the blocks table precedent).
	// `monitors` is the SECOND explicit flip after the plugin's own `enable`
	// (the IDLE-forever posture: "off" even when the plugin is enabled).
	monitors: Schema.union(["off", "on"]).default("off").volatile(),
	// The watchlist: the automatic enrollment is watchlist-gated. Default
	// EMPTY - enroll-on-write only, no scan, no watch-all (privacy and cost
	// contained; the R3 point 5 rule).
	watchlist: Schema.array(
		Schema.object({
			glob: Schema.string().required(),
			checks: Schema.array(Schema.string()).default([]),
		}),
	)
		.default([])
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
			fast: Schema.boolean().default(true),
			intervalMs: Schema.number().default(0),
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
		debounceMs: Schema.number().default(1500),
		maxMonitors: Schema.number().default(8),
		maxMonitorJobs: Schema.number().default(3),
		retireMs: Schema.number().default(600000),
		staleMs: Schema.number().default(300000),
		slowCheckIntervalMs: Schema.number().default(0),
		bandCapBytes: Schema.number().default(2048),
		checkTimeoutMs: Schema.number().default(120000),
		linkageAlertVersions: Schema.number().default(3),
		dedupWindowMs: Schema.number().default(30000),
	}).volatile(),
});
