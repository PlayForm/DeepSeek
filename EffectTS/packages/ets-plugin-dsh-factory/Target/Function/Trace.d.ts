/**
 * @module Trace
 *
 * The trace-bus service body: the ONE bus the family shares.
 *
 * @remarks
 * Provided as `ctx.trace` by the factory's constructor (the factory is the family's
 * shared-machinery owner; the vocabulary and the detached loop live in
 * @playform/ets-lib-dsh-trace, the service lives here - D5: no separate indexer process and no
 * separate indexer plugin).
 *
 * The contract:
 *
 * - `emit(draft)` - complete the envelope through the library's Complete (the bus assigns
 *   `trace-<n>` and `at` when the emitter supplied none), push it into the bounded ring, and
 *   dispatch it to the listeners registered for its kind. EVERY listener runs inside its own
 *   try/catch and the whole body is one try/catch: `emit` NEVER throws into a caller (the caller
 *   is a synchronous fs/observed listener).
 * - `on(name, listener)` - subscribe; the returned disposer unsubscribes and is idempotent. A
 *   subscription after `dispose` returns a no-op disposer.
 * - `flush()` - the deterministic settle seam. The bus dispatches synchronously, so it resolves
 *   immediately (no timer, no queue here - the coalescing belongs to the adapters' detached
 *   loops).
 * - `ring(limit?)` - the bounded recent envelopes, NEWEST first (the smoke surface; the bound is
 *   the library's fixed `Bound`, not a config knob).
 * - `dispose()` - the unload path: drop every listener, stop dispatch. A late emit or
 *   subscription is a contained no-op (the service may be unmounted while an adapter still holds
 *   it).
 */
import type Trace from "../Interface/Trace.js";
export default _default;
declare function _default(): Trace;
