import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the workspace live client
 * (@playform/client-dsh-workspace-live), passed to `@playform/build` via
 * `--ESBuild Configuration/ESBuild.ts` (the twin-file convention, modeled on
 * the live-containers template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file and imports stay external;
 * the type-only imports of `@deepseek-ai/cordis` are erased. The client half
 * (Source/Client.ts -> Target/Client.js, the `./client` export) keeps react
 * external - the module system's platform seed table resolves it.
 *
 * `minify: true` - safe: every user-facing string is a runtime-evaluated
 * locale literal, the presentation is a pure function of the subscribed
 * snapshot, and no regex is built from source text. No `define` block.
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
