import type { State as Shared } from "@playform/plugin-dsh-factory";
import type Factory from "./Factory.js";
export default interface State extends Shared {
    /** Strict chain pass: strip unknown deps in a governed workspace. */
    Strict: boolean;
    /** Cooldown between update-stage dispatches, per directory (epoch ms). */
    Wait: number;
    /** Circuit breaker: consecutive update-stage failures per directory. */
    Limit: number;
    /** ncu binary for bin mode (absolute path — the host PATH is not the
     *  user's shell PATH). */
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
}
