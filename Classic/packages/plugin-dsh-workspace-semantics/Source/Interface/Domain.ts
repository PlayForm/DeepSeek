// DomainHandle - the slice of the opened storage domain the semantics service
// uses (Interface/Domain). One domain (named config `domain`, default
// workspace_semantics), TWO tables: `models` (one record per path - the
// latest model, keyed by the path) and `meta` (ONE record `__revision` - the
// persisted index revision). Puts are fire-and-from the resolve path (never
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
