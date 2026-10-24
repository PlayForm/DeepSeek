// Config - the shape the schema (Variable/Config) produces, after the loader
// validates and defaults it. Every field is a volatile cell (the values may
// arrive as `{ get }` references; the factory's State builder unwraps and
// hot-refreshes them in place).
import type { Allowlist } from "@playform/plugin-dsh-factory";

export default interface Config {
	/** The durable ledger file (one log per module). */
	logFile: string;
	/** Ledger enabled - write the durable log file. */
	log: boolean;
	/** The master switch - the IDLE-forever posture: false by default. */
	enabled: boolean;
	/** The deny-list: the git subcommands that are always refused
	 *  (replaces the default list when set). */
	denyPatterns: string[];
	/** The allow-list: the git subcommands that pass even when deny-listed
	 *  (the read-only checks + fetch). */
	allowPatterns: string[];
	/** Strict mode: deny EVERY git command (not just the deny-list). */
	strict: boolean;
	/** The paths the guard ignores (the factory's segment match). */
	exclude: string[];
	/** The per-action allowlist (D6): the shared factory block. The guard is
	 *  read-only, so its own classes are `read`/`record` (automatic); the
	 *  write/commit/spawn verdicts stay the shipped `approve`. A resolved
	 *  pack's `policy` section overrides it per action. */
	policy: Allowlist;
}
