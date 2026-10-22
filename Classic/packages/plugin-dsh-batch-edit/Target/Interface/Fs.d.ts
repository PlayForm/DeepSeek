/** A resolved write/read target: the display path for humans, the opaque
 *  key for the idempotence and version gates. */
export interface FsTarget {
    /** The human-facing absolute path (the fs backend's own display form). */
    displayPath: string;
    /** The opaque target key the backend derives from the path. */
    targetKey?: string;
    [key: string]: unknown;
}
/** One observed filesystem event's payload (fs/observed): a presence with
 *  the fresh version, an absence probe, or a removal. */
export interface FsObservation {
    kind: "present" | "absent" | "removed";
    version?: FsVersion;
}
/** A stat result: the backend's own version token at read time. */
export interface FsStat {
    version?: FsVersion;
}
/** The outcome of one writeText call through the factory's write executor. */
export interface FsWriteOutcome {
    path?: string;
    version: FsVersion;
}
/** Opaque version token (branded in the real dsh-fs; stored, never parsed). */
export type FsVersion = string;
/** Opaque target key (branded in the real dsh-fs; stored, never parsed). */
export type FsTargetKey = string;
