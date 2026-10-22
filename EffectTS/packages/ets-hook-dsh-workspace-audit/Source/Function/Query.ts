// Query - the read paths (Function/Query): one operation's chain, the ring,
// and the statistics triple. Pure reads over the in-memory structures.
import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";

/** One operation's audit chain, in recording order. */
export const Chain = (State: State, Operation: string): Line[] => State.Chains.get(Operation) ?? [];

/** The ring, newest first (an optional limit slices the head). */
export const Lines = (State: State, Limit?: number): Line[] => {
	const All = [...State.Ring].reverse();
	return Limit === undefined ? All : All.slice(0, Limit);
};

/** The statistics triple. */
export const Statistics = (
	State: State,
): {
	operations: number;
	lines: number;
	sequence: number;
} => ({
	operations: State.Chains.size,
	lines: State.Ring.length,
	sequence: State.Sequence,
});
