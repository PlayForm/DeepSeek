import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module Test-ESBuild
 *
 * Test ESBuild configuration for the AUDIT flavor
 * (@playform/hook-dsh-workspace-audit): compiles the Source/Test TypeScript
 * tree to Target/Test, one output file per source file (bundle: false), so
 * each test folder runs standalone AND under the aggregate runner. The
 * mirrored `outbase` keeps the relative import depth valid from BOTH trees.
 *
 * NOT minified; sourcemaps on for the standalone runs.
 *
 * The `Target-Test` plugin wipes ONLY `Target/Test` on start - never the
 * whole `Target`: the plugin build owns that and runs BEFORE this step. The
 * smoke suite itself is END-PHASE work (the PoC brief section 2); this
 * config ships now so the prepublishOnly pipeline can add the test build
 * when the tests land, without re-deriving the configuration.
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
