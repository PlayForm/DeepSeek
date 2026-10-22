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
}
/** Create a fresh per-agent state. */
export declare const Fresh: () => RingState;
export default _default;
/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the module's default key, so doc calls are
 * still tracked and noted.
 */
declare function _default(): {
    /** Get (or create) the state for an agent key. */
    State: (Key: unknown) => RingState;
    /** Record one judged (named) doc path. */
    Touch: (State: RingState, Path: string) => void;
    /** Age the cooldown counters by one judged call, dropping expired entries. */
    Tick: (State: RingState, Window: number) => void;
    /** Mark an emit: the family cools, the dedupe key is kept, the counter moves. */
    Mark: (State: RingState, Family: string, Key: string) => void;
    /** The per-turn reset: touched paths, cooldowns, dedupe, counters. */
    Reset: (State: RingState) => void;
};
