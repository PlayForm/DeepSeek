// Service - the declaration merging that publishes the routing enforcer's
// service on the cordis Context (plugin-development skill, item 12). The
// service registers as `dshRoute` (Function/Enforcer), so the sibling
// orchestration plugins (the subagent queue's dispatcher) can consume the
// resolution through `ctx.dshRoute` - the routed dispatch of
// SUBAGENT-QUEUE-PLUGIN.md section 2.4.
//
// The shape here is the structural contract; the implementation lives in
// Function/Enforcer.ts. Consumers that must stay decoupled from this package
// (the self-contained PoC rule) re-declare the same shape in their own
// Interface/ and probe the service at use time - an absent service (the
// plugin ships disabled) is a contained skip, never a load block.
//
// The factory vocabulary is published on the same augmentation (the
// hook-dsh-ccr precedent): the type arrives TYPE-ONLY from the factory
// package (erased at build), so `ctx.pluginFactory` is fully typed at every
// consumption site.
import type Enforcer from "@Function/Enforcer.js";
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The routing-enforcer service (@playform/plugin-dsh-route). */
		dshRoute: Enforcer;
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
