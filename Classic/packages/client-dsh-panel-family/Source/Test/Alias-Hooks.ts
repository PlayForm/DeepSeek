// Source/Test/Alias-Hooks.ts - the module-resolution hooks for the client
// halves' smoke suites. The built client half (Target/Client.js and its
// Function/ imports) keeps the SOURCE aliases `@Function/*` and
// `@Variable/*` external (bundle: false - the module system resolves them
// at materialization time), so a plain Node run cannot import the built
// client without help. This hook maps the aliases back onto the real built
// Target (and the real JSON dictionaries, which the transpile-only plugin
// build does not copy into Target) so every smoke loads the REAL built
// client code - never a mock (the smoke-writing law).
//
// The mapping is rooted at the package root (the parentURL of the importing
// Target file, cut at its `/Target/` marker), so the same rule serves
// imports from Target/*.js and Target/Function/*.js alike. Everything else
// (react, schemastery, node builtins, relative imports) falls through to
// the default resolver untouched.
//
// Registered with `module.registerHooks` (the in-thread hook API), so the
// registration is synchronous and applies to the dynamic imports the
// Harness performs right after loading this module.
import * as FileSystem from "node:fs";
import * as Module from "node:module";

/** The package-root URL of the module currently resolving an alias. */
const Root = (Context: any): string => {
	const Parent = String(Context.parentURL ?? "");
	const Marker = Parent.indexOf("/Target/");
	return Marker === -1 ? Parent : Parent.slice(0, Marker);
};

/** The resolve hook: `@Function/*` -> Target/Function, `@Variable/*` ->
 *  Target/Variable (built .js) or Source/Variable (the JSON dictionaries). */
const Resolve = (Specifier: string, Context: any, Next: any): any => {
	switch (true) {
		case Specifier.startsWith("@Function/"):
			return Next(
				`${Root(Context)}/Target/Function/${Specifier.slice("@Function/".length)}`,
				Context,
			);
		case Specifier.startsWith("@Variable/") && Specifier.endsWith(".json"):
			return Next(
				`${Root(Context)}/Source/Variable/${Specifier.slice("@Variable/".length)}`,
				Context,
			);
		case Specifier.startsWith("@Variable/"):
			return Next(
				`${Root(Context)}/Target/Variable/${Specifier.slice("@Variable/".length)}`,
				Context,
			);
		default:
			return Next(Specifier, Context);
	}
};

/**
 * The load hook: the built client imports the locale dictionaries without
 * an ESM import attribute (the module system's loader does not require
 * one), which Node's ESM loader rejects (`ERR_IMPORT_ATTRIBUTE_MISSING`).
 * Serve the dictionaries as modules: `export default <parsed JSON>` - the
 * bytes on disk are untouched; only the module wrapping changes.
 */
const Load = (Url: string, Context: any, Next: any): any => {
	switch (true) {
		case Url.endsWith("/Source/Variable/Locale-en.json") ||
			Url.endsWith("/Source/Variable/Locale-zh.json"): {
			const Text = FileSystem.readFileSync(new URL(Url).pathname, "utf8");
			return {
				format: "module",
				shortCircuit: true,
				source: `export default ${JSON.stringify(JSON.parse(Text))};`,
			};
		}
		default:
			return Next(Url, Context);
	}
};

Module.registerHooks({ resolve: Resolve as any, load: Load as any });
