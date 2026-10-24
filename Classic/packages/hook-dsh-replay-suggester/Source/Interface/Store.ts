// Store - the JSON fallback's on-disk shape (Interface/Store.ts), version 1.
// The PRIMARY store is the storage-domain KV domain `replay_history`
// (Function/Storage); this file is the DEGRADED fallback, written and read
// ONLY when the harness provides no storage facility or its open fails (the
// pattern/batchstate precedent). The file lives beside the seeded history
// store under ~/.dsh - the hook's own local memory, never the repo.
//
// A stale or unreadable file is a silent miss (the store starts fresh): a
// persistence failure must never reach the hot path.
import type Entry from "./Entry.js";

export default interface Store {
	/** The snapshot schema version (1). */
	version: number;
	/** When the snapshot was last written (epoch milliseconds). */
	savedAt: number;
	/** The entries, newest first, bounded by the history depth. */
	entries: Entry[];
}
