// Configuration/Test-ESBuild.js - the plain-ESM twin of Test-ESBuild.ts, kept
// byte-equivalent by hand. The `@playform/build` config loader imports the
// `--ESBuild` path with `.ts` swapped to `.js`, so a real `.js` file must
// exist beside the TypeScript source.
// KEEP IN SYNC: an edit to Test-ESBuild.ts must be mirrored here.
// PoC NOTE: the Source/Test tree is intentionally empty in the PoC phase; the
// end-phase smoke suites build through this configuration.
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
