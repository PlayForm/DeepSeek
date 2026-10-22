// Factory - the injected @playform/ets-plugin-dsh-factory service's typed view.
// The type arrives TYPE-ONLY from the factory package (erased at build - the
// built Target has NO runtime import of the factory: at runtime the service
// resolves from the profile through the injector, never through a module
// import). The augmentation below publishes the typed vocabulary on the
// cordis Context (plugin-development skill, item 12), so `ctx.pluginFactory`
// is fully typed at every consumption site. The event names themselves are
// NOT re-declared here: @deepseek-ai/dsh-fs already declares `fs/observed` -
// re-declaring it would be a conflicting duplicate.
import type Factory from "@playform/ets-plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
		pluginFactory: Factory;
	}
}
