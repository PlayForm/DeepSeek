import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the WORKSPACE GRAPH plugin
 * (@playform/plugin-dsh-workspace-graph), passed to `@playform/build` via
 * `--ESBuild Configuration/ESBuild.ts` (the twin-file convention - byte-identical
 * with the live-containers hook's, the tool-coach's, the factory's and the
 * normalize family's template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file, imports stay external (the
 * runtime import of `@deepseek-ai/schemastery` is never bundled, the dynamic
 * imports of `@deepseek-ai/dsh-storage-domain` and `zod` stay dynamic, and the
 * type-only imports of `@deepseek-ai/cordis`/`@deepseek-ai/dsh-fs` are erased),
 * and tsconfig `paths` aliases are rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: every
 * ledger message is a runtime-evaluated string literal (built at call time and
 * written through the module's own Append -> ctx.logger + the optional
 * appendFileSync), the id grammar (`File:`, `Symbol:`, `Block:`, `Test:`,
 * `DocSection:`) is runtime-evaluated template literals (never regexes built
 * from source text), and the loader contract is name/export based (the class,
 * `static inject`, `static Config`) - none of it is affected by minified
 * internals. No `define` block - the workspace graph needs no build-time
 * constants.
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
