/** One open note awaiting its follow-through verdict. */
export interface Pending {
    /** The family that emitted. */
    family: string;
    /** The companion paths the note named. */
    companions: string[];
    /** Judged calls since the emit (the window's position). */
    since: number;
}
export interface RingState {
    /** The doc paths touched since the last user message (already-touched companions are dropped from later notes). */
    touched: Set<string>;
    /** The family ids that emitted within the cooldown window (id → age in judged calls). */
    cooled: Map<string, number>;
    /** The dedupe keys already noted this turn. */
    cooledNoted: Set<string>;
    /** Notes emitted this turn. */
    notes: number;
    /** Judged calls since the last user message (the turn counter). */
    calls: number;
    /** The open note the follow-through watches (undefined when none). */
    pending?: Pending | undefined;
}
/** Create a fresh per-agent state. */
export declare const Fresh: () => RingState;
export default _default;
/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the module's default key, so edits are still
 * tracked and noted.
 */
declare function _default(): {
    /** Get (or create) the state for an agent key. */
    State: (Key: unknown) => RingState;
    /** Record one judged (edited) path. */
    Touch: (State: RingState, Path: string) => void;
    /** Age the cooldown counters by one judged call, dropping expired entries. */
    Tick: (State: RingState, Window: number) => void;
    /** Mark an emit: the family cools, the dedupe key is kept, the counter moves. */
    Mark: (State: RingState, Family: string, Key: string) => void;
    /** Open the follow-through window for the note just emitted. */
    Open: (State: RingState, Family: string, Companions: string[]) => void;
    /** The follow signal: the call names a companion of the open note. */
    Follow: (State: RingState, Path: string) => {
        family: string;
        companions: string[];
        companion: string;
    } | undefined;
    /** Age the open note by one judged call; the closed note is returned. */
    Age: (State: RingState, Window: number) => {
        family: string;
        companions: string[];
    } | undefined;
    /** The per-turn reset: touched paths, cooldowns, dedupe, counters, the open note. */
    Reset: (State: RingState) => void;
};
