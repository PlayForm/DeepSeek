// Config - the validated shape the Schemastery schema (Variable/Config.ts)
// produces for the operate hook: every field is volatile (the factory's
// State builder refreshes these in place on a hot edit). The contract is
// Documentation/Plans/Workspace-Family/OPERATE.md.
import type { Allowlist } from "@playform/ets-plugin-dsh-factory";

export default interface Config {
	/** The IDLE-forever switch: false means disabled, wired to nothing. */
	enabled: boolean;
	/** The hook's own KV domain name (NOT the shared package_governance one). */
	domain: string;
	/** The maximum number of live proposals (the oldest withdrawn is not
	 *  enforced; a proposal is refused when the table is full). */
	maxProposals: number;
	/** The default limit for list results. */
	limitDefault: number;
	/** The hard cap for any list limit. */
	limitMaximum: number;
	/** The hook's own ledger file (one log per module). */
	logFile: string;
	/** The per-action allowlist (D6) - the shared factory block. This
	 *  package's action class is SUGGEST (automatic); it has NO gated action,
	 *  so the block documents the posture without refusing anything. A
	 *  resolved pack's `policy` section overrides it per action. */
	policy: Allowlist;
}
