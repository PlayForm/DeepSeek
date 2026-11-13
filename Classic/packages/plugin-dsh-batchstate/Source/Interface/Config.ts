import type { Allowlist } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The shape the schema (Variable/Config) produces, after the loader validates and defaults it.
 *
 * @remarks
 *
 * Every field is a volatile cell (the values may arrive as `{ get }` references; the factory's
 * State builder unwraps and hot-refreshes them in place).
 */
export default interface Config {
	/**
	 * The master switch - the LIVE DISABLED posture: every surface registers
	 * on every mount and reads this volatile cell at call time; false writes
	 * only the `disabled (enabled=false)` ledger line at mount.
	 */
	enabled: boolean;

	/**
	 * The durable ledger toggle (the factory's shared cell).
	 */
	log: boolean;

	/**
	 * The durable ledger file (one log per module).
	 */
	logFile: string;

	/**
	 * The batch key (multi-batch isolation).
	 */
	batch: string;

	/**
	 * The KV domain name - the PRIMARY store.
	 */
	domain: string;

	/** The well-known JSON state file - the FALLBACK store, engaged only when the storage facility
	 * is absent (or its open fails). */
	stateFile: string;

	/**
	 * The completions ring bound.
	 */
	maxRecent: number;

	/**
	 * The spliced-proposal ring bound (the board's inbox memory).
	 */
	maxProposals: number;

	/** The per-action allowlist (D6): the shared factory block. The board records and projects -
	 * `read`/`record`/`suggest` are automatic; the write/commit/spawn verdicts stay the shipped
	 * `approve`. A resolved pack's `policy` section overrides it per action. */
	policy: Allowlist;
}
