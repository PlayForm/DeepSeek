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
	/** The KV domain name. */
	domain: string;
	/** The bound-ring capacity. */
	maxBindings: number;
	/** Whether a bind without constraints is rejected. */
	requireConstraints: boolean;
}
