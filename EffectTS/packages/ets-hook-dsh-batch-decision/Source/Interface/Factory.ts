// Factory - the injected @playform/ets-plugin-dsh-factory service's typed view.
// The type arrives TYPE-ONLY from the factory package (erased at build - the
// built Target has NO runtime import of the factory: at runtime the service
// resolves from the profile through the injector, never through a module
// import). The augmentation publishes the typed vocabulary on the cordis
// Context, so `ctx.pluginFactory` is fully typed at every consumption site.
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
