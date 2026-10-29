// Configuration/Test-ESBuild.js - the plain-ESM twin of Test-ESBuild.ts for
// client-dsh-panel-family, kept byte-equivalent by hand (the same loader
// convention as ESBuild.js).
// KEEP IN SYNC: an edit to Test-ESBuild.ts must be mirrored here.
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
