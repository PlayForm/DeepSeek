export default interface PolicyRule {
    /** The proposal kind the rule applies to ("*" = any kind). */
    kind: string;
    /** The forced outcome: "allow" | "deny" | "escalate". */
    decision: "allow" | "deny" | "escalate";
    /** Optional restriction to one operation identifier prefix. */
    operation?: string | undefined;
}
