// Execution - the structural types of the live-containers runtime data: the
// block spec, the per-scope counter state, and the rendered parts. Pure
// data - no behavior (the family's Rust-style composition separates
// Interface from Function).
//
// The kind registry: phase 1 renders the six v1 kinds (LIVE-CONTAINERS-
// RESEARCH.md section 3: time, counter, manifest, gauge, note, template);
// the wave-2 catalog kinds (IMPLEMENTATION-DESIGN.md section 2.7, from
// Requirements/03 section 3) are ACCEPTED IN CONFIG from day one (the
// default block table ships them) and render as skipped blocks - reason
// "unknown kind" - until the wave-2 render engine lands. One registry, two
// consumers: the fail-loud config validation and the render dispatch.
export const KINDS = [
	// Phase 1 (v1) kinds.
	"time",
	"counter",
	"manifest",
	"gauge",
	"note",
	"template",
	// Wave-2 catalog kinds (accepted in config; rendered by the wave-2 engine).
	"todo-list",
	"agent-progress-board",
	"task-failsafe-guard",
	"command-runner",
	"countdown-expiry",
	"session-stats",
	"diff-summary",
	"constraint-reminder",
	"scoreboard",
	"live-manifest",
	"memory-block",
	"validator",
	"environment-drift",
	"delegation-inbox",
] as const;

/** The block kinds accepted in config (see KINDS above). */
export type BlockKind = (typeof KINDS)[number];

/** The kinds the phase-1 render engine renders (everything else skips). */
export const RENDERED_KINDS = ["time", "counter", "manifest", "gauge", "note", "template"] as const;

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
	blocks: Map<string, { built: number; text: string; dirty: boolean }>;
	/** The last skip reason per block id (a reason change logs once). */
	skips: Map<string, string>;
	/** The whole-section cache (refresh "ttl"): text + the assembly at build. */
	sectionCache?: { built: number; text: string } | undefined;
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
