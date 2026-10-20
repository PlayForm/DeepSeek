import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the ETS LIVE-CONTAINERS hook (the Classic twin behind Effect v4), passed to
 * `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the twin-file
 * convention - byte-identical with the tool-coach's, the factory's and the
 * normalize family's template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file, imports stay external (the
 * runtime import of `@deepseek-ai/schemastery` is never bundled, the
 * type-only imports of `@deepseek-ai/dsh-tools`/`@deepseek-ai/cordis` and of
 * the factory are erased - the built Target has NO runtime import of them:
 * at runtime the event vocabulary arrives from the live services and the
 * factory service resolves through the injector), and tsconfig `paths`
 * aliases are rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: every
 * ledger message and every frame line is a runtime-evaluated string literal
 * (template literals built at call time and written through Factory.Append
 * -> ctx.logger + appendFileSync), so minification cannot touch them, the
 * frame and token grammar are runtime-evaluated template literals (never
 * regexes built from source text), and the loader contract is name/export
 * based (`name`, `apply`, `Config`, `inject`, the default object) - none of
 * it is affected by minified internals. No `define` block - the
 * live-containers hook needs no build-time constants.
 *
 * The `Target` plugin (wipe `Target/` on start) is kept so stale files can
 * never linger after a rename or removal.
 */
export default {
	color: true,
	format: "esm",
	logLevel: "debug",
	metafile: true,
	minify: true,
	outdir: "Target",
	platform: "node",
	target: "esnext",
	tsconfig: "tsconfig.json",
	write: true,
	plugins: [
		{
			name: "Target",
			setup({ onStart, initialOptions: { outdir } }) {
				onStart(async () => {
					try {
						outdir
							? await (
									await import("node:fs/promises")
								).rm(outdir, {
									recursive: true,
								})
							: {};
					} catch (_Error) {
						console.log(_Error);
					}
				});
			},
		} as Plugin,
	],
} satisfies BuildOptions as BuildOptions;
