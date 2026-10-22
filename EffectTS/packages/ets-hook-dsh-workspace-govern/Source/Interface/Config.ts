// Config - the shape the schema (Variable/Config) produces, after the loader
// validates and defaults it. Every field is a volatile cell (the values may
// arrive as `{ get }` references; the factory's State builder unwraps and
// hot-refreshes them in place).
export default interface Config {
	/** The durable ledger file (one log per module). */
	logFile: string;
	/** Ledger enabled - write the durable log file. */
	log: boolean;
	/** The master switch - the IDLE-forever posture: false by default. */
	enabled: boolean;
	/** The tool names whose calls the gate evaluates. */
	tools: string[];
	/** The authorized-scope allowlist (globs; empty = unrestricted). */
	scope: string[];
	/** The excluded target globs - never gated. */
	exclude: string[];
	/** The policy table (rules per proposal kind). */
	policy: import("@Interface/Policy.js").default[];
	/** The recovery-table overrides (per-obligation failure behavior). */
	recovery: import("@Interface/Recovery.js").default[];
	/** The loop bound: an operation identifier gated more than this many
	 *  times is dropped (recursion prevention). */
	loopBound: number;
	/** The decision ring bound. */
	maxDecisions: number;
}
