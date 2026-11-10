import type Entry from "../Interface/Entry.js";
import type Store from "../Interface/Store.js";
/**
 * @module Snapshot
 *
 * The JSON FALLBACK store (Function/Snapshot), the DEGRADED tier.
 *
 * @remarks
 *
 * The PRIMARY store is the storage-domain KV domain `replay_history`
 * (Function/Storage); this file is written and read ONLY when the harness
 * provides no storage facility (or its open fails) - the documented fallback,
 * never the primary.
 *
 * The read is SYNCHRONOUS because it runs once at apply, before the first
 * judged call (the boot path, the same posture as the seeded history store's
 * reader). The write is asynchronous and serialised on the store chain
 * (Function/Record), so the smokes' Flush seam is deterministic without a
 * sleep. A stale, unreadable or wrong-version file is a silent miss - the
 * store starts fresh, never a throw.
 */
/**
 * Read the fallback snapshot; null on any failure or version mismatch.
 */
export declare const Load: (Path: string) => Store | null;
/**
 * Write the fallback snapshot; never throws.
 */
export declare const Save: (Path: string, Entries: Entry[], Now: number) => Promise<void>;
