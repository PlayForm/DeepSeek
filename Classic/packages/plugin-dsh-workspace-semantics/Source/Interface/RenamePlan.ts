// RenamePlan - the proposed rename edits (NOT an applied write): the adapter
// computes the edits from its reference list plus its own symbol resolution
// (the V4-1 harness map: "the rename engine computes its edits from
// findReferences plus its own symbol resolution"). The plan goes to the
// operate proposals; this service never writes a file.
import type Span from "@Interface/Span.js";

export default interface RenamePlan {
	/** The path the plan is for. */
	path: string;
	/** The qualified name being renamed. */
	from: string;
	/** The new name. */
	to: string;
	/** The half-open ranges to rewrite, one per use site. */
	edits: Span[];
	/** The adapter's declared certainty (the refusal-to-guess rule: an
	 *  adapter that cannot be certain refuses instead of guessing). */
	certainty: "references" | "exact";
}
