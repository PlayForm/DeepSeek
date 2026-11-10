import type Batch from "../Interface/Batch.js";
import type Commit from "../Interface/Commit.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Commit
 *
 * The batch merge orchestrator: the atomic gates first, then the per-file
 * commits through the factory's write executor, ONE FILE AT A TIME.
 *
 * @remarks
 *
 * The sequential fold means the version-guarded writes can never race.
 * The atomicity semantics:
 *
 *   * all-or-nothing (default) - a gate failure rejects the whole batch
 *     (every reply says `rejected` with the gate reason); a mid-batch
 *     failure stops the batch and marks the REMAINING files
 *     `recovery-required` (recoverable partial states, never an invisible
 *     intermediate state - the journal domain completes or compensates);
 *   * survivors - gate-level conflicts and per-file failures are per-file
 *     replies; the batch continues and reports what survived.
 *
 * Every per-file reply is ledgered with its frozen line; the batch gets
 * `merge: batch <id> started ...` and `merge: batch <id> complete ...`.
 * The record is persisted after the batch (the journal the recovery
 * domain reads later).
 *
 * THE POLICY GATE (D6): the commit is the hook's gated action. An `approve`
 * verdict for `commit` (the shipped default) holds the WHOLE batch before
 * the gates and before any write, with the documented
 * `merge held (<n> files) (policy commit=approve)` line; the reply is the
 * `rejected` commit shape and nothing is persisted. `auto` proceeds.
 */
declare function _default(State: State, Request: Batch): Promise<Commit>;
