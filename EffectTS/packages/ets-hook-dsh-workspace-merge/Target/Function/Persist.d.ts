/**
 * @module Persist
 *
 * The fire-and-forget batch record writer: one put into the opened
 * domain's `batches` table plus the `__meta` record (sequence).
 *
 * @remarks
 * Never awaited by the caller; every failure is contained (the storage
 * layer is best-effort - the in-memory map and the ledger line are the
 * truth when the domain is absent).
 */
import type Record from "../Interface/Record.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, RecordData: Record): void;
