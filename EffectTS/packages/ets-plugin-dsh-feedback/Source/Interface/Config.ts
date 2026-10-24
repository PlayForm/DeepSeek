// Options - the schema's runtime shape (Variable/Config.ts produces it).
import type { Allowlist } from "@playform/ets-plugin-dsh-factory";

export default interface Options {
	enabled: boolean;
	logFile: string;
	maxBlockBytes: number;
	maxChain: number;
	maxSessions: number;
	summaryTerms: number;
	/** The per-session batch-outcome ring bound. */
	maxOutcomes: number;
	/** The per-action allowlist (D6): the shared factory block. The member is
	 *  a passive collector - `record`/`suggest` are automatic; the
	 *  write/commit/spawn verdicts stay the shipped `approve`. A resolved
	 *  pack's `policy` section overrides it per action. */
	policy: Allowlist;
}
