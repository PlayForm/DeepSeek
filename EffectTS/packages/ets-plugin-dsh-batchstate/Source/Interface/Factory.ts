// FactoryHandle - the slice of the factory service the batch-state plugin
// consumes (Interface/Factory). Structural, so a test context can serve the
// REAL built factory and any future factory refactor keeps the consumer
// honest (the observe package's precedent). The augmentation below publishes
// the typed vocabulary on the cordis Context, so `ctx.pluginFactory` is fully
// typed at every consumption site (the observe/pinner precedent).
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
