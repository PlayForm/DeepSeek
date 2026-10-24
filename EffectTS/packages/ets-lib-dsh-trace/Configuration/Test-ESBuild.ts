import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module Test-ESBuild
 *
 * Test ESBuild configuration for the TRACE (@playform/ets-lib-dsh-trace):
 * compiles the Source/Test TypeScript tree to Target/Test, one output file per
 * source file (bundle: false - the base configuration from the build tool
 * already applies: each Source file transpiles to its own Target file, imports
 * stay external), so each test folder runs standalone
 * (`node Target/Test/<Name>/Test.js`) AND under the aggregate runner. The
 * mirrored `outbase` keeps the relative import depth valid from BOTH trees
 * (Source/Test/<Name>/ and Target/Test/<Name>/ reach the built Target with the
 * same specifier).
 *
 * NOT minified; sourcemaps on for the standalone runs.
 *
 * The `Target-Test` plugin wipes ONLY `Target/Test` on start - never the whole
 * `Target`: the library build owns that and runs BEFORE this step (the library
 * build's `Target` plugin wipes `Target/` recursively, so the test build must
 * be second in prepublishOnly.sh).
 */
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
