// Ledger - the read side of the store (Function/Ledger): the status check,
// the filtered list, and the statistics. Pure reads over the State map; no
// writes, no ledger lines (the append-side lines live in Declare and
// Invalidate). The "Ledger" name is the store ledger in the accounting
// sense - the recorded evidence, not the log file.
import type State from "@Interface/State.js";
import type Validation from "@Interface/Validation.js";

/** The current status of one validation object, or undefined. */
const Check = (State: State, Id: string): Validation["status"] | undefined =>
	State.Store.get(Id)?.status;

/** The objects, optionally filtered by status, oldest sequence first. */
const List = (State: State, Status?: Validation["status"]): Validation[] => {
	const All = [...State.Store.values()].sort((Left, Right) => Left.sequence - Right.sequence);
	return Status === undefined ? All : All.filter((Object) => Object.status === Status);
};

/** The statistics pentuple. */
const Statistics = (
	State: State,
): {
	validations: number;
	fresh: number;
	stale: number;
	superseded: number;
	sequence: number;
} => {
	const Counts = { fresh: 0, stale: 0, superseded: 0 };
	for (const Object of State.Store.values()) {
		Counts[Object.status] += 1;
	}
	return {
		validations: State.Store.size,
		...Counts,
		sequence: State.Sequence,
	};
};

export default { Check, List, Statistics };
