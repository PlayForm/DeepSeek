// FactoryHandle - the slice of the factory service the merge hook consumes
// (Interface/Factory): the State builder, the ledger, the exclusion match,
// and the SHARED WRITE EXECUTOR (the factory's Write method - the merge's
// per-file commits all go through it: the explicit replaceIfVersion intent,
// the P4 sandbox fence, the root-context fs/observed emit). Structural, so
// the smoke can serve the REAL built factory.
// The factory service's type arrives TYPE-ONLY from the factory package
// (erased at build), and the augmentation below publishes the typed
// vocabulary on the cordis Context so `ctx.pluginFactory` is fully typed at
// every consumption site (the workspace-observe precedent).
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: import("@playform/plugin-dsh-factory").default;
	}
}

export default interface FactoryHandle {
	/** The State builder: cell unwrap + shared fields + module extras. */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;
	/** The ledger: logger first, then the durable file; never throws. */
	Append(State: unknown, Message: string): void;
	/** The exclusion match (the factory's segment match). */
	Match(Path: string, List: string[] | null | undefined): boolean;
	/** The ONE shared write executor: resolve is caller-side (the merge
	 *  resolves in its gate); the Over bundle carries the intent, the
	 *  sandbox posture and the emit choice. */
	Write(
		State: unknown,
		Target: unknown,
		Content: string,
		Over?: {
			intent?: unknown;
			signal?: AbortSignal;
			policy?: unknown;
			actor?: object;
			observe?: boolean;
		},
	): Promise<{ version: unknown }>;
}
