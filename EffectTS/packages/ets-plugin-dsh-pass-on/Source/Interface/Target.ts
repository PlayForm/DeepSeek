// Target - one resolved target of a proposal (plan section 3): the path, its
// version (the content snapshot token), and why it is in the batch.
export default interface Target {
	/** Absolute path of the target file. */
	path: string;
	/** The version token: the sha256 of the file's content at prepare time
	 *  (the fence the ingester checks before applying). */
	version: string;
	/** Why the target is in the batch (the kind's reason). */
	why: string;
}
