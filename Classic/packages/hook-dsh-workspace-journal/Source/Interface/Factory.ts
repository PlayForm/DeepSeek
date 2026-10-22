// FactoryHandle - the slice of the factory service the hook consumes
// (Interface/Factory). The hook holds the injected `pluginFactory` instance
// and uses: the State builder (cell unwrap + shared fields + the P10
// volatile refresh), the ledger (logger + appendFileSync, never throws),
// the exclusion match, the Wire registration (the root-context
// fs/observed posture), and the shared write executor (the revert's
// version-fenced write). Structural, so the smoke can serve the REAL built
// factory and any future refactor keeps the consumer honest.
//
// The typed view of the factory service arrives TYPE-ONLY from the factory
// package (erased at build - at runtime the service resolves through the
// injector). The augmentation below publishes the `pluginFactory` Context
// property, so `ctx.pluginFactory` is typed at every consumption site.
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
	/** The ONE shared write executor (intent/policy/observe/stash/transform). */
	Write(
		State: unknown,
		Target: unknown,
		Content: string,
		Over?: Record<string, unknown>,
	): Promise<{
		operation: "create" | "update";
		version: unknown;
		before: string | null;
	}>;
}
