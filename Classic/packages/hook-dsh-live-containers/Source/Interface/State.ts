// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the live-containers' own fields.
//
// The shared half comes from the factory's NAMED type export (`State`). The
// shared machinery that stays inert here: Tool/Policy/PolicyName/List (no
// fs/observed machinery - live-containers is a NON-MANIFEST module), Stash/
// Inflight/Subprocess/Seams/Queue/Journal (no governance traffic; the only
// journal-domain line is the activation record, best-effort). The shared
// `Enabled` field stays bound to the config's `log` cell (the DURABLE ledger
// toggle); the plugin's MASTER SWITCH is the `On` field below (config
// `enabled`).
//
// Every config-derived field below is refreshed IN PLACE by the factory's
// P10 loader/volatile-update listener (every cell in the schema is volatile),
// so a flip takes effect on the next assembly without a remount.
//
// `Now` is the CLOCK SEAM (the smoke's fake-clock requirement,
// IMPLEMENTATION-DESIGN.md section 7.1): when set, every time read in
// Counters/Render goes through it; production leaves it undefined and
// Clock.ts falls back to Date.now(). The smoke sets it through the
// `ctx.__hookDshLiveContainersState` probe attachment - never a return value
// from `apply` (the loader treats apply returns specially, a live-verified
// lesson recorded in the plugin-development skill).
import type {
	BoardState,
	CheckSetSpecification,
	CompletionSlot,
	DetachRecord,
	MonitorEntry,
	MonitorJobRecord,
	MonitorRecord,
	SuggesterState,
	Suggestion,
	TagRecord,
	WatchlistEntry,
} from "@Interface/Events.js";
import type { AgentState, BlockSpecification } from "@Interface/Execution.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";

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
	Blocks: BlockSpecification[];
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
	// ------------------------------------------------------------------
	// WAVE-2 STATE (the C2 extension - new fields only; every phase-1 field
	// above keeps its shape and semantics). Per-agent records are keyed on the
	// AGENT'S SESSION ID (the string the jobs registry uses as the owner id),
	// not on an opaque scope object: the tools waterfalls and the jobs events
	// all expose the agent id, and the assemble context carries the agent
	// itself (assembleContextFor sets scope = agent).
	// ------------------------------------------------------------------
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
	MaximumSuggestionsPerHour: number;
	/** The verbatim excerpt cap in bytes (config `maxPromptBytes`, volatile). */
	MaximumPromptBytes: number;
	/** The suggester timeout in ms (config `suggestTimeoutMs`, volatile). */
	SuggestTimeoutMs: number;
	/** The auto-plant flip (config `autoPlant`, volatile). */
	AutoPlant: boolean;
	/** The suggester route (config `suggesterRoute`, volatile). */
	SuggesterRoute: { provider: string; model: string; reasoningEffort: string };
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
	MetadataBudget: Map<string, { turn: number; used: number }>;
	/** The per-agent turn counter snapshot used by the lease (assemble passes). */
	TurnCounts: Map<string, number>;
	/** The per-agent, per-command-prefix duration history (the long-running heuristic). */
	History: Map<string, Map<string, number[]>>;
	/** The in-flight inline command start stamps, per call id (the duration observer). */
	CallStarts: Map<string, number>;
	/** The hang-detector watch, per job id (bytes seen + since when). */
	HangWatch: Map<string, { bytes: number; since: number }>;
	/** The clock ms of each agent's previous assemble pass (the orphan check). */
	LastTurnAt: Map<string, number>;
	/** The per-agent template variables (the live_container_set writes). */
	Variables: Map<string, Map<string, string>>;
	/** The composite scope object the wave-2 modules read and write through. */
	Wave: WaveContext | undefined;
	// ------------------------------------------------------------------
	// WAVE-3 STATE (the C3 extension - new fields only; every phase-1 and
	// wave-2 field above keeps its shape and semantics). The per-agent
	// monitor state is keyed on the AGENT'S SESSION ID, like the wave-2
	// records: the fs/observed events carry the writing agent, the assemble
	// context carries the reading agent, and the tools carry both.
	// ------------------------------------------------------------------
	/** The monitor flip (config `monitors`, volatile) - the second explicit
	 * flip after the plugin's own enable (the IDLE-forever posture). */
	MonitorOn: "off" | "on";
	/** The monitor knobs (config `monitor`, volatile). */
	Monitor: MonitorConfig;
	/** The watchlist (config `watchlist`, volatile). */
	Watchlist: WatchlistEntry[];
	/** The check-set catalog (config `checksets`, volatile). */
	CheckSets: Record<string, CheckSetSpecification>;
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
	MonitorDomain: { close(): Promise<void> } | undefined;
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
	Jobs: import("@Interface/Events.js").JobsRegistry | undefined;
	/** The shell seam (the producer re-dispatch), when composed. */
	Shell: import("@Interface/Events.js").Shell | undefined;
	/** The trusted-env collector, when composed. */
	ShellEnv: import("@Interface/Events.js").ShellEnv | undefined;
	/** The working-directory seam, when composed. */
	WorkingDirectory: import("@Interface/Events.js").WorkingDirectory | undefined;
	/** The subagent service (the suggester), when composed. */
	Subagent: import("@Interface/Events.js").Subagent | undefined;
	/** The agents registry (owner resolution), when composed. */
	Agents: import("@Interface/Events.js").AgentsRegistry | undefined;
	/** The sandbox policy service (the standing policy the inline call would have used), when composed. */
	SandboxPolicy: { resolve(input: { session?: unknown }): unknown } | undefined;
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
