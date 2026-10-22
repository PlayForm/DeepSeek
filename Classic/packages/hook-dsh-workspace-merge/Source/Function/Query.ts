// Query - the read side of the merge hook (Function/Query): one batch
// record, all batch records (newest last), and the honest statistics.
import type Record from "@Interface/Record.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";

export const One = (State: State, Id: string): Record | undefined => State.Batches.get(Id);

export const All = (State: State): Record[] => [...State.Batches.values()];

export const Statistics = (State: State): Statistics => {
	const Counts = { applied: 0, conflicts: 0, rejected: 0, recovery: 0 };
	for (const Entry of State.Batches.values()) {
		for (const Reply of Entry.replies) {
			switch (Reply.status) {
				case "applied":
					Counts.applied += 1;
					break;
				case "conflict":
					Counts.conflicts += 1;
					break;
				case "rejected":
					Counts.rejected += 1;
					break;
				case "recovery-required":
					Counts.recovery += 1;
					break;
				default:
			}
		}
	}
	return {
		batches: State.Batches.size,
		applied: Counts.applied,
		conflicts: Counts.conflicts,
		rejected: Counts.rejected,
		recovery: Counts.recovery,
		sequence: State.Sequence,
	};
};
