/**
 * @module Ring
 *
 * Holds the per-agent suggester state in a WeakMap keyed on the Agent object.
 *
 * @remarks
 *
 * The per-agent state (the tool-coach precedent): a WeakMap keyed on the Agent object
 * holding the doc paths touched since the last user message, the cooldown counters, the
 * dedupe set, the per-turn note count, and the OPEN NOTE the follow-through watches
 * (completion spec 03-SUGGESTERS section 2: "watch the next judged calls within a
 * window").
 *
 * THE OPEN NOTE (the outcome signal): an emitted note opens a window with the family and
 * the companion paths it named; every judged in-workspace call either FOLLOWS it (the call
 * path names a companion - an ACCEPT) or AGES it by one call. The window is counted in
 * calls, never in time: no timers, no clock, deterministic. A window that reaches the
 * config's `learnWindow` untouched closes as a soft REJECT. The per-turn reset forgets an
 * open note without a verdict (the turn boundary is not a judged call), so a reset never
 * invents an outcome.
 *
 * The machinery lives in the core (`SuggestRing` of `@playform/lib-dsh-core`): the eight
 * ring methods are the core's, bound to this package's own state factory and companion
 * predicate - the state (`Pending`, `RingState`, `Fresh`) and the `Match` argument order
 * (companion first) stay the package's. The default export stays the per-mount factory:
 * every `Ring()` call binds the core's methods to a fresh WeakMap, so the ring is born in
 * `apply` and dies with the mount.
 */
/**
 * One open note awaiting its follow-through verdict.
 */
export interface Pending {
    /**
     * The family that emitted.
     */
    family: string;
    /**
     * The companion paths the note named.
     */
    companions: string[];
    /**
     * Judged calls since the emit (the window's position).
     */
    since: number;
}
export interface RingState {
    /**
     * The doc paths touched since the last user message (already-touched companions are
     * dropped from later notes).
     */
    touched: Set<string>;
    /**
     * The family ids that emitted within the cooldown window (id -> age in judged calls).
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
     * The open note the follow-through watches (undefined when none).
     */
    pending?: Pending | undefined;
}
/**
 * Create a fresh per-agent state.
 */
export declare const Fresh: () => RingState;
export default _default;
/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the module's default key, so edits are still
 * tracked and noted.
 */
declare function _default(): {
    State: (Key: unknown) => RingState;
    Touch: (State: RingState, Path: string) => void;
    Tick: (State: RingState, Window: number) => void;
    Mark: (State: RingState, Family: string, Key: string) => void;
    Open: (State: RingState, Family: string, Companions: string[]) => void;
    Follow: (State: RingState, Path: string) => {
        family: string;
        companions: string[];
        companion: string;
    } | undefined;
    Age: (State: RingState, Window: number) => {
        family: string;
        companions: string[];
    } | undefined;
    Reset: (State: RingState) => void;
};
