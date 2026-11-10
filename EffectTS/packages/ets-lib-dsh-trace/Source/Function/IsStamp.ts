import type Stamp from "@Interface/Stamp.js";

/**
 * @module IsStamp
 *
 * Guards the `observe/stamp` payload: a non-empty path, a version and an
 * origin, all strings.
 *
 * @remarks
 *
 * The graph's adapter accepts only a guarded stamp - a malformed payload is
 * ignored (never guessed into a re-index).
 */
export default (Value: unknown): Value is Stamp => {
	if (Value === null || typeof Value !== "object") {
		return false;
	}
	const Candidate = Value as Partial<Stamp>;
	switch (true) {
		case typeof Candidate.path !== "string" || Candidate.path.length === 0:
			return false;
		case typeof Candidate.version !== "string":
			return false;
		case typeof Candidate.origin !== "string":
			return false;
		default:
			return true;
	}
};
