/** The five regression classes (plan Part 2; control is never denied). */
export type CoachClass = "write" | "read" | "search" | "discovery" | "control";
/** One detected offense: the matched segment and the row that classified it. */
export interface Match {
    /** The offending command segment as written (first 200 chars). */
    command: string;
    /** The regression class. */
    class: CoachClass;
    /** The dedicated tool the note names (from the matched row). */
    tool: string;
    /** The matched pattern source (or `<catch-all>`). */
    pattern: string;
    /** Optional per-row note override (from the matched row). */
    note?: string | undefined;
}
/** One pattern-table row (config `patternTable` entries). */
export interface CoachRow {
    pattern: string;
    class: CoachClass;
    tool: string;
    note?: string;
}
/** The notes templates (config `notes`). */
export interface CoachNotes {
    first: string;
    persistent: string;
    denied: string;
    deniedTool: string;
}
/** The result of one Detect pass over a judged terminal call. */
export type Detection = {
    kind: "offense";
    match: Match;
} | {
    kind: "exempt";
    pattern: string;
} | null;
/** One fetched (or static) tool entry: first-sentence description + key param. */
export interface ToolEntry {
    description: string;
    param: string;
}
/** The tool catalog a note is composed from (plan Part 3 §3.1). */
export interface ToolCatalog {
    /** `live` = fetched from ctx.tools.schemas(); `static` = fallback table. */
    source: "live" | "static";
    /** Tool name -> entry. */
    tools: Map<string, ToolEntry>;
}
/**
 * The per-agent coaching state (a WeakMap<Agent, AgentState> keyed like the
 * repeat-tool-reminder's chains, plus a registry Set so tools/change can
 * invalidate every live state). All counters are in JUDGED calls (terminal
 * calls only); non-terminal tools are transparent.
 */
export interface AgentState {
    /** The last `window` judged calls: the offense match, or null when clean. */
    window: (Match | null)[];
    /** Judged calls since the last coaching note (tier-1 cooldown counter). */
    sinceNote: number;
    /** Total offenses since the last note (tier-2 escalation counter). */
    strikesSinceNote: number;
    /** Per-class offenses since the last note (tier-3 enforce counter). */
    classStrikes: Record<CoachClass, number>;
    /** Consecutive clean judged calls (tier-2 clean-window counter). */
    sinceClean: number;
    /** Whether the persistent tier-2 section is currently on for this agent. */
    tier2: boolean;
    /** The composed tier-2 section cache: text + the judged-call count at build. */
    sectionCache?: {
        built: number;
        text: string;
    } | undefined;
    /** Total judged calls for this agent (the tier-2 section TTL clock). */
    calls: number;
    /** Distinct exempt pattern sources already logged for this agent. */
    exemptSeen: Set<string>;
    /** The most recent offense's command segment (the tier-2 template fill). */
    lastCommand: string;
    /** The most recent offense's class. */
    lastClass: CoachClass;
}
/** The per-call decision produced by Count (plan Part 3 §3.5 step 2). */
export interface Decision {
    /** This call's offense, or null when the call was clean. */
    match: Match | null;
    /** The highest channel that fired on this call (0 = ledger only). */
    tier: 0 | 1 | 2 | 3;
    /** A tier-1 note fired on this call. */
    note: boolean;
    /** The tier-2 section turned ON on this call. */
    tier2On: boolean;
    /** The tier-2 section turned OFF on this call. */
    tier2Off: boolean;
    /** The note trigger was active but the cooldown suppressed it. */
    suppressed: boolean;
    /** Total strikes in the current window. */
    strikes: number;
    /** Judged calls since the last note. */
    sinceNote: number;
}
