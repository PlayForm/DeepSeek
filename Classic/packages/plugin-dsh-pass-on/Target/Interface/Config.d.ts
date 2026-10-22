import type KindSpec from "./KindSpec.js";
export default interface Config {
    enabled: boolean;
    /** The durable journal (one log per module). */
    logFile: string;
    /** The workspace root the globs resolve against. */
    root: string;
    /** Maximum targets in one proposal. */
    maxTargets: number;
    /** Maximum bytes of one preview entry. */
    maxPreviewBytes: number;
    /** Proposal lifetime in seconds. */
    expiresSeconds: number;
    /** The kind table: kind name -> spec. */
    kinds: Record<string, KindSpec>;
}
