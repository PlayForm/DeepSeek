// Revert - the replay path (Function/Revert): restore a batch's files
// backward (reverse file order - the ordered set replayed in reverse). Per
// file, based on the entry's recorded pre-state:
//
//   * pre-state "present" - resolve the current target, read its current
//     version, and write the pre-image content back through the factory's
//     shared write executor with the replaceIfVersion fence: a fence
//     mismatch is a reported conflict (expected vs observed), never a
//     silent overwrite. A pre-image recorded as truncated is SKIPPED with
//     a ledger line - never half-applied.
//   * pre-state "absent" - the file did not exist before the batch, so the
//     replay removes it with a plain unlink. Exemption (documented, the
//     Append precedent): ctx.fs has no delete operation, so the one
//     deletion the rollback layer needs goes through node:fs directly;
//     every WRITE still goes through the factory's executor.
//
// Only a batch in the `applying` or `verified` state can be reverted; a
// reverted or recovery-required batch is refused (a recovery-required batch
// must first be recovered or consciously re-sealed by the operator).
// Individual file failures do not abort the pass: the report lists every
// file's outcome and the batch ends in the `reverted` state (the honest
// per-file report, the recovery table's per-obligation behavior).
//
// THE POLICY GATE (D6): the revert is the journal's gated action because it
// writes the pre-images back. An `approve` verdict for `write` (the shipped
// default) refuses the pass with the documented
// `revert held (<n> files) (policy write=approve)` line, ZERO writes, no
// state change and no record; `auto` proceeds.
import Record from "@Function/Record.js";
import RevertFile from "@Function/RevertFile.js";
import type Result from "@Interface/Result.js";
import type State from "@Interface/State.js";
import { Decide } from "@playform/ets-plugin-dsh-factory";

export default async (State: State, BatchId: string): Promise<Result> => {
	const Batch = State.Batches.get(BatchId);
	if (Batch === undefined) {
		State.Factory.Append(State, `revert failed ${BatchId} (unknown batch)`);
		throw new Error(`unknown batch: ${BatchId}`);
	}
	switch (Batch.state) {
		case "applying":
		case "verified":
			break;
		default:
			State.Factory.Append(
				State,
				`revert failed ${BatchId} (state ${Batch.state}, not reversible)`,
			);
			throw new Error(`batch ${BatchId} is ${Batch.state}, not reversible`);
	}
	// THE POLICY GATE (D6): a revert WRITES the pre-images back, so it is the
	// journal's gated action. An `approve` verdict refuses the whole pass
	// before any file is touched - the documented line, ZERO writes, no
	// state change and no record: the batch stays reversible and waits for
	// the user (flip `policy.write` to `auto`, or let a pack override it).
	switch (Decide(State.Allow, "write")) {
		case "auto":
			break;
		default:
			State.Factory.Append(
				State,
				`revert held (${Batch.files.length} files) (policy write=approve)`,
			);
			throw new Error(`batch ${BatchId} is held by the policy (write=approve)`);
	}
	const Files: Result["files"] = [];
	// Reverse order: last written, first restored.
	for (const Path of [...Batch.files].reverse()) {
		const Entry = State.Entries.get(`${BatchId}:${Path}`);
		const Outcome =
			Entry === undefined
				? {
						path: Path,
						action: "skipped" as const,
						reason: "no entry recorded",
					}
				: await RevertFile(State, BatchId, Entry);
		Files.push(Outcome);
	}
	Batch.state = "reverted";
	State.Factory.Append(State, `reverted ${BatchId} (${Files.length} files)`);
	await Record(State, Batch);
	return { files: Files };
};
