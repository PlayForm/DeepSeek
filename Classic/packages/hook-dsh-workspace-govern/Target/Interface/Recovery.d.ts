export default interface RecoveryRule {
    /** The obligation the override applies to. */
    obligation: "contributes" | "scope" | "policy" | "preconditions";
    /** The failure behavior. */
    behavior: "fail-open" | "fail-closed";
}
