// Target - one target of a proposal. The same shape the pass-on declares
// (the PO C self-containment rule: each package declares the batch contract
// in its own Interface; the end-phase unifies the imports).
export default interface Target {
	/** Absolute path of the target file. */
	path: string;
	/** The version token: the sha256 of the file's content at prepare time
	 *  (the fence checked before applying). */
	version: string;
	/** Why the target is in the batch. */
	why: string;
}
