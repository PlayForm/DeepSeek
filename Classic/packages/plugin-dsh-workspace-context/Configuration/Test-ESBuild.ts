import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module Test-ESBuild
 *
 * Test ESBuild configuration for the WORKSPACE-CONTEXT flavor
 * (@playform/plugin-dsh-workspace-context): compiles the Source/Test
 * TypeScript tree to Target/Test, one output file per source file
 * (bundle: false - the base configuration from the build tool already
 * applies: each Source file transpiles to its own Target file, imports stay
 * external), so each test folder runs standalone
 * (`node Target/Test/<Name>/Test.js`) AND under the aggregate runner. The
 * mirrored `outbase` keeps the relative import depth valid from BOTH trees.
 *
 * NOT minified; sourcemaps on for the standalone runs.
 *
 * The `Target-Test` plugin wipes ONLY `Target/Test` on start - never the
 * whole `Target`: the plugin build owns that and runs BEFORE this step.
 * The live-containers file verbatim, header adapted.
 *
 * POC PHASE NOTE: the Source/Test tree is built by the end-phase smoke pass;
 * until then this configuration has no inputs and is kept byte-faithful to
 * the family anatomy so the test steps activate unchanged.
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
