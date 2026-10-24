export default interface Proposal {
    /** Stable, content-derived id. */
    id: string;
    /** The resolved targets: path, version, why. */
    targets: import("./Target.js").default[];
    /** The deterministic transforms per target. */
    operations: import("./Operation.js").default[];
    /** When the proposal expires (epoch ms). */
    expiresAt: number;
    /** The agent whose inbox carried the proposal (the outcome's session);
     *  absent when the producer could not resolve one. */
    origin?: string | undefined;
}
