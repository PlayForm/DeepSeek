export declare const KINDS: readonly ["time", "counter", "manifest", "gauge", "note", "template", "todo-list", "agent-progress-board", "task-failsafe-guard", "command-runner", "countdown-expiry", "session-stats", "diff-summary", "constraint-reminder", "scoreboard", "live-manifest", "memory-block", "validator", "environment-drift", "delegation-inbox"];
/** The block kinds accepted in config (see KINDS above). */
export type BlockKind = (typeof KINDS)[number];
/** The kinds the phase-1 render engine renders (everything else skips). */
export declare const RENDERED_KINDS: readonly ["time", "counter", "manifest", "gauge", "note", "template"];
/** When a block recomputes (config `trigger`). */
export type BlockTrigger = "request" | "event" | "ttl" | "manual";
/** When a block participates at all (config `scope`). */
export type BlockScope = "always" | "when-agents-active" | "when-tasks-live" | "never";
/** One block spec (config `blocks` entries). */
export interface BlockSpec {
    /** Stable label; the block's key (unique across the table - fail-loud). */
    id: string;
    /** The block kind (see KINDS). */
    kind: BlockKind;
    /** The rendered body; {{token}} variables resolved per request. */
    template: string;
    /** Per-block flip (default true). */
    enabled: boolean;
    /** Per-block token values (user variables, plain strings). */
    vars: Record<string, string>;
    /** When the block recomputes (default "request"). */
    trigger: BlockTrigger;
    /** Assemblies between recomputes when trigger = "ttl" (default 8). */
    ttlCalls: number;
    /** When the block participates (default "always"). */
    scope: BlockScope;
}
/** The substitution variables one render pass can resolve. */
export type Variables = Record<string, string>;
/**
 * The per-scope counter state (a WeakMap keyed on the scope/agent object,
 * the tool-coach precedent; a dispatch without a scope key shares the
 * module's default key). All counters are what the plugin itself observes -
 * exact token counts are NOT available to plugins (research residual 3).
 */
export interface AgentState {
    /** User messages observed at agent/pre-step (the {{messageCount}} source). */
    messages: number;
    /** User-message turns observed (the {{turnCount}} source). */
    turns: number;
    /** Per-turn tool attempts by tool name (reset on a user message). */
    attempts: Record<string, number>;
    /** The last tools/post-execute observation, in clock ms ({{sinceLastTool}}). */
    lastToolAt: number | undefined;
    /** Assemblies observed for this scope (the TTL clock). */
    calls: number;
    /** The per-block render cache: block id -> text + the assembly at build. */
    blocks: Map<string, {
        built: number;
        text: string;
        dirty: boolean;
    }>;
    /** The last skip reason per block id (a reason change logs once). */
    skips: Map<string, string>;
    /** The whole-section cache (refresh "ttl"): text + the assembly at build. */
    sectionCache?: {
        built: number;
        text: string;
    } | undefined;
}
/** One rendered frame before the budget pass. */
export interface Frame {
    /** The block id. */
    id: string;
    /** The rendered frame text (already inside the LIVE CONTAINER markers). */
    text: string;
    /** The rendered body length in bytes (the ledger's (<len> bytes) value). */
    length: number;
}
