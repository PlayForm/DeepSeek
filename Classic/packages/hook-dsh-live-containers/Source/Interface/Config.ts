/**
 * @module Config
 *
 * The validated plugin-config shape the loader hands to `apply`.
 *
 * @remarks
 * Cordis validates the exported Schemastery schema while the plugin loads and
 * fills every default (docs/user/develop/basic/config.md:45), so `apply`
 * receives a plain object of exactly this shape. The schema that produces it
 * lives in `Variable/Config.ts` (IMPLEMENTATION-DESIGN.md section 2.1 + 2.2).
 *
 * EVERY cell is volatile (the design's §2 discipline - the loader hands them
 * to apply as stable `{ get }` references and the factory's State builder
 * unwraps them + refreshes them in place on loader/volatile), so every knob
 * - including the whole block table - flips live without remounting. The
 * factory's shared `log` cell (added by the `Compose(false, ...)` wrapper)
 * governs the DURABLE ledger file only; the plugin's own `enabled` cell is
 * the master switch (the IDLE-forever posture: false is the shipped
 * default).
 */
import type { BlockSpecification } from "@Interface/Execution.js";

/** The detach policy knobs (design section 2.3, volatile). */
export interface DetachOptions {
	/** The detach mode ("off" | "long-running" | "all" | "selected"). */
	mode: "off" | "long-running" | "all" | "selected";
	/** Required when mode is "all" (the fail-loud confirmation). */
	allRequiresConfirm: boolean;
	/** Long-running markers the "long-running" mode matches on. */
	longRunningMarkers: string[];
	/** The history-average threshold in ms for the "long-running" mode. */
	minHistoricalMs: number;
	/** How many past durations the same-prefix history keeps. */
	historyWindow: number;
	/** Extra tools the "selected" mode may detach. */
	selectedTools: string[];
	/** Extra command regexes the "selected" mode may detach. */
	selectedPatterns: string[];
	/** The per-agent live-job cap. */
	maxLivePerAgent: number;
	/** The minimum estimated duration in ms before a detach pays off. */
	minLatencyMs: number;
	/** The detached deadline in ms (1000..600000). */
	liveTimeoutMs: number;
	/** Collapse a repeat call onto the still-live job. */
	dedup: boolean;
	/** The dedup-hit count past which the retry-loop failsafe fires. */
	retryFailsafeCount: number;
}

/** The planted-block knobs (design section 2.4 + I5 section 8, volatile). */
export interface PlantOptions {
	/** The no-report interval in ms before a member renders [stalled]. */
	stallMs: number;
	/** The board auto-close window in ms. */
	closeMs: number;
	/** The coalescing window in ms: one lease reset per report. */
	reportRateMs: number;
	/** The prune budget in ms (the stall failsafe's deadline). */
	stallBudgetMs: number;
	/** The stall action ("warn-only" | "prune"). */
	stallAction: "warn-only" | "prune";
	/** The orphan budget in ms for the parent-request gap. */
	orphanBudgetMs: number;
	/** The per-agent planted-board cap. */
	boardsPerAgent: number;
	/** The lease window in parent turns (the only window source). */
	leaseTurns: number;
}

/** The suggester route triple (design section 2.6, volatile). */
export interface SuggesterRouteOptions {
	/** The subagent provider id. */
	provider: string;
	/** The subagent model id. */
	model: string;
	/** The subagent reasoning effort. */
	reasoningEffort: string;
}

/** The monitor knobs (design section 2, volatile). */
export interface MonitorOptions {
	/** The debounce window in ms before a fast check dispatches. */
	debounceMs: number;
	/** The per-agent full-band cap (older files collapse). */
	maxMonitors: number;
	/** The global in-flight monitor-job cap. */
	maxMonitorJobs: number;
	/** The untouch interval in ms after which a band retires. */
	retireMs: number;
	/** The age in ms past which a recovered result renders STALE. */
	staleMs: number;
	/** The slow-check cadence in ms (0 disables). */
	slowCheckIntervalMs: number;
	/** The band-frame byte cap. */
	bandCapBytes: number;
	/** The check deadline in ms (1000..120000). */
	checkTimeoutMs: number;
	/** The linkage-alert version count. */
	linkageAlertVersions: number;
	/** The duplicate-alert window in ms. */
	dedupWindowMs: number;
}

/** One watchlist entry (volatile). */
export interface WatchlistOption {
	/** The glob the entry matches. */
	glob: string;
	/** The check-set ids the entry enrolls. */
	checks: string[];
}

/** One check-set spec (volatile). */
export interface CheckSetOption {
	/** The catalog glob (the spec is catalog-owned when present). */
	glob?: string;
	/** The command template; required when link is absent. */
	command?: string;
	/** The governance link ("none" | "governance"); linked sets never run. */
	link?: "none" | "governance";
	/** Whether the set auto-runs per edit (default true). */
	fast?: boolean;
	/** The slow-cadence override in ms. */
	intervalMs?: number;
	/** The check deadline override in ms. */
	timeoutMs?: number;
}

export default interface Config {
	/** Ledger enabled - write the durable log file (the shared `log` cell). */
	log: boolean;
	/** Ledger file - the plugin's own ledger, separate from the family's logs (volatile). */
	logFile: string;
	/** Master switch - every listener no-ops to a passthrough when false (volatile). */
	enabled: boolean;
	/** The appended section's name (volatile). */
	sectionName: string;
	/** "request" re-renders per assembly; "ttl" caches the body for ttlCalls assemblies (volatile). */
	refresh: "request" | "ttl";
	/** Assemblies between section rebuilds when refresh = "ttl" (volatile). */
	ttlCalls: number;
	/** The frame dashes (volatile). */
	separator: string;
	/** When the section body exceeds this many bytes, the oldest frames collapse (volatile). */
	sectionBudgetBytes: number;
	/** The block table - the ARRAY is the volatile cell, its leaves plain (volatile). */
	blocks: BlockSpecification[];
	// WAVE-2 FIELDS (the C2 extension - appended only; the phase-1 fields
	// above keep their shape and defaults).
	/** The detach policy (design section 2.3, volatile). */
	detach: DetachOptions;
	/** The planted-block knobs (design section 2.4 + I5 section 8, volatile). */
	plant: PlantOptions;
	/** The failsafe master switch (design section 2.5, volatile). */
	failsafes: "off" | "on";
	/** The hang budget in ms (volatile). */
	hangBudgetMs: number;
	/** The hang action (volatile). */
	hangAction: "warn-only" | "kill";
	/** The per-turn failsafe meta-budget (volatile). */
	failsafesPerTurn: number;
	/** The suggester mode (design section 2.6, volatile). */
	suggester: "off" | "section" | "plant";
	/** The suggester privacy (volatile). */
	suggesterPrivacy: "redact" | "verbatim";
	/** The suggester gate length in chars (volatile). */
	suggestGateMinChars: number;
	/** The hourly suggestion rate cap (volatile). */
	maxSuggestionsPerHour: number;
	/** The verbatim excerpt cap in bytes (volatile). */
	maxPromptBytes: number;
	/** The suggester timeout in ms (volatile). */
	suggestTimeoutMs: number;
	/** The auto-plant flip (volatile). */
	autoPlant: boolean;
	/** The suggester route triple (volatile). */
	suggesterRoute: SuggesterRouteOptions;
	/** The merged pending-text cap in bytes (the I4 R4 config field, volatile). */
	completionCapBytes: number;
	// WAVE-3 FIELDS (the C3 extension - appended only; the phase-1 and
	// wave-2 fields above keep their shape and defaults).
	/** The monitor flip - the second explicit flip after the plugin's own
	 * enable; "off" even when the plugin is enabled (volatile). */
	monitors: "off" | "on";
	/** The watchlist - the automatic enrollment is watchlist-gated; default
	 * empty (enroll-on-write only, no scan, no watch-all). The ARRAY is the
	 * volatile cell, its leaves plain (volatile). */
	watchlist: WatchlistOption[];
	/** The check-set catalog - dict name -> spec, default DefaultCheckSets.
	 * The DICT is the volatile cell, its leaves plain (volatile). */
	checksets: Record<string, CheckSetOption>;
	/** The monitor knobs (volatile). */
	monitor: MonitorOptions;
}
