// DomainHandle - the slice of the opened storage domain the operate hook
// uses (Interface/Domain). One domain (named config `domain`, default
// workspace_operate), TWO tables: `proposals` (one record per proposal,
// keyed by the id) and `meta` (ONE record `__meta` carrying the sequence
// counter and the refusal count). Puts are fire-and-forget from the
// propose path (never awaited by the caller); the recovery read is
// synchronous (`entries`), the observe hook's posture.
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
