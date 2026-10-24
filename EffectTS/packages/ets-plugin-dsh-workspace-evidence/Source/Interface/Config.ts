// Config - the shape the schema (Variable/Config) produces, after the loader
// validates and defaults it. Every field is a volatile cell (the values may
// arrive as `{ get }` references; the factory's State builder unwraps and
// hot-refreshes them in place).
import type { Allowlist } from "@playform/ets-plugin-dsh-factory";

export default interface Config {
	/** The durable ledger file (one log per module). */
	logFile: string;
	/** Ledger enabled - write the durable log file. */
	log: boolean;
	/** The master switch - the IDLE-forever posture: false by default. */
	enabled: boolean;
	/** The KV domain name. */
	domain: string;
	/** The maximum number of validation objects kept. */
	maxValidations: number;
	/** The excluded path patterns (an fs/observed event for a matched path
	 *  triggers no invalidation). */
	exclude: string[];
	/** The per-action allowlist (D6) - the shared factory block. This
	 *  package's actions are read-only and record (automatic); it has NO
	 *  gated action, so the block documents the posture without refusing
	 *  anything. A resolved pack's `policy` section overrides it per action. */
	policy: Allowlist;
}
