// Config - the shape the Variable/Config.ts schema produces (the validated,
// defaulted config object apply receives). Every field is a volatile cell:
// a hot edit commits without remounting and the factory's P10 refresh
// updates the State fields in place.
import type { Allowlist } from "@playform/plugin-dsh-factory";

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
	/** The user's ROUTING policy (the law the plugin enforces; never written
	 * by the plugin). Distinct from the D6 automation block below. */
	policy: PolicyShape;
	/** The keyword table for the task-type inference (merged over the shipped
	 * Variable/Keywords table). */
	keywords: KeywordTable;
	/** The per-action allowlist (D6): the shared factory block. Keyed
	 * `automation` because `policy` is the ROUTING policy. The router reads
	 * and suggests; the write/commit/spawn verdicts stay the shipped
	 * `approve`. A resolved pack's `policy` section overrides it per action. */
	automation: Allowlist;
}
