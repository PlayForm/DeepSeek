// FactoryHandle - the slice of the injected @playform/ets-plugin-dsh-factory
// service the hook consumes (the family's class/service plugin). The hook
// uses: the State builder (Function/State - cell unwrap + shared fields + the
// P10 volatile refresh) and the ledger (Function/Append - logger +
// appendFileSync, never throws). The hook does NOT use the fs/observed Wire
// (it is a gate over tools/pre+post-execute, not an fs/observed module).
// Structural, so the smoke can serve the REAL built factory and any future
// refactor keeps the consumer honest.
// The factory service's type arrives TYPE-ONLY from the factory package
// (erased at build), and the augmentation below publishes the typed
// vocabulary on the cordis Context so `ctx.pluginFactory` is fully typed at
// every consumption site (the workspace-observe precedent).
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: import("@playform/ets-plugin-dsh-factory").default;
	}
}

export default interface FactoryHandle {
	/** The State builder: cell unwrap + shared fields + module extras. */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;
	/** The ledger: logger first, then the durable file; never throws. */
	Append(State: unknown, Message: string): void;
}
