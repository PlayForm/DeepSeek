import type { TruthKind } from "./TruthKind.js";
export default interface Validation {
    /** The caller's identifier for the claim (unique per service instance). */
    id: string;
    /** The truth kind being claimed. */
    kind: TruthKind;
    /** The subject the claim is about (a path, a symbol, a proposal id...). */
    subject: string;
    /** The verdict at declaration time - honest: the service records what
     *  the caller asserted, it does not invent a verdict. */
    verdict: "verified" | "unverified";
    /** The declared dependencies (file paths, index revisions, version
     *  tokens - opaque keys to this service). */
    dependencies: string[];
    /** The service's own monotonic sequence (never a wall clock). */
    sequence: number;
    /** The status: "fresh" at declaration, "stale" after a dependency
     *  changed, "superseded" after a revalidation replaced it. */
    status: "fresh" | "stale" | "superseded";
}
