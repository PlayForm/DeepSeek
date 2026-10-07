// Factory — the typed view of the family's FIRST service provider
// (@playform/plugin-dsh-factory, `ctx.pluginFactory`). The pinner consumes the
// factory exclusively through the SERVICE (inject: ["fs", "pluginFactory"]):
// the service is resolved by the loader — never by a module import at the use
// sites — so this module is the single place the pinner names it: the
// declaration-merging vocabulary (skill: typed vocabulary via
// `declare module`) that types `ctx.pluginFactory` for every call site.
//
// The runtime resolution is profile-owned: the factory bundle
// (profiles/<profile>/bundles/plugin-dsh-factory) registers the service when it
// loads; the loader holds this bundle PENDING until `pluginFactory` exists
// (docs: a plugin with inject stays pending until every service exists — load
// order in cordis.yml does not matter).
//
// The factory's SCHEME.md documents the 15-method surface this type mirrors.
// Type-only: nothing is emitted — the compiled bundle never references the
// factory module on the runtime call path (the service accessor IS the
// reference; the single runtime import of the package lives in
// Variable/Config, where the schema factory is bootstrapped at load).
import type Factory from "@playform/plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service — the governance family's shared machinery. */
		pluginFactory: Factory;
	}
}
