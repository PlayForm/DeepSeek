// Query - one packet request (Interface/Query): the focus selector, the
// lens, the caller identity and the caller-held version (the staleness
// contract). All fields optional; the SCOPE section renders what was given.
export default interface Query {
	/** The node id to focus on (e.g. "Symbol:<path>:<name>"). */
	id?: string;
	/** A name query to resolve the focus from (when no id is given). */
	query?: string;
	/** The lens name (code | docs | tests); undefined = the default lens. */
	lens?: string;
	/** The caller identity (the focus tracker key). */
	caller?: string;
	/** The version the caller currently holds (the staleness comparison). */
	callerVersion?: string;
}
