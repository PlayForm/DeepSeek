// Config - the validated plugin-config shape the loader hands to `apply`.
// The schema that produces it lives in Variable/Config.ts. Every cell is
// volatile; the factory's State builder unwraps them and refreshes them in
// place on loader/volatile.
export default interface Config {
	/** Master switch - the idle-forever posture: false is the default. */
	enabled: boolean;
	/** The hook's own workflow ledger file. */
	logFile: string;
	/** The auto-approve policy mode (conservative by default). */
	autoApprove: "off" | "on";
	/** The intent classes eligible for policy approval (the pattern's
	 *  `allowlist` property feeds this at runtime; this list seeds it). */
	allowlist: string[];
	/** Maximum target count the policy may auto-approve. */
	maxAutoTargets: number;
	/** Minimum intent confidence the policy may auto-approve. */
	minConfidence: number;
	/** How long a decided/expired proposal stays in the pending map. */
	pendingTtlMs: number;
}
