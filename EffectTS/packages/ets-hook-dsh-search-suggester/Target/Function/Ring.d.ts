import type { CallView } from "../Interface/Execution.js";
/** One ring entry: the call view plus the intent id the classifier produced. */
export interface Entry {
    /** The call view. */
    call: CallView;
    /** The intent id, or "" when the call produced no detection. */
    intent: string;
    /** Whether the call was a write/edit (it clears the loop credit). */
    edit: boolean;
}
/** The per-agent ring state. */
export interface RingState {
    /** The last calls, oldest first, capped at 8. */
    entries: Entry[];
    /** The intents that emitted within the cooldown window. */
    cooled: Map<string, number>;
    /** The dedupe keys already noted this turn. */
    cooledNoted: Set<string>;
    /** The candidate paths suggested within the cooldown window. */
    recent: Map<string, number>;
    /** Notes emitted this turn. */
    notes: number;
    /** Judged calls since the last user message (the turn counter). */
    calls: number;
    /** The current step's user text, lowercased (the R12 context input). */
    userText: string;
    /** The open note awaiting its learning verdict (plan 6.2). */
    pending?: {
        intent: string;
        since: number;
    } | undefined;
    /** The open note's emitted candidate paths (the follow signal reads exactly these, never the seeded rows). */
    emitted: string[];
    /** The sticky section's cached text and build call (the second surface). */
    sectionText?: string | undefined;
    sectionBuilt?: number | undefined;
}
/** Create a fresh per-agent state. */
export declare const Fresh: () => RingState;
export default _default;
/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the module's default key, so calls are still
 * tracked and noted.
 */
declare function _default(): {
    /** Get (or create) the state for an agent key. */
    State: (Key: unknown) => RingState;
    /** Record one judged call and its intent (or ""). */
    Push: (State: RingState, Call: CallView, Intent: string, Edit: boolean) => void;
    /** The recent intent ids, oldest first (an edit entry contributes "edit" so the loop credit dilutes). */
    Intents: (State: RingState) => string[];
    /** Age the cooldown counters by one judged call, dropping expired entries. */
    Tick: (State: RingState, Window: number) => void;
    /** Mark an emit: the intent cools, the candidates become recent, the dedupe key is kept, the counter moves, and the note opens its learning window (plan 6.2). */
    Mark: (State: RingState, Intent: string, Paths: string[], Key: string) => void;
    /** The per-turn reset (plan 4.2): ring, cooldowns, dedupe, counters, caches. */
    Reset: (State: RingState) => void;
};
