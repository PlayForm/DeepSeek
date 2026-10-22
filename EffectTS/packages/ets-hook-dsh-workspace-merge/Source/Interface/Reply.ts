// Reply - the COMMIT REPLY UNION, per file (Interface/Reply). Derived from
// the v4.1 edit lifecycle (`verified | recovery-required | conflict |
// denied`), NOT a separate six-way enum; MERGE.md names the same union
// Applied / Conflict / Denied / Rejected / RecoveryRequired /
// OutcomeUnknown. The mapping is frozen:
//
//   applied            - the write landed and the read-back matched the
//                        intended content;
//   conflict           - a replaceIfVersion failure or a verification
//                        mismatch (reported with expected and observed
//                        versions);
//   denied             - the sandbox/policy layer refused the write;
//   rejected           - an atomic gate failed (batch-level in
//                        all-or-nothing mode, per-file in survivors);
//   recovery-required  - the batch was interrupted before this file was
//                        attempted (the journal domain completes or
//                        compensates later);
//   outcome-unknown    - the write's outcome could not be determined
//                        (reported with the reason; never guessed).
export default interface Reply {
	/** The file the reply is about. */
	path: string;
	/** The reply status (see the header). */
	status:
		"applied" | "conflict" | "denied" | "rejected" | "recovery-required" | "outcome-unknown";
	/** The fresh version after an applied write. */
	version?: string;
	/** The fence the operation carried (conflict reporting). */
	expected?: string;
	/** The version actually observed (conflict reporting). */
	observed?: string;
	/** The reason for denied/rejected/outcome-unknown. */
	reason?: string;
}
