import * as FileSystem from "node:fs";
import * as Module from "node:module";

/**
 * @module Alias-Hooks
 *
 * The module-resolution hooks that map the package's SOURCE aliases onto the real
 * built Target for every smoke suite in this package.
 *
 * @remarks
 *
 * The built halves (Target/Library.js for the host route, Target/Client.js for the
 * client tab) keep the SOURCE aliases `@Function/*`, `@Interface/*` and
 * `@Variable/*` external (bundle: false - the module system resolves them at
 * materialization time), so a plain Node run cannot import either built half
 * without help. The hook maps the aliases back onto the real built Target (and the
 * real JSON dictionaries, which the transpile-only plugin build does not copy into
 * Target) so every smoke loads the REAL built code - never a mock (the
 * smoke-writing law).
 *
 * The mapping is rooted at the package root (the parentURL of the importing Target
 * file, cut at its `/Target/` marker), so the same rule serves imports from
 * Target/*.js and Target/Function/*.js alike. Everything else (react, schemastery,
 * node builtins, relative imports) falls through to the default resolver untouched.
 *
 * Registered with `module.registerHooks` (the in-thread hook API), so the
 * registration is synchronous and applies to the dynamic imports the Harness
 * performs right after loading this module.
 */
/**
 * The package-root URL of the module currently resolving an alias.
 */
const Root = (Context: any): string => {
	const Parent = String(Context.parentURL ?? "");
	const Marker = Parent.indexOf("/Target/");
	return Marker === -1 ? Parent : Parent.slice(0, Marker);
};

/** The stub module the smoke graph gets in place of the harness UI
 *  primitives: the smoke graph evaluates the real built client, the published
 *  package's ESM entry imports CSS modules Node cannot load, so the arm
 *  substitutes renderer stubs while the browser bundle keeps the shell's real
 *  module through the externals list. */
const Primitives = [
	"export const Button = (Props) => Props.children ?? null;",
	"export const Tooltip = (Props) => Props.children ?? null;",
].join("\n");

/** The resolve hook: `@Function/*` and `@Interface/*` -> Target/Function
 *  and Target/Interface (built .js), `@Variable/*` -> Target/Variable
 *  (built .js) or Source/Variable (the JSON dictionaries). */
const Resolve = (Specifier: string, Context: any, Next: any): any => {
	switch (true) {
		case Specifier.startsWith("@Function/"):
			return Next(
				`${Root(Context)}/Target/Function/${Specifier.slice("@Function/".length)}`,
				Context,
			);
		case Specifier.startsWith("@Interface/"):
			return Next(
				`${Root(Context)}/Target/Interface/${Specifier.slice("@Interface/".length)}`,
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
		case Specifier === "@deepseek-ai/dsh-client-ui-primitives" ||
			Specifier.startsWith("@deepseek-ai/dsh-client-ui-primitives/"):
			return {
				url: `data:text/javascript,${encodeURIComponent(Primitives)}`,
				format: "module",
				shortCircuit: true,
			};
		default:
			return Next(Specifier, Context);
	}
};

/**
 * The load hook: the built halves import the locale dictionaries without
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
