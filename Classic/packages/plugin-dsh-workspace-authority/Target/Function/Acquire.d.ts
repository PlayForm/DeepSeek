/**
 * @module Acquire
 *
 * The lease acquisition path: the HOW LONG record.
 *
 * @remarks
 * Validate, sweep the holder's expired leases first (lazy expiry), enforce the
 * per-holder ceiling, stamp the record with the TTL (the policy table's
 * per-kind `ttlMs` override when one matches the resource kind, else the config
 * default), ledger.
 */
import type Lease from "../Interface/Lease.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Holder: string, Resource: string, Kind: string, TtlMs?: number | undefined): Lease | undefined;
