// PolicyRule - one rule of the gate's policy table (the plan's "a small
// table of rules per proposal kind, with defaults"): the kind matches the
// proposal kind exactly or "*", the decision is the gate outcome the rule
// forces. First matching rule wins; no match means the checks decide.
export default interface PolicyRule {
	/** The proposal kind the rule applies to ("*" = any kind). */
	kind: string;
	/** The forced outcome: "allow" | "deny" | "escalate". */
	decision: "allow" | "deny" | "escalate";
	/** Optional restriction to one operation identifier prefix. */
	operation?: string | undefined;
}
