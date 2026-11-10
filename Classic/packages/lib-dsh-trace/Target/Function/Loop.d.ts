import type Queue from "../Interface/Queue.js";
export default _default;
/**
 * @module Loop
 *
 * The detached-loop helper (the "daemon trace"): a coalescing queue keyed by
 * path, ONE in-flight task per key, no timers in the hot path, fail-open, and a
 * `Flush` promise for deterministic smokes.
 *
 * @remarks
 *
 * - `Schedule(key)` starts `Run(key)` when no task for that key is in flight
 *   and DROPS the schedule otherwise, so a coalesced pair produces ONE run.
 * - `Run`'s rejection is swallowed (fail-open): the loop never rejects and
 *   never throws into the caller, which is a synchronous listener.
 * - `Flush` is the promise of every task currently in flight; a smoke awaits
 *   it instead of sleeping. It re-checks until the in-flight set is empty, so
 *   a run that schedules further work still settles before `Flush` resolves.
 * - `Dispose` stops future scheduling and clears the queue; an in-flight task
 *   is allowed to finish (a running re-index is never torn mid-write).
 *
 * No `setTimeout`, no interval, no wall clock: the loop is a microtask chain
 * the caller can await.
 */
declare function _default(Run: (Key: string) => Promise<void> | void): Queue;
