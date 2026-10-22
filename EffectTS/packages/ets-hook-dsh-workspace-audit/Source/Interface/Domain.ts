// DomainHandle - the slice of the opened storage domain the hook uses
// (Interface/Domain). One domain (named config `domain`, default
// workspace_audit), TWO tables: `lines` (one record per line id) and `ring`
// (ONE meta record `__ring` - the bounded ring of the last maxLines lines).
// Puts are fire-and-forget from the synchronous listener (never awaited);
// the recovery read is synchronous (`entries`), the same posture the
// observe hook's domain uses.
export default interface DomainHandle {
	/** Close the domain (the storage effect's disposer). */
	close(): Promise<void>;
	/** One table of the domain. */
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
}
