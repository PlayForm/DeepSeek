// Factory - the STRUCTURAL VIEW of the injected @playform/ets-plugin-dsh-factory
// service. The type arrives TYPE-ONLY from the factory package (erased at
// build: the built Target has NO runtime import of the factory - at runtime the
// service resolves from the profile through the injector). The augmentation
// below publishes the typed vocabulary on the cordis Context, so
// `ctx.pluginFactory` is fully typed at every consumption site.
//
// The nudge uses the factory's State builder (cell unwrap + shared fields) and
// its ledger (Append) - and nothing else: it registers its own
// `ctx.on("agent/status", ...)` listener, the plain fiber-owned pattern.
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
