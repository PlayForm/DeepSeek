import type { BlockSpec } from "./Execution.js";
/** The detach policy knobs (design section 2.3, volatile). */
export interface DetachOptions {
    mode: "off" | "long-running" | "all" | "selected";
    allRequiresConfirm: boolean;
    longRunningMarkers: string[];
    minHistoricalMs: number;
    historyWindow: number;
    selectedTools: string[];
    selectedPatterns: string[];
    maxLivePerAgent: number;
    minLatencyMs: number;
    liveTimeoutMs: number;
    dedup: boolean;
    retryFailsafeCount: number;
}
/** The planted-block knobs (design section 2.4 + I5 section 8, volatile). */
export interface PlantOptions {
    stallMs: number;
    closeMs: number;
    reportRateMs: number;
    stallBudgetMs: number;
    stallAction: "warn-only" | "prune";
    orphanBudgetMs: number;
    boardsPerAgent: number;
    leaseTurns: number;
}
/** The suggester route triple (design section 2.6, volatile). */
export interface SuggesterRouteOptions {
    provider: string;
    model: string;
    reasoningEffort: string;
}
/** The monitor knobs (design section 2, volatile). */
export interface MonitorOptions {
    debounceMs: number;
    maxMonitors: number;
    maxMonitorJobs: number;
    retireMs: number;
    staleMs: number;
    slowCheckIntervalMs: number;
    bandCapBytes: number;
    checkTimeoutMs: number;
    linkageAlertVersions: number;
    dedupWindowMs: number;
}
/** One watchlist entry (volatile). */
export interface WatchlistOption {
    glob: string;
    checks: string[];
}
/** One check-set spec (volatile). */
export interface CheckSetOption {
    glob?: string;
    command?: string;
    link?: "none" | "governance";
    fast?: boolean;
    intervalMs?: number;
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
    blocks: BlockSpec[];
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
