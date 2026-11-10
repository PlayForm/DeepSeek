/**
 * @module Watch
 *
 * The fs/observed listener: the invalidation seam.
 *
 * @remarks
 * Registered on the ROOT context through the factory's Wire (the exact
 * `Context.root.on("fs/observed", ...)` registration, the factory's
 * Function/Wire.ts - root registration is the posture that hears ALL
 * fs/observed emissions). The discipline, per the observe hook's frozen
 * contract:
 *
 * - NO awaits and NO file content is ever read - the event already carries the
 *   version token; the listener only INVALIDATES;
 * - the sequence is the service's own monotonic counter, never a wall clock
 *   (the listener advances it only through the invalidation writes);
 * - the guard chain, in order:
 *   1. an event whose `actor` is the service's OWN actor object is ignored -
 *      ledger `ignored <path> (own actor)`;
 *   2. a path matching config `exclude` is ignored - ledger
 *      `ignored <path> (excluded)`;
 *   3. an absent observation does not invalidate (a missing file is not a
 *      dependency change) - ledger `ignored <path> (absent observation)`;
 *   4. a REPEAT event - the same path carrying the same version within the
 *      coalescing window (Function/Duplicate) - is dropped silently: the
 *      invalidation for that file state already ran, and any validation created
 *      since is fresh against the same state;
 * - a present observation invalidates with the path as the key - the
 *   Function/Invalidate pass marks every dependent validation stale;
 * - the listener NEVER THROWS: the whole body is one try/catch - a malformed
 *   event is caught and ledgered as `failed <path> (<reason>)`.
 */
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State, Target: FsTarget | undefined, Observation: FsObservation | undefined, Actor: object | undefined): void;
