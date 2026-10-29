// Proposal - the review's OUTPUT vocabulary and the judge's verdict.
//
// The reply is a strict JSON object with ONE key (`ops`), and every operation
// is one of five kinds. The set is closed on purpose: an open-ended "do
// whatever you think" reply is exactly what makes an unattended review
// untrustworthy, and a closed set is what lets the judge be deterministic.
//
//   create    - a NEW class-level skill directory with its SKILL.md
//   patch     - the COMPLETE new SKILL.md of an existing skill (fix in place)
//   support   - one support file under an existing skill (`references/`,
//               `templates/`, `scripts/`)
//   archive   - move an existing skill to the archive (consolidation uses
//               `absorbedInto` to name the umbrella that absorbed it)
//   agreement - a standing rule for the working agreement file. ALWAYS
//               pending: the service never writes the user's AGENTS.md.
export type Operation = "create" | "patch" | "support" | "archive" | "agreement";

/** One proposed operation. */
export interface Op {
	/** The operation kind. */
	op: Operation;
	/** The class-level skill name (kebab-case); for `agreement`, a stable label. */
	name: string;
	/** `support` only: the path under the skill (`references/<topic>.md`). */
	file?: string;
	/** The markdown to write (`create`/`patch`/`support`) or the rule text
	 *  (`agreement`). `archive` carries none. */
	body?: string;
	/** One clause naming WHY - the rule's reason, never a session narrative. */
	reason?: string;
	/** `archive` only: the umbrella skill that absorbed this one. */
	absorbedInto?: string;
}

/** The parsed reply. */
export interface Proposal {
	ops: Op[];
	/** The reviewer's own one-line note (`"Nothing to save."` included). */
	note?: string | undefined;
}

/** The judge's per-operation verdict. */
export interface Verdict {
	/** Operations that may be applied (or queued, per the policy). */
	accepted: Op[];
	/** Operations the rules refused, each with the rule id that refused it. */
	rejected: { op: Op; rule: string }[];
}
