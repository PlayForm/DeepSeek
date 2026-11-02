import { type Seam } from "./Write.js";
import type Configuration from "../Interface/Configuration.js";
import type { SnapshotManifest } from "../Interface/Snapshot.js";
/** What one capture produced. */
export interface Taken {
    /** The snapshot id, or "" when the capture failed. */
    readonly id: string;
    /** The manifest that was written, or null when the capture failed. */
    readonly manifest: SnapshotManifest | null;
    /** Why the capture failed, for the one log line. */
    readonly error?: string;
}
/** What one rotation did. */
export interface Rotated {
    /** The snapshot ids the rotation pruned. */
    readonly pruned: readonly string[];
    /** How many unreferenced blobs the sweep deleted. */
    readonly swept: number;
    /** Why the rotation stopped early, when it did. */
    readonly error?: string;
}
export default _default;
/**
 * Capture the whole corpus into one manifest. Best-effort except where a caller
 * makes it a precondition: a revert fails closed on this result, a curator pass
 * logs it and continues (SKILL-LEARN-PLUGIN.md:604-607).
 */
declare function _default(Reason: string, Seam_: Seam, Configuration_: Configuration): Promise<Taken>;
/**
 * Keep the newest `snapshotKeep` manifests, prune the rest except the protected
 * ones, and then delete every blob that no retained manifest and no retained
 * ledger row references. The manifest just written is always protected from its
 * own prune, because a same-second id reuse would otherwise sort below its
 * surviving sibling (curator_backup.py:188-190).
 */
export declare const Rotate: (Protect: readonly string[], Configuration_: Configuration) => Promise<Rotated>;
