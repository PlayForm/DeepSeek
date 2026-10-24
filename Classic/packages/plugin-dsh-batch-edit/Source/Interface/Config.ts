// Config - the shape Variable/Config.ts's Schemastery schema produces; every
// field is a volatile cell (hot-editable without remounting, the factory's
// P10 refresh re-reads the mapped State fields in place).
import type { Allowlist } from "@playform/plugin-dsh-factory";

export default interface Config {
	/** The IDLE-forever posture: the plugin ships disabled and enables only
	 *  by an explicit ACTIVATE. */
	enabled: boolean;
	/** The ledger file (one log per module, the family strings contract). */
	logFile: string;
	/** Maximum open machines per agent (the planted-board capacity rule). */
	machinesPerAgent: number;
	/** Maximum op lines per commit (the tool-schema escape hatch pushes the
	 *  overflow to the opfile path). */
	opsPerCommit: number;
	/** The commit's in-line deadline, capped at 120000 (the composition
	 *  contract: the overflow continues as a background job). */
	deadlineMs: number;
	/** Search-not-found errors (true) vs skips (false) at commit. */
	strictMode: boolean;
	/** The advisory bash intercept (off by default in v1 - the control
	 *  layer comes later as its own plugin). */
	interceptBash: boolean;
	/** Per-file check-set names (the live containers' monitor vocabulary,
	 *  reused; v1 records the names on the machine, the runner is later). */
	monitorChecksets: string[];
	/** The per-action allowlist (D6): the OUTER gate in front of an apply.
	 *  The shared factory block - `write` defaults to `approve`, so a commit
	 *  refuses until the user opens the gate. A resolved pack's `policy`
	 *  section overrides it per action. */
	policy: Allowlist;
}
