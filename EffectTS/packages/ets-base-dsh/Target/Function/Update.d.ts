import { Effect, Scope } from "effect";
/**
 * @module Update
 *
 * The shared update-stage envelope of the governance family, re-issued as an
 * effect builder on Effect-TS v4: the Dispatch/Settle pair every update
 * engine is wrapped in.
 *
 * @remarks
 *
 * The package governor (ncu) and the cargo governor (cargo upgrade) run the
 * same control flow - only the child execution stage and the module's own
 * ledger strings differ - so the flow lives here as a builder: the module
 * supplies its injected dependencies (the State's maps and functions, the
 * factory delegates, the job lifecycle hooks, the P5 journal event names and
 * every ledger string) and receives the pair. A new governance module's
 * update stage reduces to a child runner plus strings; the flow is not forked
 * per module.
 *
 * The same `Dependencies` injection shape as the Classic release (the maps,
 * the delegates, the job lifecycle hooks, the strings - all structural, never
 * imported machinery); what changes is the result type: the pair runs as
 * typed effects instead of promises:
 *
 * - Dispatch: `Effect<void, never, Scope>` - requires the caller's Scope in
 *   the environment: the plugin provides its long-lived plugin scope, so the
 *   detached continuation is forked into it (`Effect.forkIn`) and the
 *   in-flight fiber is interrupted when the scope closes (the Classic
 *   Inflight-disposal semantics, plus fiber interruption for free). The
 *   detached continuation also aborts the task-owned `AbortController` on
 *   interruption (`Effect.onInterrupt` -> `Control.abort`), so the child
 *   process dies with the fiber.
 * - Settle: `Effect<number>` - never fails: the U2 stat is best-effort
 *   (`Effect.exit` containment, the Classic try/catch).
 *
 * The flow (byte-identical across the family, verified by the smokes):
 *
 * Dispatch - the g4 stage (U):
 *
 * 1. The gates, all as switch (true) cases: circuit breaker -> in-flight ->
 *    cooldown; the per-dir maps (Stamp/Set/Count) stay in the module's State
 *    and guard the dispatch; each gate logs its own module-owned line and
 *    returns.
 * 2. The task-owned AbortController, registered in the module's in-flight map
 *    under the factory's namespaced key (UpdateKey - distinct from the chain
 *    pass's plain key: the collision lesson, P2) and removed on settlement.
 * 3. The jobs envelope via the module's Start hook: an unowned job (`owner`
 *    key absent - open to any caller until service disposal) whose `cancel`
 *    aborts the task-owned signal and whose `done` is the never-rejecting
 *    contained chain Stage -> Settle -> `{ status, detail: `exit code:
 *    <code>` }` (the contained chain runs through `Effect.runPromise` - the
 *    job runtime observes the plain promise; a bug-level rejection still
 *    settles the breaker and resolves `failed` with the module's rejected
 *    detail). When no job registry serves the context (or the starter
 *    rejects), the module's Start hook invokes the detached fallback instead:
 *    the same contained chain, forked on the plugin scope (`Effect.forkIn`)
 *    - the fiber is interrupted at dispose.
 * 4. The P5 dispatched journal record, then the dispatched ledger line (the
 *    governor-family order: journal first, then the line).
 *
 * Settle - the post-completion stage of the update continuation: removes the
 * per-dir in-flight marker and the P2 registration, updates the circuit
 * breaker (reset on 0, increment plus the module's failure line plus the P5
 * failure journal record otherwise), then runs U2 - stat the mutated manifest
 * (metadata, never content) and hand the stat's version to the module's
 * Refresh (the Stash registration plus the same-actor fs/observed re-emit),
 * best-effort. Returns the code it was given so the dispatch chain can map
 * it. Never rejects.
 *
 * The core never imports the harness or the factory: the module identity, the
 * maps and every string arrive through `Dependencies` (structural - the
 * module's State and target are opaque `S`/`T` the core only passes back).
 * The `Stage` and `Stat` dependencies stay plain promise seams (the
 * harness-free convention - the module's child runner and stat are ordinary
 * async functions); the core lifts them into effects (`Effect.tryPromise`)
 * and contains every outcome with `Effect.exit`, so the typed effect never
 * fails where the Classic promise chain never rejected.
 */
/**
 * Job - the output-ring handle the jobs runtime passes to a started job's
 * `run` callback (structural: the only member the envelope consumes).
 *
 * @remarks
 *
 * The module's child stage pipes its raw output into it in addition to the
 * ledger; the ledger record stays byte-identical.
 */
export interface Job {
    /**
     * Append one output chunk to the job's live log.
     */
    append(text: string): void;
}
/**
 * Dependencies - the module-supplied injections (structural, never imported
 * machinery).
 *
 * @remarks
 *
 * `S` is the module's State, `T` its fs target, `V` the version token it
 * exchanges with the factory, `R` its registry view - all opaque to the core,
 * which only passes them back through the injections.
 */
export interface Dependencies<S, T, V, R> {
    /**
     * Directory -> consecutive update-stage failures (the circuit breaker).
     */
    Count: (State: S) => Map<string, number>;
    /**
     * Directory -> epoch ms of the last update-stage dispatch (cooldown).
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
    /**
     * The factory's namespaced in-flight key for the update stage
     * (`update: <targetKey>` - distinct from the chain pass's plain key).
     */
    UpdateKey: (State: S, Target: T) => string;
    /**
     * The module's ledger (the factory's Append - the strings below are the
     * module's).
     */
    Append: (State: S, Message: string) => void;
    /**
     * The module's P5 storage-domain journal (the factory's Journal).
     */
    Journal: (State: S, Event: string, Dir: string, Detail: string) => void;
    /**
     * The module's U2 refresh (the factory's Refresh: the Stash registration
     * plus the same-actor fs/observed re-emit).
     */
    Refresh: (State: S, Target: T, Actor: object | undefined, Version: V) => void;
    /**
     * The metadata stat feeding U2 (the version token is never computed or
     * parsed locally). `undefined`/`null` and throws are contained.
     */
    Stat: (State: S, Target: T) => Promise<{
        version: V;
    } | undefined | null>;
    /**
     * The job lifecycle hook: probe the (optional, never injected) jobs
     * registry and either start the spec's job or invoke the detached
     * fallback - the module owns the probe semantics (the guard, the
     * starter's containment) and the core owns the spec and the hooks.
     */
    Start: (State: S, Specification: {
        /**
         * Producer kind - also the id prefix.
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
    /**
     * The module's ledger lines - every string stays module-owned and
     * byte-identical (the smokes are the arbiter).
     */
    Lines: {
        /**
         * `update stage paused for <dir> ...` (the breaker gate; the count is
         * the raw map read - possibly undefined, exactly as the module wrote
         * it).
         */
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
        /**
         * `update stage dispatched for <dir> (...)` - names the mode/engine
         * and the resolved policy path (or the built-in default).
         */
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
    /**
     * The child execution stage - the drift the family absorbs here: the ncu
     * modes vs the cargo CLI. Returns an exit-style code (0 success) fed to
     * the outcome mapping and the module's failure line. Never rejects.
     */
    Stage: (State: S, Dir: string, Target: T, Actor: object | undefined, Registry: R | null, PolicyPath: string, Signal: AbortSignal, Job: Job | undefined) => Promise<number>;
}
export default _default;
declare function _default<S, T, V, R>(Dependency: Dependencies<S, T, V, R>): {
    Dispatch: (State: S, Target: T, Actor: object | undefined, Dir: string, Registry: R | null, PolicyPath: string) => Effect.Effect<void, never, Scope.Scope>;
    Settle: (State: S, Dir: string, Target: T, Actor: object | undefined, Code: number) => Effect.Effect<number>;
};
