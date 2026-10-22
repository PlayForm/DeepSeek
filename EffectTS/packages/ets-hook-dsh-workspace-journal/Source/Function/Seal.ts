// Seal - the batch close path (Function/Seal): move the batch record to its
// terminal state. "verified" closes a batch whose writes landed and were
// checked; "recovery-required" closes one where the seal of the writes
// never arrived (a crash between the commit and the journal is the logged
// failure mode of the inverse representation) or a check failed. Only a
// batch in the `applying` state can be sealed; sealing a terminal batch is
// refused with a ledger line, never silently ignored.
import Record from "@Function/Record.js";
import type State from "@Interface/State.js";

export default async (
	State: State,
	BatchId: string,
	Next: "verified" | "recovery-required",
	Reason = "",
): Promise<unknown> => {
	const Batch = State.Batches.get(BatchId);
	if (Batch === undefined) {
		State.Factory.Append(State, `seal failed ${BatchId} (unknown batch)`);
		throw new Error(`unknown batch: ${BatchId}`);
	}
	switch (Batch.state) {
		case "applying":
			break;
		default:
			State.Factory.Append(
				State,
				`seal failed ${BatchId} (state ${Batch.state}, not applying)`,
			);
			throw new Error(`batch ${BatchId} is ${Batch.state}, not applying`);
	}
	Batch.state = Next;
	Batch.reason = Reason;
	State.Factory.Append(
		State,
		Next === "verified"
			? `sealed ${BatchId} verified`
			: `sealed ${BatchId} recovery-required (${Reason})`,
	);
	await Record(State, Batch);
	return Batch;
};
