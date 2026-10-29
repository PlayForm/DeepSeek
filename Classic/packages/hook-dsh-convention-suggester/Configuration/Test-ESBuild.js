// Configuration/Test-ESBuild.js - the plain-ESM twin of Test-ESBuild.ts,
// kept byte-equivalent by hand (the same twin-file convention as ESBuild.js).
// KEEP IN SYNC: an edit to Test-ESBuild.ts must be mirrored here.
import { readFileSync } from "node:fs";

// The package manifest, read at config-load time: its version becomes the
// build-time constant the define block below compiles into the test Target
// (the same define the plugin build applies).
const Package = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const Version = Package.version ?? "0.0.0";

const Remove = {
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
};
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
	plugins: [Remove],
};
