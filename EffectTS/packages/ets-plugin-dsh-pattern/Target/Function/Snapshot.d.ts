import type Snapshot from "../Interface/Snapshot.js";
/**
 * @module Snapshot
 *
 * The best-effort JSON persistence: the DEGRADED FALLBACK store.
 *
 * @remarks
 *
 * Function/Snapshot. The PRIMARY store is the storage-domain KV domain
 * (Function/Open, the config `domain`); this file is written and read ONLY
 * when the harness provides no storage facility (or its open fails) - the
 * documented fallback, never the primary. The local store under ~/.dsh
 * (PATTERN-GRAPH-PLUGIN.md open decision 2): the memory is local, never the
 * repo; the schema is versioned; a stale or unreadable file is a silent miss
 * (the registry keeps the cold-start catalog) - persistence failure must
 * never reach any caller path.
 */
/**
 * Expand a leading ~ to the user's home directory.
 *
 * @remarks
 *
 * The remainder after the tilde is joined (not resolved) so it stays RELATIVE
 * to the home - the `/.dsh/...` remainder is absolute and `resolve` would
 * discard the home.
 */
export declare const Expand: (Path: string) => string;
/**
 * Write the snapshot; never throws.
 */
export declare const Save: (Path: string, Snapshot_: Snapshot) => Promise<void>;
/**
 * Read the snapshot; null on any failure or version mismatch.
 */
export declare const Load: (Path: string) => Promise<Snapshot | null>;
