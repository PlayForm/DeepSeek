import type State from "../Interface/State.js";
import type { Envelope } from "@playform/lib-dsh-trace";
export default _default;
/**
 * @module Invalidate
 *
 * The context's `graph/invalidated` consumer: drop the packet memo
 * (Function/Cached).
 *
 * @remarks
 *
 * A packet may cite any path in its FOCUS, NEIGHBORS or EVIDENCE bands, so
 * one invalidation invalidates every memoized packet - the next identical
 * query rebuilds against the graph's current revision. The caller-focus
 * tracker (State.Focus) is NOT touched: the STALE contract is about the
 * version the CALLER held, which an invalidation does not change.
 *
 * Silent by design: the invalidation adds no ledger line (the module's
 * strings stay byte-exact); the trace ring is the evidence of the event.
 */
declare function _default(State: State, Envelope: Envelope): void;
