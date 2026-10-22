// DomainHandle - the slice of the opened storage domain the hook uses
// (Interface/Domain). One domain (named config `domain`, default
// workspace_journal), THREE tables: `batches` (one record per batchId - the
// per-batch records), `entries` (one record per batchId:path - the revert
// data, keyed `batchId:path`), and `ring` (ONE meta record `__ring` - the
// bounded ring of the last maxBatches batchIds, the eviction order for the
// old records). Puts are fire-and-from the service's async paths and never
// awaited by the synchronous listener; the recovery read is synchronous
// (`entries`), the same posture the observe hook's domain uses.
export default interface DomainHandle {
	/** Close the domain (the storage effect's disposer). */
	close(): Promise<void>;
	/** One table of the domain. */
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		delete(key: string): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
}
