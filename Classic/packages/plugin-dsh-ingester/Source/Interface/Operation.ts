// Operation - one deterministic transform of a proposal. The same shape the
// pass-on declares.
export default interface Operation {
	/** Absolute path of the target file. */
	path: string;
	/** The literal text to replace. */
	find: string;
	/** The literal replacement text. */
	replace: string;
	/** Why the operation exists. */
	why: string;
}
