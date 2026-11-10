import type { BatchDecision, BatchProposal } from "../Interface/Batch.js";
import type { PendingProposal } from "../Interface/State.js";
import type State from "../Interface/State.js";
/**
 * @module Proposals
 *
 * The pending-proposal store (Function/Proposals): record, expire, decide,
 * list.
 *
 * @remarks
 *
 * Pure in-memory state on the State object - the durable record is the ledger
 * file. Expiry is evaluated lazily at every read/decision (no timers in the
 * plugin): a proposal past expiresAt becomes an "expired" decision by
 * "policy" the first time it is touched.
 */
export declare const Now: (State_: State) => number;
/**
 * Record a proposal; returns false when the id is a duplicate (ignored -
 * the id is content-derived and a re-proposal of the same content is the
 * same batch, possibly at a new revision: a revision bump replaces in
 * place).
 */
export declare const Record: (State_: State, Proposal: BatchProposal, At: number) => boolean;
/**
 * The lazily-expired decision for a proposal, or undefined when pending.
 */
export declare const ExpiredDecision: (State_: State, Entry: PendingProposal) => BatchDecision | undefined;
/**
 * Apply a decision to a pending entry; counts user approvals for the
 * first-batch rule. Returns the entry or undefined when unknown.
 */
export declare const Decide: (State_: State, Decision: BatchDecision) => PendingProposal | undefined;
/**
 * Sweep the pending map: drop entries older than PendingTtlMs.
 */
export declare const Sweep: (State_: State) => number;
/**
 * The pending (undecided, unexpired) proposals, oldest first.
 */
export declare const Pending: (State_: State) => PendingProposal[];
