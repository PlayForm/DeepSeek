// KindSpec - one configured intent kind: which files the kind targets by
// default, and which param carries its argument.
export default interface KindSpec {
	/** Default target globs (relative to the root), used when the intent
	 *  carries no explicit targets. */
	globs: string[];
	/** The param key the kind reads (informational; the apply logic in
	 *  Function/Operate switches on the kind name). */
	param?: string;
}
