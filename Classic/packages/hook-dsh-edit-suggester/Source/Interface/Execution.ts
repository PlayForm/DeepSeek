// Execution - the edit suggester's domain types: the CONVENTION pack (the
// modification families and their standard companion sets), the detection,
// the scored companions, and the gate's verdict.
//
// One family = one pack row:
//   id        - the modification family;
//   priority  - lower wins when two families match one edit;
//   threshold - the family's own gate (destructive: 0.85, the rest 0.75);
//   signals   - the path rules: a compiled regex on the edited path and the
//               evidence weight each match contributes;
//   targets   - the standard companion set: a path or glob, a prior, and the
//               one reason phrase the model reads.
export interface Signal {
	/** The rule id this row implements. */
	rule: string;
	/** The regex source, matched against the edited path. */
	pattern: string;
	/** The evidence weight a match contributes. */
	weight: number;
}

export interface Target {
	/** The companion path or glob. */
	path: string;
	/** The companion kind ("manifest", "doc", "config", "test", ...). */
	kind: string;
	/** The prior: 1.0 canonical, 0.6 family, 0.3 fallback. */
	prior: number;
	/** The one reason phrase the model reads. */
	reason: string;
}

export interface Family {
	/** The family id. */
	id: string;
	/** Lower wins when two families match one edit. */
	priority: number;
	/** The family's own gate (destructive: 0.85). */
	threshold: number;
	/** The path rules. */
	signals: Signal[];
	/** The standard companion set. */
	targets: Target[];
}

/** One edited call, reduced to the path and the tool. */
export interface EditView {
	/** The tool name. */
	name: string;
	/** The edited path. */
	path: string;
}

/** One detection: the winning family and the evidence sum. */
export interface Detection {
	/** The winning family. */
	family: Family;
	/** The sum of matched signal weights. */
	evidence: number;
}

/** One scored companion. */
export interface Candidate {
	/** The companion path or glob. */
	path: string;
	/** The companion kind. */
	kind: string;
	/** The one reason phrase. */
	reason: string;
	/** The companion score. */
	score: number;
}

/** The gate's verdict. */
export interface Verdict {
	/** "emit" passes every gate; "suppress" is a cooled/deduped/capped would-be note; "abstain" is below threshold, ambiguous, or fully touched. */
	action: "emit" | "suppress" | "abstain";
	/** The abstention/suppression reason (the ledger line's middle segment). */
	reason: string;
	/** The family's confidence kappa. */
	kappa: number;
	/** The ordered, capped companion list (emit only). */
	candidates: Candidate[];
}
