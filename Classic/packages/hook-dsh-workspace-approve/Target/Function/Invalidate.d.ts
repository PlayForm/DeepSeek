import type State from "../Interface/State.js";
export default _default;
/**
 * @module Invalidate
 *
 * The fs/observed listener: the SYNCHRONOUS RECORDER that keeps the
 * exact-approval contract honest over time.
 *
 * @remarks
 *
 * When the file a binding covers is observed at a DIFFERENT version than the
 * one bound in the approval, the candidate changed after the approval - the
 * binding is invalidated (decision `invalidated`).
 *
 * The discipline, per the family contract:
 *
 * - The CALL-TIME master switch FIRST: a disabled hook reads State.On at the
 *   moment of the call and passes through with ZERO ledger lines (the
 *   live-flip law - a volatile flip acts on the very next event).
 * - NO awaits, NO I/O on the listener path.
 * - An event whose `actor` is the hook's OWN actor object is ignored (the
 *   identity check).
 * - A `present` observation with an unchanged version is a no-op (the common
 *   case: nothing to invalidate).
 * - The listener NEVER THROWS: the whole body is one try/catch - a malformed
 *   event is caught and ledgered as `failed <path> (<reason>)`.
 */
declare function _default(State: State, Target: unknown, Observation: unknown, Actor: object | undefined): void;
