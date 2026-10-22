// DomainHandle - the slice of the opened storage domain the merge hook uses
// (Interface/Domain). One domain (named config `domain`, default
// workspace_merge), TWO tables: `batches` (one record per batch, keyed by
// the batch id) and `meta` (ONE record `__meta` carrying the sequence
// counter). Puts are fire-and-forget from the commit path (never awaited
// by the caller); the recovery read is synchronous (`entries`).
export default interface DomainHandle {
	/** Close the domain (the storage effect's disposer). */
	close(): Promise<void>;
	/** One table of the domain. */
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
}
