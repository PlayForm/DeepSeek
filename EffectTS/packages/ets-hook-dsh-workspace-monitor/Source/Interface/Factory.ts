// FactoryHandle - the slice of the factory service the hook consumes
// (the workspace-observe precedent: structural, so any future refactor keeps
// the consumer honest). The hook holds the injected `pluginFactory` instance
// and uses: the State builder (cell unwrap + shared fields + the P10
// volatile refresh), the ledger (logger + appendFileSync, never throws),
// the exclusion match, and the Wire registration (the exact
// `Context.root.on("fs/observed", ...)` posture on the ROOT context).
// The factory service's type arrives TYPE-ONLY from the factory package
// (erased at build), and the augmentation below publishes the typed
// vocabulary on the cordis Context so `ctx.pluginFactory` is fully typed at
// every consumption site (the workspace-observe precedent).
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";

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
	/** The exclusion match (the factory's segment match). */
	Match(Path: string, List: string[] | null | undefined): boolean;
	/** The fs/observed registration on the ROOT context. */
	Wire(
		Context: unknown,
		State: unknown,
		Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void,
	): void;
}
