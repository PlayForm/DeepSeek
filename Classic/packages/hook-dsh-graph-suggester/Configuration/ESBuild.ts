import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the GRAPH-SUGGESTER hook, passed to
 * `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the twin-file
 * convention - byte-identical with the ccr's, the tool-coach's and the
 * live-containers' template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file, imports stay external (the
 * type-only imports of `@deepseek-ai/dsh-tools`/`@deepseek-ai/dsh-llm` and
 * of the factory AND of the workspace graph service are erased - the built
 * Target has NO runtime import of them: at runtime the graph service
 * resolves from the profile through the injector), and tsconfig `paths`
 * aliases are rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: every
 * ledger message and every note line is a runtime-evaluated string literal
 * or built from the graph service's returned entries and the pack's literal
 * candidate paths, and the loader contract is name/export based (`name`,
 * `apply`, `Config`, `inject`, the default object) - none of it is affected
 * by minified internals. No `define` block.
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
