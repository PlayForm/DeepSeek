export default interface Policy {
    /** The per-action allowlist (action -> "auto" | "approve"). */
    [Action: string]: "auto" | "approve" | undefined;
}
