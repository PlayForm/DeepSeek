import type { Allowlist } from "@playform/plugin-dsh-factory";

/**
 * @module Config
 *
 * The shape the schema (Variable/Config) produces, after the loader validates
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
	 * The deny-list: the git subcommands that are always refused (replaces
	 * the default list when set).
	 */
	denyPatterns: string[];

	/**
	 * The allow-list: the git subcommands that pass even when deny-listed
	 * (the read-only checks + fetch).
	 */
	allowPatterns: string[];

	/**
	 * Strict mode: deny EVERY git command (not just the deny-list).
	 */
	strict: boolean;

	/**
	 * The paths the guard ignores (the factory's segment match).
	 */
	exclude: string[];

	/**
	 * The per-action allowlist (D6): the shared factory block. The guard is
	 * read-only, so its own classes are `read`/`record` (automatic); the
	 * write/commit/spawn verdicts stay the shipped `approve`. A resolved
	 * pack's `policy` section overrides it per action.
	 */
	policy: Allowlist;
}
