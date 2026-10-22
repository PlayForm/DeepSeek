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
