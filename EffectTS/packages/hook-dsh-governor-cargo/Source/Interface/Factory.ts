// Factory — the type-side link to the @playform/plugin-dsh-factory service
// (the family's FIRST service provider — the class/service plugin form).
// The factory is a REQUIRED dependency of this module: `inject` lists
// "pluginFactory", so the plugin stays PENDING until the service exists and
// the accessor `ctx.pluginFactory` is the consumption form (SCHEME.md §0 —
// never the throwing bare accessor without inject, never a load-order
// assumption).
//
// This module performs the DECLARATION MERGING (plugin-development skill §3:
// typed vocabulary via declaration merging): the factory class does not
// augment the cordis `Context` interface itself, so the consumer declares the
// `pluginFactory` property — the instance side of the default-exported class
// (a type-only import of a class default gives the instance shape).
//
// One definition per file; a type-only module (its compiled output is empty).
import type PluginFactory from "@playform/plugin-dsh-factory";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The plugin-factory service — the shared governance machinery
		 *  (State/Gate/Continue/Append/Wire/Attach/Schema/Seam/…). */
		pluginFactory: PluginFactory;
	}
}
