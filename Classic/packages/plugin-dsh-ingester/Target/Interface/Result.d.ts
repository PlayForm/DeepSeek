export default interface Result {
    /** The proposal id. */
    proposal: string;
    /** Per-target outcomes, in the proposal's order. */
    perTarget: {
        path: string;
        outcome: "applied" | "conflict" | "skipped" | "recovery-required";
        version?: string;
    }[];
    /** Counts. */
    applied: number;
    conflicts: number;
    recovery: number;
}
