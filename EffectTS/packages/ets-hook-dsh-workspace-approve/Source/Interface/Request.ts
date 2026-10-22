// Request - the merge/execute side's check request (Interface/Request): the
// exact change set being executed. The check (Function/Check) answers one
// question about it: does an APPROVED binding cover THIS EXACT candidate?
export default interface Request {
	/** The path the change set touches. */
	path: string;
	/** The content fingerprint of the change set being executed. */
	fingerprint: string;
	/** The file version observed right now. */
	version: string;
}
