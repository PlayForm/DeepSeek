import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the workspace-live LIBRARY
 * (@playform/lib-dsh-workspace-live), passed to `@playform/build` via
 * `--ESBuild Configuration/ESBuild.ts` (the twin-file convention - byte-
 * identical with the lib-dsh-core / hook-dsh-live-containers template). The
 * base configuration from the build tool already applies: `format: esm`,
 * `platform: node`, `bundle: false` - each Source file transpiles to its own
 * Target file and imports stay external.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: the
 * library has no ledger strings and no grammar regexes built from source
 * text - every frame line is a runtime-evaluated template literal over the
 * caller's section fields, so minification cannot touch the output.
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
