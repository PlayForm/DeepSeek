// Reply - the operation's reply union (Interface/Reply). THE REPLY IS PART OF
// THE TYPE (the situated interaction protocols, INVERSE-REPRESENTATION.md):
// every reflective operation returns this CommitReply union, derived from the
// edit lifecycle (`observed -> represented -> proposed -> approved ->
// applying -> verified | recovery-required | conflict | denied`), never a
// bare boolean or a thrown error. One reply, one honest outcome:
//
//   applied           - the transformation was written (the new version
//                       travels with the reply);
//   conflict          - the version fence failed: the file moved under the
//                       operation (expected and observed versions reported);
//   denied            - the plugin is disabled (the IDLE-forever cold mount);
//   rejected          - the operation was refused before any write (a
//                       malformed request, an oversized file or span, no
//                       matches);
//   recovery-required - the write outcome could not be confirmed;
//   outcome-unknown   - the write failed in a way that is neither a version
//                       conflict nor a confirmed failure.
export default interface Reply {
	status:
		"applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
	/** The human-readable detail (the reason for every non-applied status). */
	detail: string;
	/** The file version AFTER an applied write (the outcome's version). */
	version: string | undefined;
}
