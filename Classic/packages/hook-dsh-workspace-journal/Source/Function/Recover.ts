// Recover - the crash recovery pass (Function/Recover): run once at boot
// (from Apply, after the domain has loaded). Every batch record still in
// the `applying` state is, by definition, a crash between the commit and
// the seal: it is marked `recovery-required` with its identity, its
// per-file progress is reported, and the report lists the batch IDs so the
// operator (or a later slice's automation) can complete or compensate.
// The honest all-or-nothing (WORKSPACE-FAMILY-V4-1.md section 3.6 item 6):
// recoverable partial states, never an invisible intermediate state.
import type { RecoveryReport } from "@Interface/Result.js";
import type State from "@Interface/State.js";

export default async (State: State): Promise<RecoveryReport> => {
	const BatchIds: string[] = [];
	for (const Batch of State.Batches.values()) {
		if (Batch.state !== "applying") {
			continue;
		}
		Batch.state = "recovery-required";
		Batch.reason = `applying at boot with ${Batch.progress}/${Batch.files.length} writes observed`;
		State.Factory.Append(State, `recovery-required ${Batch.batchId} (${Batch.reason})`);
		BatchIds.push(Batch.batchId);
	}
	return { batchIds: BatchIds };
};
