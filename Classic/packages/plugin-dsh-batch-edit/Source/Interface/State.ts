// State - the batch edit plugin's per-apply state: the factory's shared
// shape (Function/State builds it: cell unwrap + the shared fields + the P10
// volatile refresh) plus the plugin's own fields. The volatile schema knobs
// ride the factory's loader/volatile-update listener and are refreshed IN
// PLACE, so a flip (enabled, deadlineMs, strictMode, ...) lands on the next
// tool call without a remount.
import type { Allowlist } from "@playform/plugin-dsh-factory";

import type FactoryService from "./Factory.js";
import type { FactoryState } from "./Factory.js";
import type { MachineRecord } from "./Process.js";

export default interface State extends FactoryState {
	/** The enable flip (config `enabled`; the IDLE-forever posture). */
	On: boolean;
	/** Maximum open machines per agent (config `machinesPerAgent`). */
	MachinesPerAgent: number;
	/** Maximum op lines per commit (config `opsPerCommit`). */
	OpsPerCommit: number;
	/** The commit's in-line deadline, capped at 120000 (config `deadlineMs`). */
	Deadline: number;
	/** Search-not-found errors vs skips (config `strictMode`). */
	Strict: boolean;
	/** The advisory bash intercept (config `interceptBash`; off in v1). */
	Intercept: boolean;
	/** The per-file check-set names (config `monitorChecksets`). */
	Checksets: string[];
	/** The per-action allowlist (config `policy`, volatile) - the D6 OUTER
	 *  gate in front of an apply. Named `Allow` because the factory's shared
	 *  State already owns `Policy` (the configured global policy file path);
	 *  `write` defaults to `approve`, so a commit refuses until the user
	 *  approves. */
	Allow: Allowlist;
	/** The machine registry, keyed on the agent id (the planted-board lease
	 *  semantics: machines are per-agent; machinesPerAgent caps each map). */
	Machines: Map<string, Map<string, MachineRecord>>;
	/** The machine id counter (`mach-<n>`; deterministic, never a clock). */
	Counter: number;
	/** The injected factory service (the write executor and the ledger). */
	Factory: FactoryService;
}
