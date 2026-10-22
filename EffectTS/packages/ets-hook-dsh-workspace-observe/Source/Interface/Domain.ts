// DomainHandle - the slice of the opened storage domain the hook uses
// (Interface/Domain). One domain (named config `domain`, default
// workspace_observe), TWO tables: `stamps` (one record per path - the latest
// stamp, keyed by the path) and `ring` (ONE meta record `__ring` - the
// bounded ring of the last maxStamps stamps). Puts are fire-and-forget from
// the synchronous listener (never awaited - the listener is a synchronous
// recorder); the recovery read is synchronous (`entries`), the same posture
// the live-containers monitor domain uses.
export default interface DomainHandle {
	/** Close the domain (the storage effect's disposer). */
	close(): Promise<void>;
	/** One table of the domain. */
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
}
