// Query - the read paths (Function/Query): one batch, the open batches, one
// batch's entries, and the statistics triple. Pure reads over the
// in-memory maps; the domain persistence is never touched.
import type BatchRecord from "@Interface/Batch.js";
import type EntryRecord from "@Interface/Entry.js";
import type State from "@Interface/State.js";

/** One batch by ID, or undefined. */
export const Batch = (State: State, BatchId: string): BatchRecord | undefined =>
	State.Batches.get(BatchId);

/** All batch records (ring order, oldest first). */
export const Batches = (State: State): BatchRecord[] =>
	State.Ring.map((Id) => State.Batches.get(Id)).filter(
		(Batch): Batch is BatchRecord => Batch !== undefined,
	);

/** One batch's entries (the revert data), file order. */
export const Entries = (State: State, BatchId: string): EntryRecord[] =>
	State.Batches.get(BatchId)
		?.files.map((Path) => State.Entries.get(`${BatchId}:${Path}`))
		.filter((Entry): Entry is EntryRecord => Entry !== undefined) ?? [];

/** The statistics triple. */
export const Statistics = (
	State: State,
): {
	batches: number;
	entries: number;
	applying: number;
} => ({
	batches: State.Batches.size,
	entries: State.Entries.size,
	applying: [...State.Batches.values()].filter((Batch) => Batch.state === "applying").length,
});
