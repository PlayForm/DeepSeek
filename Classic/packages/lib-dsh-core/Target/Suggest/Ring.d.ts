/**
 * @module Ring
 *
 * The suggester ring: the per-agent cooldown and dedupe machine the suggester
 * hooks share.
 *
 * @remarks
 *
 * The ring is the per-agent state machine behind the suggester family: a WeakMap
 * keyed on the Agent object (one shared default key when a call carries no agent)
 * holding which families are cooling, which dedupe keys were already noted this
 * turn, how many notes and calls the agent has, and the open note the
 * follow-through watches.
 *
 * The window is the caller's per call, and it is counted in judged calls, never
 * in time: no timers, no clock, deterministic. Every judged call ages the
 * cooling families by one (`Tick`) and an emitted note opens a window (`Open`);
 * every judged call either FOLLOWS it - the call path names one of the
 * companions the note named, through the caller's own predicate - or AGES it by
 * one call, and a window that reaches its limit untouched closes as a soft
 * REJECT (`Age`). The per-turn reset (`Reset`) forgets an open note without a
 * verdict, so a reset never invents an outcome.
 *
 * The state and the companion predicate are the caller's: the factory takes the
 * state's own `Fresh` factory and the `Match` predicate (does this judged path
 * name that companion?), typed through the caller's state, and returns the eight
 * methods (`State`, `Touch`, `Tick`, `Mark`, `Open`, `Follow`, `Age`, `Reset`).
 * The caller's vocabulary - the family ids, the dedupe keys, the pending shape -
 * stays in the package.
 *
 * Pure: no I/O, no clock, no timers.
 */
export default _default;
/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the factory's default key, so calls are still
 * tracked and noted.
 */
declare function _default<S extends {
    /**
     * The paths touched since the last user message.
     */
    touched: Set<string>;
    /**
     * The family ids that emitted within the cooldown window (id -> age in
     * judged calls).
     */
    cooled: Map<string, number>;
    /**
     * The dedupe keys already noted this turn.
     */
    cooledNoted: Set<string>;
    /**
     * Notes emitted this turn.
     */
    notes: number;
    /**
     * Judged calls since the last user message (the turn counter).
     */
    calls: number;
    /**
     * The open note the follow-through watches, in the caller's own shape.
     */
    pending?: unknown;
}>(
/**
 * The caller's fresh-state factory.
 */
Fresh: () => S, 
/**
 * The caller's companion predicate: does the judged path name the companion?
 */
Match: (Path: string, Companion: string) => boolean): {
    /**
     * Get (or create) the state for an agent key.
     */
    State: (Key: unknown) => S;
    /**
     * Record one judged (edited) path.
     */
    Touch: (State: S, Path: string) => void;
    /**
     * Age the cooldown counters by one judged call, dropping expired entries.
     */
    Tick: (State: S, Window: number) => void;
    /**
     * Mark an emit: the family cools, the dedupe key is kept, the counter moves.
     */
    Mark: (State: S, Family: string, Key: string) => void;
    /**
     * Open the follow-through window for the note just emitted.
     */
    Open: (State: S, Family: string, Companions: string[]) => void;
    /**
     * The follow signal: the call names a companion of the open note.
     */
    Follow: (State: S, Path: string) => {
        family: string;
        companions: string[];
        companion: string;
    } | undefined;
    /**
     * Age the open note by one judged call; the closed note is returned.
     */
    Age: (State: S, Window: number) => {
        family: string;
        companions: string[];
    } | undefined;
    /**
     * The per-turn reset: touched paths, cooldowns, dedupe, counters, the open note.
     */
    Reset: (State: S) => void;
};
