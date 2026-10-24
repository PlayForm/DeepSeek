// Plan - the slice of the semantics service's rename plan the reflect reads
// (Interface/Plan): the identifier being renamed, the new name, and the
// half-open character ranges to rewrite. The reflect filters the edits to the
// operation's scope and applies them itself; the service never writes a file.
import type Span from "@Interface/Span.js";

export default interface Plan {
	/** The identifier the plan renames. */
	from: string;
	/** The new name. */
	to: string;
	/** The half-open character ranges to rewrite. */
	edits: Span[];
}
