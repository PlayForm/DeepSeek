import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Persist
 *
 * The fire-and-forget record writer: one put into the opened domain's
 * `proposals` table plus the `__meta` record.
 *
 * @remarks
 *
 * Never awaited by the caller; every failure is contained (the storage layer
 * is best-effort - the in-memory table and the ledger line are the truth
 * when the domain is absent).
 */
declare function _default(State: State, Proposal: Proposal | undefined): void;
