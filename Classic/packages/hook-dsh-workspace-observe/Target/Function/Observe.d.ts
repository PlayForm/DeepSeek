/**
 * @module Observe
 *
 * The fs/observed listener: the SYNCHRONOUS RECORDER, registered on the ROOT
 * context through the factory's Wire.
 *
 * @remarks
 * The registration is the exact `Context.root.on("fs/observed", ...)`
 * registration, Function/Wire.ts of the factory - root registration is the
 * posture that hears ALL fs/observed emissions. The discipline, per the frozen
 * contract:
 *
 * - NO awaits, NO I/O on the listener path, and NO file content is ever read -
 *   the event already carries the version token;
 * - the sequence is the plugin's own monotonic counter (`State.Sequence`),
 *   never a wall clock;
 * - the guard chain, in order:
 *   1. an event whose `actor` is the hook's OWN actor object is ignored (the
 *      identity check) - ledger `ignored <path> (own actor)`;
 *   2. a path matching config `exclude` is ignored - ledger
 *      `ignored <path> (excluded)`;
 *   3. a non-empty config `include` that the path does not match is ignored -
 *      ledger `ignored <path> (not included)`;
 *   4. a REPEAT event - the same path carrying the same version within the
 *      coalescing window (Function/Duplicate) - is dropped silently: that file
 *      state was already recorded, and the last distinct version always wins;
 * - a present observation records the event's version verbatim; an absent
 *   observation records version "absent" (honest, never a fabricated version);
 * - the listener NEVER THROWS: the whole body is one try/catch - a malformed
 *   event is caught and ledgered as `failed <path> (<reason>)` (the logger
 *   line rides the same Append).
 */
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Target: FsTarget | undefined, Observation: FsObservation | undefined, Actor: object | undefined): void;
