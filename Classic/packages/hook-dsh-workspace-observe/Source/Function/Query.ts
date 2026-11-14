import type Stamp from "@Interface/Stamp.js";
import type State from "@Interface/State.js";

/**
 * @module Query
 *
 * The read surface of the hook's state: the latest stamp per path, the ring
 * newest-first, and the statistics triple.
 *
 * @remarks
 *
 * Pure in-memory reads over State; never touches storage or the filesystem.
 */
/**
 * The latest stamp for one path, or undefined.
 */
export const Latest = (State: State, Path: string): Stamp | undefined => State.Latest.get(Path);

/**
 * The ring, NEWEST first; an optional limit slices the head.
 */
export const Ring = (State: State, Limit: number | undefined): Stamp[] => {
	const Newest = [...State.Ring].reverse();
	switch (true) {
		case typeof Limit === "number" && Number.isFinite(Limit) && Limit >= 0:
			return Newest.slice(0, Limit);
		default:
			return Newest;
	}
};

/**
 * The statistics triple: distinct paths, ring depth, the current sequence.
 */
export const Statistics = (
	State: State,
): {
	paths: number;
	stamps: number;
	sequence: number;
} => ({
	paths: State.Latest.size,
	stamps: State.Ring.length,
	sequence: State.Sequence.Value,
});
