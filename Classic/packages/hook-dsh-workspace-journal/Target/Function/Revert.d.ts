import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Revert
 *
 * The replay path: restores a batch's files backward (reverse file order -
 * the ordered set replayed in reverse).
 *
 * @remarks
 *
 * Per file, based on the entry's recorded pre-state:
 *
 *   - pre-state "present" - resolve the current target, read its current
 *     version, and write the pre-image content back through the factory's
 *     shared write executor with the replaceIfVersion fence: a fence
 *     mismatch is a reported conflict (expected vs observed), never a
 *     silent overwrite. A pre-image recorded as truncated is SKIPPED with
 *     a ledger line - never half-applied.
 *   - pre-state "absent" - the file did not exist before the batch, so the
 *     replay removes it with a plain unlink. Exemption (documented, the
 *     Append precedent): ctx.fs has no delete operation, so the one
 *     deletion the rollback layer needs goes through node:fs directly;
 *     every WRITE still goes through the factory's executor.
 *
 * Only a batch in the `applying` or `verified` state can be reverted; a
 * reverted or recovery-required batch is refused (a recovery-required batch
 * must first be recovered or consciously re-sealed by the operator).
 * Individual file failures do not abort the pass: the report lists every
 * file's outcome and the batch ends in the `reverted` state (the honest
 * per-file report, the recovery table's per-obligation behavior).
 *
 * THE POLICY GATE (D6): the revert is the journal's gated action because it
 * writes the pre-images back. An `approve` verdict for `write` (the shipped
 * default) refuses the pass with the documented
 * `revert held (<n> files) (policy write=approve)` line, ZERO writes, no
 * state change and no record; `auto` proceeds.
 */
declare function _default(State: State, BatchId: string): Promise<Result>;
