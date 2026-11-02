import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
/** What one revert produced. */
export interface Reverted {
    /** Whether every file the row named was put back. */
    readonly ok: boolean;
    /** `reverted` is the only success; the rest name why nothing was put back. */
    readonly outcome: "reverted" | "missing" | "blob-missing" | "stale" | "staging-retained" | "failed";
    /** How many files were written from their blob. */
    readonly restored: number;
    /** How many files were deliberately left in place. */
    readonly retained: number;
    /** One clause of detail: the missing blob, the stale path, the safety failure. */
    readonly detail?: string;
}
export default _default;
/**
 * Put one ledger row's files back. Fails closed on a missing blob or a failed
 * safety capture, and reports rather than throws on everything else.
 */
declare function _default(Identifier: string, Seam_: Seam, Configuration_: Configuration): Promise<Reverted>;
