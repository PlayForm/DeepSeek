// FactoryHandle - the slice of the factory service the reflect plugin
// consumes (Interface/Factory). The plugin holds the injected `pluginFactory`
// instance and uses: the State builder (Function/State - cell unwrap + shared
// fields + the P10 volatile refresh), the ledger (Function/Append - logger +
// appendFileSync, never throws), and the guarded write (Function/Write's
// `GuardedWrite` alias - the replaceIfVersion version fence + the P4 sandbox
// policy + the stash pre-registration). Structural, so a future refactor
// keeps the consumer honest and the smoke can serve the REAL built factory.
export default interface FactoryHandle {
	/** The State builder: cell unwrap + shared fields + module extras. */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;
	/** The ledger: logger first, then the durable file; never throws. */
	Append(State: unknown, Message: string): void;
	/** The guarded write: the explicit replaceIfVersion intent (the version
	 *  fence), the P4 sandbox policy, the stash pre-registration. Throws on
	 *  a version conflict or a write failure - the caller maps the failure
	 *  to the reply union. */
	GuardedWrite(
		State: unknown,
		Target: unknown,
		Content: string,
		Version: string,
		Signal?: AbortSignal,
	): Promise<{ operation: string; version: string }>;
}
