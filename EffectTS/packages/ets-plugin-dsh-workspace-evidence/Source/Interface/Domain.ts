// DomainHandle - the slice of the opened storage domain the evidence service
// uses (Interface/Domain). One domain (named config `domain`, default
// workspace_evidence), TWO tables: `validations` (one record per claim id -
// the latest validation object) and `meta` (ONE record `__sequence` - the
// persisted sequence). Puts are fire-and-forget from the call path (never
// awaited on the listener path); the recovery read is synchronous
// (`entries`), the same posture the observe hook's domain uses.
export default interface DomainHandle {
	/** Close the domain (the storage effect's disposer). */
	close(): Promise<void>;
	/** One table of the domain. */
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
}
