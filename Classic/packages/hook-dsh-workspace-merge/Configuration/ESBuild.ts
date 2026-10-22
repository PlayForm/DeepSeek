import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the WORKSPACE-MERGE hook, passed to
 * `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the twin-file
 * convention - the live-containers template). The base configuration from
 * the build tool already applies: `format: esm`, `platform: node`,
 * `bundle: false` - each Source file transpiles to its own Target file,
 * imports stay external (the runtime import of `@deepseek-ai/schemastery`
 * is never bundled, the type-only imports of `@deepseek-ai/dsh-fs` and of
 * the factory are erased), and tsconfig `paths` aliases are rewritten to
 * relative output paths.
 *
 * `minify: true` - safe for the same reason as the template: every ledger
 * message is a runtime-evaluated string literal, and the loader contract is
 * name/export based. No `define` block - the merge hook needs no
 * build-time constants.
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
