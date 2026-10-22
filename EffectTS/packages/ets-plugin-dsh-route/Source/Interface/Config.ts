// Config - the shape the Variable/Config.ts schema produces (the validated,
// defaulted config object apply receives). Every field is a volatile cell:
// a hot edit commits without remounting and the factory's P10 refresh
// updates the State fields in place.

import type { KeywordTable, PolicyShape, Role } from "./Policy.js";

export default interface Config {
	/** Master switch. Shipped false (the IDLE-forever posture). */
	enabled: boolean;
	/** The durable ledger toggle (the factory's shared field). */
	log: boolean;
	/** The plugin's own ledger file (one log per module). */
	logFile: string;
	/** The role used when NEITHER a declared task type NOR a keyword match
	 * exists (the omission's default; the cheap lane is the safe default). */
	defaultRole: Role;
	/** The user's policy (the law the plugin enforces; never written by the
	 * plugin). */
	policy: PolicyShape;
	/** The keyword table for the task-type inference (merged over the shipped
	 * Variable/Keywords table). */
	keywords: KeywordTable;
}
