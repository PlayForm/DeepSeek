export default _default;
/**
 * @module Update
 *
 * The shared update-stage envelope of the governance family: the Dispatch/Settle pair
 * every update engine is wrapped in.
 *
 * @remarks
 *
 * The package governor (ncu) and the cargo governor (cargo upgrade) run the SAME control
 * flow - only the child execution stage and the module's own ledger strings differ - so the
 * flow lives here as a BUILDER: the module supplies its injected dependencies (the State's
 * maps and functions, the factory delegates, the job lifecycle hooks, the P5 journal event
 * names and EVERY ledger string) and receives the pair. A new governance module's update
 * stage reduces to a child runner plus strings; the flow is not forked per module.
 *
 * The flow (byte-identical across the family, verified by the smokes):
 *
 *   Dispatch - the g4 stage (U):
 *     1. the gates, all as switch (true) cases: circuit breaker -> in-flight ->
 *        cooldown; the per-dir maps (Stamp/Set/Count) stay in the module's State and
 *        guard the dispatch; each gate logs its own module-owned line and returns;
 *     2. the task-owned AbortController, registered in the module's in-flight map under
 *        the FACTORY's namespaced key (UpdateKey - distinct from the chain pass's plain
 *        key: the collision lesson, P2) and removed on settlement;
 *     3. the JOBS ENVELOPE via the module's Start hook: an UNOWNED job (`owner` key
 *        absent - open to any caller until service disposal) whose `cancel` aborts the
 *        task-owned signal and whose `done` is the never-rejecting chain Stage -> Settle
 *        -> `{ status, detail: `exit code: <code>` }`; a bug-level rejection settles
 *        through the same Settle (the breaker, the module's failure line and the P5
 *        record) and resolves `failed` with the module's rejected detail.
 *        When no job registry serves the context (or the starter rejects), the module's
 *        Start hook invokes the detached fallback instead: the same contained chain,
 *        unobserved;
 *     4. the P5 dispatched journal record, then the dispatched ledger line (the
 *        governor-family order: journal first, then the line).
 *
 *   Settle - the post-completion stage of the update continuation: removes the per-dir
 *   in-flight marker and the P2 registration, updates the circuit breaker (reset on 0,
 *   increment + the module's failure line + the P5 failure journal record otherwise), then
 *   runs U₂ - stat the mutated manifest (metadata, never content) and hand the stat's
 *   version to the module's Refresh (the Stash registration + the same-actor fs/observed
 *   re-emit), best-effort. Returns the code it was given so the dispatch chain can map it.
 *   Never rejects.
 *
 * The core NEVER imports the harness or the factory: the module identity, the maps and
 * every string arrive through `Dependencies` (structural - the module's State and target
 * are opaque `S`/`T` the core only passes back).
 */
declare function _default<S, T, V, R>(Dependency: Dependencies<S, T, V, R>): {
    Dispatch: (State: S, Target: T, Actor: object | undefined, Dir: string, Registry: R | null, PolicyPath: string) => Promise<void>;
    Settle: (State: S, Dir: string, Target: T, Actor: object | undefined, Code: number) => Promise<number>;
};
/**
 * The output-ring handle the jobs runtime passes to a started job's `run` callback
 * (structural: the only member the envelope consumes). The module's child stage pipes its
 * raw output into it IN ADDITION to the ledger; the ledger record stays byte-identical.
 */
export interface Job {
    /**
     * Append one output chunk to the job's live log.
     */
    append(text: string): void;
}
/**
 * The module-supplied injections (structural, never imported machinery).
 *
 * `S` is the module's State, `T` its fs target, `V` the version token it exchanges with the
 * factory, `R` its registry view - all opaque to the core, which only passes them back
 * through the injections.
 */
export interface Dependencies<S, T, V, R> {
    /**
     * Directory → consecutive update-stage failures (the circuit breaker).
     */
    Count: (State: S) => Map<string, number>;
    /**
     * Directory → epoch ms of the last update-stage dispatch (cooldown).
     */
    Stamp: (State: S) => Map<string, number>;
    /**
     * Directories with an update run in flight.
     */
    Set: (State: S) => Set<string>;
    /**
     * The P2 in-flight controllers, keyed by the factory's namespaced key.
     */
    Inflight: (State: S) => Map<string, {
        controller: AbortController;
    }>;
    /**
     * Circuit breaker: consecutive failures per directory before pause.
     */
    Limit: (State: S) => number;
    /**
     * Cooldown between update-stage dispatches, per directory (epoch ms).
     */
    Wait: (State: S) => number;
    /** The FACTORY's namespaced in-flight key for the update stage (`update:
     *  <targetKey>` — distinct from the chain pass's plain key). */
    UpdateKey: (State: S, Target: T) => string;
    /** The module's ledger (the factory's Append — the strings below are the
     *  module's). */
    Append: (State: S, Message: string) => void;
    /**
     * The module's P5 storage-domain journal (the factory's Journal).
     */
    Journal: (State: S, Event: string, Dir: string, Detail: string) => void;
    /** The module's U₂ refresh (the factory's Refresh: the Stash registration
     *  + the same-actor fs/observed re-emit). */
    Refresh: (State: S, Target: T, Actor: object | undefined, Version: V) => void;
    /** The metadata stat feeding U₂ (the version token is never computed or
     *  parsed locally). `undefined`/`null` and throws are contained. */
    Stat: (State: S, Target: T) => Promise<{
        version: V;
    } | undefined | null>;
    /** The job lifecycle hook: probe the (optional, never injected) jobs
     *  registry and EITHER start the spec's job OR invoke the detached
     *  fallback — the module owns the probe semantics (the guard, the
     *  starter's containment) and the core owns the spec and the hooks. */
    Start: (State: S, Specification: {
        /**
         * Producer kind — also the id prefix.
         */
        kind: string;
        /**
         * One-line label (the child stage's command and directory).
         */
        label: string;
        /**
         * Synchronous starter; the `owner` key is absent (unowned job).
         */
        run: (job: Job) => {
            /**
             * Request termination; synchronous, idempotent.
             */
            cancel: () => void;
            /**
             * Terminal outcome; must not reject.
             */
            done: Promise<{
                status: "completed" | "failed";
                detail: string;
            }>;
        };
    }, Detached: () => void) => void;
    /** The module's ledger lines — EVERY string stays module-owned and
     *  byte-identical (the smokes are the arbiter). */
    Lines: {
        /** `update stage paused for <dir> ...` (the breaker gate; the count is the
         *  raw map read — possibly undefined, exactly as the module wrote it). */
        Paused: (Dir: string, Count: number | undefined, Limit: number) => string;
        /**
         * `update stage skipped for <dir> (in-flight)`.
         */
        InFlight: (Dir: string) => string;
        /**
         * `update stage skipped for <dir> (cooldown)`.
         */
        Cooldown: (Dir: string) => string;
        /**
         * `update stage FAILED (<code>) for <dir>; consecutive=<n>`.
         */
        Failed: (Dir: string, Code: number, Consecutive: number | undefined) => string;
        /** `update stage dispatched for <dir> (...)` — names the mode/engine and
         *  the resolved policy path (or the built-in default). */
        Dispatched: (State: S, Dir: string, PolicyPath: string) => string;
    };
    /**
     * The P5 dispatched journal event name ("dispatched").
     */
    DispatchedEvent: string;
    /**
     * The dispatched journal record's detail (the module's own: its mode).
     */
    DispatchedDetail: (State: S) => string;
    /**
     * The P5 failure journal event name ("update-failed").
     */
    FailedEvent: string;
    /**
     * The producer kind of the update job ("governor-update").
     */
    Kind: string;
    /**
     * The job's one-line label (the child stage's command and directory).
     */
    Label: (Dir: string) => string;
    /**
     * The failed outcome's detail for a bug-level rejection (containment).
     */
    RejectedDetail: string;
    /** The exit-style code a bug-level Stage rejection settles with ("the
     *  stage threw" — a rejection carries no exit code). It feeds the module's
     *  own `Lines.Failed` line and the P5 record exactly as an exit code would.
     *  Absent: the core's -1 sentinel. */
    RejectedCode?: number;
    /** The child execution stage — THE drift the family absorbs here: the
     *  ncu modes vs the cargo CLI. Returns an exit-style code (0 success) fed
     *  to the outcome mapping and the module's failure line. Never rejects. */
    Stage: (State: S, Dir: string, Target: T, Actor: object | undefined, Registry: R | null, PolicyPath: string, Signal: AbortSignal, Job: Job | undefined) => Promise<number>;
}
