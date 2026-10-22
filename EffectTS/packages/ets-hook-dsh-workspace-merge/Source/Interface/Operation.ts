// Operation - one per-file entry of a batch (Interface/Operation): the
// final content to write and the version fence it was prepared against.
// A fence is MANDATORY - the merge never issues an unconditional write
// (the refusal-to-guess carried into the commit step).
export default interface Operation {
	/** The file to write (resolved through ctx.fs against the session
	 *  working directory). */
	path: string;
	/** The final content of the whole file (the merge writes whole files
	 *  through the factory's Write executor; span editing is the replace
	 *  proposal's job, applied upstream). */
	content: string;
	/** The expected version (the fence). */
	version: string;
}
