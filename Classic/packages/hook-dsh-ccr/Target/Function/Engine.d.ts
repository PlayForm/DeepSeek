import type { ContentBlock } from "@deepseek-ai/dsh-llm";
export type EngineRecord = {
    /** The engine turn cursor at observation time. */
    turn: number;
    /** The tool name (the compress path re-runs the exempt/targets gates). */
    name: string;
    /** Whether the result was a failure. */
    isError: boolean;
    /** The serialized byte size of the content (the accumulator's unit). */
    size: number;
    /** The original content blocks - pass-through results only. */
    content?: ContentBlock[];
    /** The store hash - results the post-execute gate already stored. */
    hash?: string;
};
export type EngineRuntime = {
    /** The current logical turn (the last pre-step payload's `turn`, or 1). */
    Turn: number;
    /** The observation log, in arrival order (archiving removes from it). */
    Records: EngineRecord[];
};
/** The fill limit in bytes: Pct% of the nominal budget (floored). */
export declare const ThresholdBytes: (Budget: number, Pct: number) => number;
/** The MIDDLE records: past the first ProtectFirst turns, at or before
 *  CurrentTurn - ProtectLast (the protected tail window is never touched). */
export declare const Eligible: (Records: EngineRecord[], CurrentTurn: number, ProtectFirst: number, ProtectLast: number) => EngineRecord[];
/** The per-pre-step archive decision: the threshold crossed AND middle
 *  records to retire, or undefined (nothing happens - including the
 *  crossing-with-no-middles case, a deliberate no-op). */
export declare const Decide: (Records: EngineRecord[], CurrentTurn: number, Budget: number, Pct: number, ProtectFirst: number, ProtectLast: number) => {
    archive: EngineRecord[];
    bytes: number;
} | undefined;
