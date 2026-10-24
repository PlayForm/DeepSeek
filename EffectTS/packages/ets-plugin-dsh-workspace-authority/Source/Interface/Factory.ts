// FactoryHandle - the slice of the injected @playform/ets-plugin-dsh-factory
// service the authority consumes (the family's class/service plugin). The
// service uses: the State builder (Function/State - cell unwrap + shared
// fields + the P10 volatile refresh) and the ledger (Function/Append -
// logger + appendFileSync, never throws). Structural, so the smoke can serve
// the REAL built factory and any future refactor keeps the consumer honest.
//
// The augmentation below publishes the `pluginFactory` Context property, so
// `ctx.pluginFactory` is typed at every consumption site (the typed view
// arrives TYPE-ONLY from the factory package - erased at build).
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}

export default interface FactoryHandle {
	/** The State builder: cell unwrap + shared fields + module extras. */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;
	/** The ledger: logger first, then the durable file; never throws. */
	Append(State: unknown, Message: string): void;
}
