import type Snapshot from "@Interface/Snapshot.js";
/** Expand a leading ~ to the user's home directory. The remainder after the
 *  tilde is joined (not resolved) so it stays RELATIVE to the home - the
 *  `/.dsh/...` remainder is absolute and `resolve` would discard the home. */
export declare const Expand: (Path: string) => string;
/** Write the snapshot; never throws. */
export declare const Save: (Path: string, Snapshot_: Snapshot) => Promise<void>;
/** Read the snapshot; null on any failure or version mismatch. */
export declare const Load: (Path: string) => Promise<Snapshot | null>;
