// FactoryHandle - the slice of the factory service the evidence service
// consumes (Interface/Factory). The service holds the injected
// `pluginFactory` instance and uses: the State builder (cell unwrap + shared
// fields + the P10 volatile refresh), the ledger (logger + appendFileSync,
// never throws), the exclusion match, and the Wire registration (the exact
// `Context.root.on("fs/observed", ...)` posture). Structural, so any future
// refactor keeps the consumer honest.
//
// The augmentation below publishes the `pluginFactory` Context property, so
// `ctx.pluginFactory` is typed at every consumption site (the typed view
// arrives TYPE-ONLY from the factory package - erased at build).
import type Factory from "@playform/plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}

export default interface FactoryHandle {
	/** The State builder: cell unwrap + shared fields + module extras. */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;
	/** The ledger: logger first, then the durable file; never throws. */
	Append(State: unknown, Message: string): void;
	/** The exclusion match (the factory's segment match). */
	Match(Path: string, List: string[] | null | undefined): boolean;
	/** The fs/observed registration on the ROOT context. */
	Wire(Context: unknown, State: unknown, Observe: unknown): void;
}
