// Config - the validated plugin-config shape for the lesson-review service
// (the schema that produces it lives in Variable/Config.ts). Every knob is a
// volatile cell in the schema; the service reads them through its Configure
// method, so a hot edit lands on the next call without a remount.
import type { Allowlist } from "@playform/plugin-dsh-factory";

export default interface Config {
	/** Master switch (default TRUE here, FALSE in the schema - see Knobs). */
	enabled: boolean;
	/** The service's own ledger file, one log per module. */
	logFile: string;
	/** The usage-store domain name (the KV domain is the planned PRIMARY; the
	 *  JSON sidecar below is what this mockup wires). */
	domain: string;
	/** The usage-store JSON sidecar - the store this package actually uses. */
	storagePath: string;
	/** Turns between reviews (`memory.nudge_interval` in the Hermes original). */
	intervalTurns: number;
	/** Only review from the true idle phase - never mid-turn. */
	idleOnly: boolean;
	/** Days without use before an entry is `stale`. */
	staleAfterDays: number;
	/** Days without use before an entry is `archived`. */
	archiveAfterDays: number;
	/** The zero-use grace floor: never archive an entry younger than this. */
	neverUsedGraceDays: number;
	/** Verbatim tail of the digest; older turns collapse to one summary. */
	digestTail: number;
	/** Hard cap on the digest + prompt characters sent to the review model. */
	maxInputChars: number;
	/** Cap on the operations one reply may carry. */
	maxProposals: number;
	/** The opt-in LLM consolidation pass (prune-only by default). */
	consolidate: boolean;
	/** Prompt override file; empty = the shipped prompt. */
	promptFile: string;
	/** The skill corpus root. */
	skillsRoot: string;
	/** Where archived entries move. */
	archiveRoot: string;
	/** The working agreement file (agreement proposals are always pending). */
	agreementPath: string;
	/** Per-run report root. */
	reportsRoot: string;
	/** The pending-proposal queue (one JSON record per line). */
	pendingPath: string;
	/** Review route; empty = the agent's own provider/model. */
	provider: string;
	model: string;
	/** The review reply's token ceiling. */
	maxTokens: number;
	/** The per-action allowlist (D6): the shared factory block. The service
	 *  READS the corpus and SUGGESTS lessons - `read`/`index`/`suggest` are
	 *  automatic; `write` stays the shipped `approve`, so a proposal lands in
	 *  the corpus only when it is accepted. A resolved pack's `policy` section
	 *  overrides it per action. */
	policy: Allowlist;
}
