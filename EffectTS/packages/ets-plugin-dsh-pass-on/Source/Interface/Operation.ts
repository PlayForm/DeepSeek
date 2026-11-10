/**
 * @module Operation
 *
 * One deterministic transform of a proposal: declarative, never executed by
 * the pass-on.
 *
 * @remarks
 *
 * Plan section 3. The ingester applies it only after the decision.
 */
export default interface Operation {
	/**
	 * Absolute path of the target file.
	 */
	path: string;

	/**
	 * The literal text to replace.
	 */
	find: string;

	/**
	 * The literal replacement text.
	 */
	replace: string;

	/**
	 * Why the operation exists (the kind's reason).
	 */
	why: string;
}
