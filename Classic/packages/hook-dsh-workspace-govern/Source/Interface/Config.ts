import type { Allowlist } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The shape the schema (`Variable/Config`) produces, after the loader validates
 * and defaults it.
 *
 * @remarks
 *
 * Every field is a volatile cell (the values may arrive as `{ get }`
 * references; the factory's State builder unwraps and hot-refreshes them in
 * place).
 */
export default interface Config {
	/**
	 * The master switch - the live disabled posture: false by default, and
	 * every surface stays registered while disabled (the call-time checks).
	 */
	enabled: boolean;

	/**
	 * Ledger enabled - write the durable log file.
	 */
	log: boolean;

	/**
	 * The durable ledger file (one log per module).
	 */
	logFile: string;

	/**
	 * The tool names whose calls the gate evaluates.
	 */
	tools: string[];

	/**
	 * The authorized-scope allowlist (globs; empty = unrestricted).
	 */
	scope: string[];

	/**
	 * The excluded target globs - never gated.
	 */
	exclude: string[];

	/**
	 * The policy table (rules per proposal kind).
	 */
	policy: import("@Interface/Policy.js").default[];

	/**
	 * The recovery-table overrides (per-obligation failure behavior).
	 */
	recovery: import("@Interface/Recovery.js").default[];

	/**
	 * The loop bound: an operation identifier gated more than this many times is
	 * dropped (recursion prevention).
	 */
	loopBound: number;

	/**
	 * The decision ring bound.
	 */
	maxDecisions: number;

	/**
	 * The per-action allowlist (D6) - the shared factory block. Keyed
	 * `automation`, not `policy`, because this hook's `policy` is already the
	 * decision rule table (the plugin-dsh-route precedent). This package's
	 * action class is RECORD (automatic); it has NO gated action, so the block
	 * documents the posture without refusing anything. A resolved pack's
	 * `policy` section overrides it per action.
	 */
	automation: Allowlist;
}
