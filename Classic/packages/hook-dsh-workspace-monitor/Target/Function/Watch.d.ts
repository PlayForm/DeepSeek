/**
 * @module Watch
 *
 * The fs/observed listener: the SYNCHRONOUS RECORDER, registered on the ROOT
 * context through the factory's Wire.
 *
 * @remarks
 * The registration is the exact `Context.root.on("fs/observed", ...)`
 * posture. The watch form of the monitor role: the listener records the
 * observation into the watch map with a debounce deadline computed from the
 * module's Clock, and then runs the sweep's deadline scan (the event IS the
 * checkpoint - no real timers).
 *
 * - NO awaits and NO subprocess work on the listener path; the ledger Append
 *   rides the family's synchronous Append (logger + appendFileSync);
 * - the guard chain, in order:
 *   1. an event whose `actor` is the hook's OWN actor object is ignored (the
 *      identity check) - ledger `ignored <path> (own actor)`;
 *   2. a path matching config `exclude` is ignored - ledger
 *      `ignored <path> (excluded)`;
 *   3. a non-empty config `include` that the path does not match is ignored -
 *      ledger `ignored <path> (not included)`;
 * - a present observation records the event's version verbatim; an absent
 *   observation records version "absent" (honest, never a fabricated
 *   version);
 * - the listener NEVER THROWS: the whole body is one try/catch - a malformed
 *   event is caught and ledgered as `failed <path> (<reason>)`.
 */
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Target: FsTarget | undefined, Observation: FsObservation | undefined, Actor: object | undefined): void;
