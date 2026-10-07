// Factory — the type-side link to the @playform/plugin-dsh-factory service
// (the family's FIRST service provider — the class/service plugin form).
// The factory is a REQUIRED dependency of this module: `inject` lists
// "pluginFactory", so the plugin stays PENDING until the service exists and
// the accessor `ctx.pluginFactory` is the consumption form (SCHEME.md §0 —
// never the throwing bare accessor without inject, never a load-order
// assumption). The governor consumes the factory only through the injected
// service; the ONLY module-level import of the factory package is
// Variable/Config's standalone `Schema` (the module-load use, factory
// v0.1.1 P1) — every OTHER Target module resolves it through ctx.
//
// This module performs the DECLARATION MERGING (plugin-development skill §3:
// typed vocabulary via declaration merging): the factory class does not
// augment the cordis `Context` interface itself, so the consumer declares
// the `pluginFactory` property — the instance side of the default-exported
// class (a type-only import of a class default gives the instance shape).
// The pre-v0.1.1 STRUCTURAL MIRROR of the factory's 16-method signature is
// gone (the declaration fix ships relative specifiers — the real type
// resolves; the runtime factory instance satisfies it structurally).
//
// One definition per file; a type-only module (its compiled output is empty).
import type PluginFactory from "@playform/plugin-dsh-factory";

// The type-only default export: the factory's instance shape (the empty
// interface is the verbatimModuleSyntax-legal form — an `export default` of
// an interface is elided, a type alias would need a named export).
export default interface Factory extends PluginFactory {}

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service (@playform/plugin-dsh-factory). */
		pluginFactory: PluginFactory;
	}
}
