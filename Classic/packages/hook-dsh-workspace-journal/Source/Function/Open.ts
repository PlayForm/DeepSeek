// Open - the batch open path (Function/Open): the journal is written BEFORE
// the batch's writes land. The caller (the merge step) passes the batch
// identity plus the per-file pre-images it captured before writing; the
// entries are the REVERT DATA and land in the domain's `entries` table
// first, the batch record (state `applying`) second, the ring third. If any
// part of the open fails, the caller is told so it can refuse to proceed -
// "the workspace transaction is the ordered set of those writes plus the
// journal" (WORKSPACE-FAMILY-V4-1.md section 3.8): no journal, no writes.
//
// The in-memory maps and the bounded ring are the read surface; the domain
// persistence is fire-and-forget (`void .catch(...)`), but the FIRST write
// of the batch record is awaited so a total storage failure is observable.
import type BatchRecord from "@Interface/Batch.js";
import type EntryRecord from "@Interface/Entry.js";
import type State from "@Interface/State.js";

export default async (State: State, Batch: BatchRecord, Entries: EntryRecord[]): Promise<void> => {
	State.Batches.set(Batch.batchId, Batch);
	for (const Entry of Entries) {
		State.Entries.set(`${Entry.batchId}:${Entry.path}`, Entry);
	}
	// The ring cap: the oldest batch is EVICTED (its record and entries are
	// removed from memory and the domain) when the bound is exceeded - the
	// eviction is ledgered, never silent.
	State.Ring.push(Batch.batchId);
	while (State.Ring.length > State.MaxBatches) {
		const Evicted = State.Ring.shift();
		if (Evicted !== undefined) {
			State.Factory.Append(State, `capped ${Evicted} (maxBatches ${State.MaxBatches})`);
			Drop(State, Evicted);
		}
	}
	try {
		const Handle = State.Handle;
		if (Handle !== undefined) {
			for (const Entry of Entries) {
				Handle.table("entries")
					.put(`${Entry.batchId}:${Entry.path}`, Entry)
					.catch(() => {
						/* entry writes best-effort */
					});
			}
			await Handle.table("batches").put(Batch.batchId, Batch);
			Handle.table("ring")
				.put("__ring", [...State.Ring])
				.catch(() => {
					/* ring write best-effort */
				});
			return;
		}
		// No domain handle (storage pending or skipped): the batch is
		// honest-but-volatile; the ledger line already records it.
	} catch (Cause) {
		throw new Error(`journal open failed: ${(Cause as Error)?.message ?? String(Cause)}`);
	}
};

/** Remove one batch's memory rows and domain rows (the eviction helper). */
const Drop = (State: State, BatchId: string): void => {
	for (const Key of [...State.Entries.keys()]) {
		if (Key.startsWith(`${BatchId}:`)) {
			State.Entries.delete(Key);
		}
	}
	State.Batches.delete(BatchId);
	try {
		const Handle = State.Handle;
		if (Handle !== undefined) {
			for (const Key of [...Handle.table("entries").entries()].map(([K]) => K)) {
				if (Key.startsWith(`${BatchId}:`)) {
					Handle.table("entries")
						.delete(Key)
						.catch(() => {
							/* eviction best-effort */
						});
				}
			}
			Handle.table("batches")
				.delete(BatchId)
				.catch(() => {
					/* eviction best-effort */
				});
		}
	} catch {
		/* storage optional */
	}
};
