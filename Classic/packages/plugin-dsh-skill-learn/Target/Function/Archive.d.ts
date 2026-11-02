import type { Touched } from "./Ledger.js";
import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
/** What one archive produced. */
export interface Archived {
    /** Whether the copy landed and the live file was neutralized. */
    readonly ok: boolean;
    /** `archived` is the only success; the rest name why nothing was archived. */
    readonly outcome: "archived" | "absent" | "foreign-root" | "failed";
    /** The archive directory the copy landed in, or "" when nothing was copied. */
    readonly path: string;
    /** The live package as it was, for the ledger row's before side. */
    readonly before: readonly Touched[];
    /** The archive copy as it is, for the ledger row's after side. */
    readonly after: readonly Touched[];
    /** One clause of detail when the outcome is not `archived`. */
    readonly detail?: string;
}
/** What one restore produced. */
export interface Restored {
    /** Whether the live file was written back. */
    readonly ok: boolean;
    /** `restored` is the only success; the rest name why nothing was written. */
    readonly outcome: "restored" | "not-archived" | "destination-exists" | "foreign-root" | "failed";
    /** The live path that was written, or "" when nothing was written. */
    readonly path: string;
    /** One clause of detail when the outcome is not `restored`. */
    readonly detail?: string;
}
export default _default;
/**
 * Copy one skill package into the archive and neutralize the live `SKILL.md`.
 * The worst outcome any pass in this plugin may produce, and it removes nothing.
 */
declare function _default(Name: string, Seam_: Seam, Configuration_: Configuration): Promise<Archived>;
/**
 * Write one archived skill back to its live path and drop the neutralization
 * line. The live package never moved, so the destination always exists: the
 * guarded write replaces the neutralized copy and the archive keeps the bytes.
 */
export declare const Restore: (Name: string, Seam_: Seam, Configuration_: Configuration) => Promise<Restored>;
