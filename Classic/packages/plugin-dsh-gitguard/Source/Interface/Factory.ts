// FactoryHandle - the slice of the factory service the git guard consumes
// (Interface/Factory). Structural, so a test context can serve the REAL
// built factory and any future factory refactor keeps the consumer honest
// (the observe package's precedent).
//
// The augmentation below publishes the factory vocabulary on the cordis
// Context (the hook-dsh-ccr precedent): the type arrives TYPE-ONLY from the
// factory package (erased at build - no runtime import), so
// `ctx.pluginFactory` is typed at every consumption site.
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
}
