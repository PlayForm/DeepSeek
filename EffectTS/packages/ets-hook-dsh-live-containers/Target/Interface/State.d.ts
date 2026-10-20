import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type { BoardState, CheckSetSpec, CompletionSlot, DetachRecord, MonitorEntry, MonitorJobRecord, MonitorRecord, SuggesterState, Suggestion, TagRecord, WatchlistEntry } from "./Events.js";
import type { AgentState, BlockSpec } from "./Execution.js";
export default interface State extends Shared {
    /** Master switch (config `enabled`, volatile) - false = full passthrough. */
    On: boolean;
    /** The appended section's name (config `sectionName`, volatile). */
    SectionName: string;
    /** The refresh policy (config `refresh`, volatile). */
    Refresh: "request" | "ttl";
    /** Assemblies between section rebuilds under refresh "ttl" (config `ttlCalls`, volatile). */
    TtlCalls: number;
    /** The frame dashes (config `separator`, volatile). */
    Separator: string;
    /** The section budget in bytes (config `sectionBudgetBytes`, volatile). */
    Budget: number;
    /** The block table (config `blocks`, volatile). */
    Blocks: BlockSpec[];
    /** The injected factory service itself (the ledger) - set once in Apply. */
    Factory: Factory;
    /** The per-scope states (WeakMap keyed on the scope/agent object). */
    Agents: WeakMap<object, AgentState>;
    /** Every live agent state (so tools/change can invalidate all caches). */
    Registry: Set<AgentState>;
    /** The stable scope labels (WeakMap keyed on the scope object -> scope-<n>). */
    Labels: WeakMap<object, string>;
    /** How many scope labels have been assigned (WeakMap has no size). */
    LabelCount: number;
    /** The clock seam: an optional override of the time source (the smoke's fake clock). */
    Now?: (() => number) | undefined;
    /** The detach policy knobs (config `detach`, volatile). */
    Detach: DetachConfig;
    /** The planted-block knobs (config `plant`, volatile). */
    Plant: PlantConfig;
    /** The failsafe master switch (config `failsafes`, volatile). */
    Failsafes: "off" | "on";
    /** The hang budget in ms (config `hangBudgetMs`, volatile). */
    HangBudgetMs: number;
    /** The hang action (config `hangAction`, volatile). */
    HangAction: "warn-only" | "kill";
    /** The per-turn failsafe meta-budget (config `failsafesPerTurn`, volatile). */
    FailsafesPerTurn: number;
    /** The suggester mode (config `suggester`, volatile). */
    Suggester: "off" | "section" | "plant";
    /** The suggester privacy (config `suggesterPrivacy`, volatile). */
    SuggesterPrivacy: "redact" | "verbatim";
    /** The suggester gate length in chars (config `suggestGateMinChars`, volatile). */
    SuggestGateMinChars: number;
    /** The hourly suggestion rate cap (config `maxSuggestionsPerHour`, volatile). */
    MaxSuggestionsPerHour: number;
    /** The verbatim excerpt cap in bytes (config `maxPromptBytes`, volatile). */
    MaxPromptBytes: number;
    /** The suggester timeout in ms (config `suggestTimeoutMs`, volatile). */
    SuggestTimeoutMs: number;
    /** The auto-plant flip (config `autoPlant`, volatile). */
    AutoPlant: boolean;
    /** The suggester route (config `suggesterRoute`, volatile). */
    SuggesterRoute: {
        provider: string;
        model: string;
        reasoningEffort: string;
    };
    /** The merged pending-text cap in bytes (config `completionCapBytes`, volatile). */
    CompletionCapBytes: number;
    /** The detached-job records, per agent id -> job id. */
    Detached: Map<string, Map<string, DetachRecord>>;
    /** The exec tags (WeakMap keyed on the exec object itself). */
    Tagged: WeakMap<object, TagRecord>;
    /** The pending completion batches, per agent id. */
    Pending: Map<string, CompletionSlot>;
    /** The planted boards, per agent id -> plant id. */
    Boards: Map<string, Map<string, BoardState>>;
    /** The stored suggestions, per agent id -> suggestion id. */
    Suggestions: Map<string, Map<string, Suggestion>>;
    /** The suggester bookkeeping, per agent id. */
    SuggesterTicks: Map<string, SuggesterState>;
    /** The dedup retry counters, per agent id -> normalized command. */
    DedupCounts: Map<string, Map<string, number>>;
    /** The failsafe meta-budget counters, per agent id -> { turn, used }. */
    MetaBudget: Map<string, {
        turn: number;
        used: number;
    }>;
    /** The per-agent turn counter snapshot used by the lease (assemble passes). */
    TurnCounts: Map<string, number>;
    /** The per-agent, per-command-prefix duration history (the long-running heuristic). */
    History: Map<string, Map<string, number[]>>;
    /** The in-flight inline command start stamps, per call id (the duration observer). */
    CallStarts: Map<string, number>;
    /** The hang-detector watch, per job id (bytes seen + since when). */
    HangWatch: Map<string, {
        bytes: number;
        since: number;
    }>;
    /** The clock ms of each agent's previous assemble pass (the orphan check). */
    LastTurnAt: Map<string, number>;
    /** The per-agent template variables (the live_container_set writes). */
    Variables: Map<string, Map<string, string>>;
    /** The composite scope object the wave-2 modules read and write through. */
    Wave: WaveContext | undefined;
    /** The monitor flip (config `monitors`, volatile) - the second explicit
     * flip after the plugin's own enable (the IDLE-forever posture). */
    MonitorOn: "off" | "on";
    /** The monitor knobs (config `monitor`, volatile). */
    Monitor: MonitorConfig;
    /** The watchlist (config `watchlist`, volatile). */
    Watchlist: WatchlistEntry[];
    /** The check-set catalog (config `checksets`, volatile). */
    CheckSets: Record<string, CheckSetSpec>;
    /** The per-agent monitor sets: agent id -> path key -> entry. */
    Monitors: Map<string, Map<string, MonitorEntry>>;
    /** The live monitor jobs: job id -> record (the settle fold, the board
     * skip guard and the deadline scan read it). */
    MonitorJobs: Map<string, MonitorJobRecord>;
    /** The enrolled session per agent id (the check jobs' sandbox policy
     * resolution - captured at the observed events). */
    MonitorSessions: Map<string, unknown>;
    /** The per-glob opt-outs, per agent id. */
    MonitorOptOuts: Map<string, string[]>;
    /** The slow-schedule last-run stamps: agent id -> path key -> set id -> clock ms. */
    MonitorSlowLast: Map<string, Map<string, Map<string, number>>>;
    /** The synthetic monitor call-id counter. */
    MonitorCallSeq: number;
    /** The pre-bind buffer for monitor records fired before the domain open
     * (capped 256, the factory Queue pattern; drained on the open). */
    MonitorsQueue: MonitorRecord[];
    /** The bound sink for monitor records (no-op until the domain opens). */
    MonitorsJournal: (record: MonitorRecord) => void;
    /** Whether the monitor storage domain opened. */
    MonitorsPersist: boolean;
    /** The opened monitor domain handle (the effect's disposer closes it). */
    MonitorDomain: {
        close(): Promise<void>;
    } | undefined;
    /** The last announced overflowed count (the quiet-ledger discipline). */
    MonitorOverflowLast: number;
}
/** The detach policy knobs (design section 2.3; every knob volatile). */
export interface DetachConfig {
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
/** The planted-block knobs (design section 2.4 + I5 section 8). */
export interface PlantConfig {
    stallMs: number;
    closeMs: number;
    reportRateMs: number;
    stallBudgetMs: number;
    stallAction: "warn-only" | "prune";
    orphanBudgetMs: number;
    boardsPerAgent: number;
    leaseTurns: number;
}
/** The wave-2 runtime composite the modules share (bound once in Apply). */
export interface WaveContext {
    /** The jobs registry (the producer + the kill path), when composed. */
    Jobs: import("./Events.js").JobsRegistry | undefined;
    /** The shell seam (the producer re-dispatch), when composed. */
    Shell: import("./Events.js").Shell | undefined;
    /** The trusted-env collector, when composed. */
    ShellEnv: import("./Events.js").ShellEnv | undefined;
    /** The working-directory seam, when composed. */
    WorkingDirectory: import("./Events.js").WorkingDirectory | undefined;
    /** The subagent service (the suggester), when composed. */
    Subagent: import("./Events.js").Subagent | undefined;
    /** The agents registry (owner resolution), when composed. */
    Agents: import("./Events.js").AgentsRegistry | undefined;
    /** The sandbox policy service (the standing policy the inline call would have used), when composed. */
    SandboxPolicy: {
        resolve(input: {
            session?: unknown;
        }): unknown;
    } | undefined;
}
/** The monitor knobs (design section 2; every knob volatile). */
export interface MonitorConfig {
    /** The fast-check window in ms (>= 1). */
    debounceMs: number;
    /** The band cap; overflow collapses (>= 1). */
    maxMonitors: number;
    /** The concurrent-job admission cap (>= 1). */
    maxMonitorJobs: number;
    /** The withdrawal window in ms (>= 1). */
    retireMs: number;
    /** The recovered-time-stale window in ms (>= 1). */
    staleMs: number;
    /** The slow schedule interval in ms (0 = off). */
    slowCheckIntervalMs: number;
    /** The per-band render cap in bytes (>= 256). */
    bandCapBytes: number;
    /** The check deadline in ms; MUST stay <= the inline deadline 120000
     * (the 12.2 composition contract, validated at load). */
    checkTimeoutMs: number;
    /** The SEVERE extension knob - the linkage-alert version count (0 = off;
     * accepted and inert in v1, the extension ships after v1). */
    linkageAlertVersions: number;
    /** The SEVERE extension knob - the monitor-aware dedup note window in ms
     * (0 = off; accepted and inert in v1). */
    dedupWindowMs: number;
}
