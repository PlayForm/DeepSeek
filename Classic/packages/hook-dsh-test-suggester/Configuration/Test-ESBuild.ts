import { readFileSync } from "node:fs";

import type { BuildOptions, Plugin } from "esbuild";

// The package manifest, read at config-load time: its version becomes the
// build-time constant the define block below compiles into the test Target
// (the same define the plugin build applies).
const Package = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
	version?: string;
};

const Version = Package.version ?? "0.0.0";

/**
 * @module Test-ESBuild
 *
 * Test ESBuild configuration for the TEST-SUGGESTER flavor
 * (@playform/hook-dsh-test-suggester): compiles the Source/Test TypeScript
 * tree to Target/Test, one output file per source file (bundle: false), so
 * each test folder runs standalone (`node Target/Test/<Name>/Test.js`) AND
 * under the aggregate runner. The mirrored `outbase` keeps the relative
 * import depth valid from BOTH trees. NOT minified; sourcemaps on.
 *
 * The `Target-Test` plugin wipes ONLY `Target/Test` on start - never the
 * whole `Target`: the plugin build owns that and runs BEFORE this step in
 * prepublishOnly.sh. The lib-dsh-core file verbatim, header adapted. In the
 * PoC phase no Test tree exists yet (the smokes are the end-phase); the
 * config is committed now so the end-phase adds only the tests.
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
	define: {
		"process.env.VERSION_PACKAGE": JSON.stringify(Version),
	},
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
