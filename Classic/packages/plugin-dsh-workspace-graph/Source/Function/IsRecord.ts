// IsRecord - the stored-record shape guard (the brief's section 4.4): a
// stored value counts as a record only when version and fingerprint are
// strings and nodes and edges are arrays. A record that fails validation is
// skipped and counted, never guessed.
import type Record from "@Interface/Record.js";

export default (Value: unknown): Value is Record => {
	if (typeof Value !== "object" || Value === null) {
		return false;
	}
	const Candidate = Value as { [Key: string]: unknown };
	return (
		typeof Candidate["version"] === "string" &&
		typeof Candidate["fingerprint"] === "string" &&
		Array.isArray(Candidate["nodes"]) &&
		Array.isArray(Candidate["edges"])
	);
};
