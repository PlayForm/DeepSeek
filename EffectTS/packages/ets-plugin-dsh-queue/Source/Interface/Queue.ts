// Queue - the declaration merging that publishes the queue's service on the
// cordis Context (plugin-development skill, item 12). The service registers
// as `dshQueue` (Function/Dispatcher), so the orchestration layer (the
// batch-state compiler's queue view, the honest-feedback journal) can
// consume the queue through `ctx.dshQueue`.
//
// The shape here is the structural contract; the implementation lives in
// Function/Dispatcher.ts.
//
// The factory vocabulary is published on the same augmentation (the
// hook-dsh-ccr precedent): the type arrives TYPE-ONLY from the factory
// package (erased at build), so `ctx.pluginFactory` is fully typed at every
// consumption site.
import type Dispatcher from "@Function/Dispatcher.js";
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The subagent-queue service (@playform/plugin-dsh-queue). */
		dshQueue: Dispatcher;
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
