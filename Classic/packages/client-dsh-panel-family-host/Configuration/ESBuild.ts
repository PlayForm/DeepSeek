import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the panel-family host package
 * (@playform/client-dsh-panel-family-host), passed to `@playform/build` via
 * `--ESBuild Configuration/ESBuild.ts` (the twin-file convention, modeled on
 * the live-containers template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file and imports stay external;
 * the type-only imports of `@deepseek-ai/cordis` are erased. The host reads
 * the `~/.dsh` logs through plain node:fs (read-only), so no runtime import
 * beyond node builtins exists.
 *
 * `minimize: true` is safe: every response string is a runtime-evaluated
 * line slice; no regex is built from source text; the service surface is
 * name/method based. No `define` block - the host needs no build-time
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
