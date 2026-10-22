// Configuration/Test-ESBuild.js - the plain-ESM twin of Test-ESBuild.ts,
// kept byte-equivalent by hand (the `@playform/build` config loader imports
// the `--ESBuild` path with `.ts` swapped to `.js`). KEEP IN SYNC: an edit
// to Test-ESBuild.ts must be mirrored here.
//
// The smoke suite is END-PHASE work (the PoC brief section 2); this config
// ships now so the prepublishOnly pipeline can add the test build when the
// tests land.
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
	plugins: [Remove],
};
