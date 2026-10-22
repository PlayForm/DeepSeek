// DomainHandle - the slice of the opened storage domain the hook uses
// (Interface/Domain). One domain (named config `domain`, default
// workspace_approve), TWO tables: `bindings` (one record per binding - keyed
// by the binding id) and `ring` (ONE meta record `__ring` - the bounded ring
// of the last maxBindings bindings). Puts are fire-and-forget (never
// awaited); the recovery read is synchronous (`entries`), the same posture
// the observe hook uses.
export default interface DomainHandle {
	/** Close the domain (the storage effect's disposer). */
	close(): Promise<void>;
	/** One table of the domain. */
	table(name: string): {
		put(key: string, value: unknown): Promise<void>;
		entries(): IterableIterator<[string, unknown]>;
	};
}
