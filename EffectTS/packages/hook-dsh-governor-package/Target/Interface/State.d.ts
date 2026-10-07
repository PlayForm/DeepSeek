import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scope } from "effect";
import type Factory from "./Factory.js";
export default interface State extends Shared {
    /** Strict chain pass: strip unknown deps in a governed workspace. */
    Strict: boolean;
    /** Cooldown between update-stage dispatches, per directory (epoch ms). */
    Wait: number;
    /** Circuit breaker: consecutive update-stage failures per directory. */
    Limit: number;
    /** ncu binary for bin mode (binary name or absolute path — resolved via
     *  the host PATH). */
    Binary: string;
    /** Update stage mode: "programmatic" (ncu library in-process) or "bin". */
    Mode: string;
    /** Directory → epoch ms of the last update-stage dispatch (cooldown). */
    Stamp: Map<string, number>;
    /** Directories with an update run in flight. */
    Set: Set<string>;
    /** Directory → consecutive update-stage failures (circuit breaker). */
    Count: Map<string, number>;
    /** The injected @playform/plugin-dsh-factory service — every absorbed
     *  primitive (Append/Journal/Gate/Discover/Parse/Continue/Refresh) is
     *  consumed through it; assigned once in Function/Apply. */
    Factory: Factory;
    /** THE EFFECT DELTA (register #13, R3): the plugin's long-lived Effect
     *  `Scope` — the fiber home of the CORE's typed-effect update envelope.
     *  The envelope's `Dispatch: Effect<void, never, Scope.Scope>` requires
     *  the CALLER's Scope in its environment: the module provides this one
     *  (`Scope.provide`), so the detached fallback continuation is forked
     *  INTO it (`Effect.forkIn` — the fiber is interrupted if the scope ever
     *  closes, the interruption aborting the task-owned controller) and the
     *  `dsh.update.dispatch` span runs under it. Created once in
     *  Function/Apply (a synchronous `Scope.make` — apply is a sync seam);
     *  Function/Dispatch lazily creates it defensively if a State arrives
     *  without one (the smoke's sim States never dispatch, so the normal
     *  path is always the apply-created scope). Not closed by the loader —
     *  the Classic disposal semantics are preserved through the P2 Inflight
     *  abort (the factory's Attach effect), which kills the child stages via
     *  the task-owned signal; the scope-closing interruption is the
     *  additional Effect-native lever. Optional: a State built without
     *  apply (a test sim State) dispatches through the lazily-created one. */
    Scope?: Scope.Closeable | undefined;
}
