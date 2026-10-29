// Configuration/Test-ESBuild.ts - the test ESBuild configuration: compiles
// the Source/Test TypeScript tree to Target/Test, one output file per source
// file (bundle: false), so each test folder runs standalone AND under the
// aggregate runner. The mirrored outbase keeps the relative import depth
// valid from both trees. NOT minified; sourcemaps on.
//
// The Target-Test plugin wipes ONLY Target/Test on start - the plugin build
// owns Target and runs BEFORE this step (prepublishOnly.sh order).
import type { BuildOptions, Plugin } from "esbuild";

export default {
	color: true,
	format: "esm",
	logLevel: "debug",
	metafile: false,
	minify: false,
	outdir: "Target/Test",
	outbase: "Source/Test",
	platform: "node",
	target: "esnext",
	tsconfig: "tsconfig.json",
	write: true,
	sourcemap: true,
	plugins: [
		{
			name: "Target-Test",
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
