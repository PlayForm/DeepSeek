import { Effect, Scope } from "effect";
export interface Job {
    /** Append one output chunk to the job's live log. */
    append(text: string): void;
}
export interface Dependencies<S, T, V, R> {
    /** Directory → consecutive update-stage failures (the circuit breaker). */
    Count: (State: S) => Map<string, number>;
    /** Directory → epoch ms of the last update-stage dispatch (cooldown). */
    Stamp: (State: S) => Map<string, number>;
    /** Directories with an update run in flight. */
    Set: (State: S) => Set<string>;
    /** The P2 in-flight controllers, keyed by the factory's namespaced key. */
    Inflight: (State: S) => Map<string, {
        controller: AbortController;
    }>;
    /** Circuit breaker: consecutive failures per directory before pause. */
    Limit: (State: S) => number;
    /** Cooldown between update-stage dispatches, per directory (epoch ms). */
    Wait: (State: S) => number;
    /** The FACTORY's namespaced in-flight key for the update stage (`update:
     *  <targetKey>` — distinct from the chain pass's plain key). */
    UpdateKey: (State: S, Target: T) => string;
    /** The module's ledger (the factory's Append — the strings below are the
     *  module's). */
    Append: (State: S, Message: string) => void;
    /** The module's P5 storage-domain journal (the factory's Journal). */
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
    Start: (State: S, Spec: {
        /** Producer kind — also the id prefix. */
        kind: string;
        /** One-line label (the child stage's command and directory). */
        label: string;
        /** Synchronous starter; the `owner` key is absent (unowned job). */
        run: (job: Job) => {
            /** Request termination; synchronous, idempotent. */
            cancel: () => void;
            /** Terminal outcome; must not reject. */
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
        /** `update stage skipped for <dir> (in-flight)`. */
        InFlight: (Dir: string) => string;
        /** `update stage skipped for <dir> (cooldown)`. */
        Cooldown: (Dir: string) => string;
        /** `update stage FAILED (<code>) for <dir>; consecutive=<n>`. */
        Failed: (Dir: string, Code: number, Consecutive: number | undefined) => string;
        /** `update stage dispatched for <dir> (...)` — names the mode/engine and
         *  the resolved policy path (or the built-in default). */
        Dispatched: (State: S, Dir: string, PolicyPath: string) => string;
    };
    /** The P5 dispatched journal event name ("dispatched"). */
    DispatchedEvent: string;
    /** The dispatched journal record's detail (the module's own: its mode). */
    DispatchedDetail: (State: S) => string;
    /** The P5 failure journal event name ("update-failed"). */
    FailedEvent: string;
    /** The producer kind of the update job ("governor-update"). */
    Kind: string;
    /** The job's one-line label (the child stage's command and directory). */
    Label: (Dir: string) => string;
    /** The failed outcome's detail for a bug-level rejection (containment). */
    RejectedDetail: string;
    /** The child execution stage — THE drift the family absorbs here: the
     *  ncu modes vs the cargo CLI. Returns an exit-style code (0 success) fed
     *  to the outcome mapping and the module's failure line. Never rejects. */
    Stage: (State: S, Dir: string, Target: T, Actor: object | undefined, Registry: R | null, PolicyPath: string, Signal: AbortSignal, Job: Job | undefined) => Promise<number>;
}
export default _default;
declare function _default<S, T, V, R>(Dep: Dependencies<S, T, V, R>): {
    Dispatch: (State: S, Target: T, Actor: object | undefined, Dir: string, Registry: R | null, PolicyPath: string) => Effect.Effect<void, never, Scope.Scope>;
    Settle: (State: S, Dir: string, Target: T, Actor: object | undefined, Code: number) => Effect.Effect<number>;
};
