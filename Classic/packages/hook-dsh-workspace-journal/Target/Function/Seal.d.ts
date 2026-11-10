import type State from "../Interface/State.js";
export default _default;
/**
 * @module Seal
 *
 * The batch close path: moves the batch record to its terminal state.
 *
 * @remarks
 *
 * "verified" closes a batch whose writes landed and were checked;
 * "recovery-required" closes one where the seal of the writes never arrived
 * (a crash between the commit and the journal is the logged failure mode of
 * the inverse representation) or a check failed. Only a batch in the
 * `applying` state can be sealed; sealing a terminal batch is refused with a
 * ledger line, never silently ignored.
 */
declare function _default(State: State, BatchId: string, Next: "verified" | "recovery-required", Reason?: string): Promise<unknown>;
