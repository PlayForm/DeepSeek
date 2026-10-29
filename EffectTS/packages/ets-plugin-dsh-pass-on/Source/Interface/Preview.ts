// Preview - the bounded before/after of one target (plan section 3): the
// matched region, not the whole files.
export default interface Preview {
	/** Absolute path of the target file. */
	path: string;
	/** The bounded before text (the matched lines). */
	before: string;
	/** The bounded after text (the same lines, transformed). */
	after: string;
}
