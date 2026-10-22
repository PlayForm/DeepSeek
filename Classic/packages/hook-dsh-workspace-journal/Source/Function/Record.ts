// Record - the batch-record persistence (Function/Record): one put into the
// domain's `batches` table, fire-and-forget. Called from the seal, the
// recover and the listener's progress checkpoint - the caller is always an
// async path or a guarded synchronous one, so the put is never awaited by
// the synchronous listener.
import type BatchRecord from "@Interface/Batch.js";
import type State from "@Interface/State.js";

export default async (State: State, Batch: BatchRecord): Promise<void> => {
	try {
		const Handle = State.Handle;
		if (Handle !== undefined) {
			await Handle.table("batches").put(Batch.batchId, Batch);
		}
	} catch {
		/* storage optional - the in-memory record stays authoritative */
	}
};
