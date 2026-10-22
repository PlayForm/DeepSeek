// Pattern - one entry in the pattern registry (PATTERN-GRAPH-PLUGIN.md
// section 2, the behavior graph). A pattern is a parameterized subgraph of
// the five node kinds bound to one intent label; this interface keeps the
// v1 serializable projection: plain strings, globs and numbers, so a
// pattern can come from the static catalog, from a host pack, or later from
// the learner's mining output without a schema change.
//
// The confidence lives here (0..1, initialized 0.5): the store owns it, the
// matcher consumes it, Record/Decay move it. allowlist is the decision
// hook's hint (PASS-ON-AND-INGESTER.md section 7: "the decision's allowlist
// is a pattern property") - an allowlisted intent class is eligible for the
// batch-decision auto-approve policy, never auto-approved by itself.
export default interface Pattern {
	/** Stable registry id, e.g. "version-bump". */
	id: string;
	/** The intent label the pattern resolves, e.g. "version-bump", "search". */
	intent: string;
	/** The trigger signals that identify the intent (the `matches` edges). */
	trigger: {
		/** The tool name whose call triggers this pattern, when known. */
		tool?: string | undefined;
		/** Keywords matched against the live context text (case-insensitive). */
		keywords: string[];
	};
	/** The target subgraph as glob patterns over the file graph (`targets`). */
	targets: string[];
	/** The ordered transform steps, descriptions only - never executed here. */
	transform: string[];
	/** The arbiter: the verification this behavior is subject to. */
	arbiter: string;
	/** The confidence in 0..1; the matcher ranks by it, Decay/Record move it. */
	confidence: number;
	/** The decision hook's auto-approve eligibility hint (default false). */
	allowlist: boolean;
	/** Last write time (Record/Decay/Put), epoch ms. */
	updatedAt: number;
}
