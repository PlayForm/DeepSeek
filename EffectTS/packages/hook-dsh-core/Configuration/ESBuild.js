// Configuration/ESBuild.js — the plain-ESM twin of ESBuild.ts, kept byte-
// equivalent by hand. The `@playform/build` config loader imports the
// `--ESBuild` path with `.ts` swapped to `.js` (Target/Function/File.js), so
// a real `.js` file must exist beside the TypeScript source — the Compress
// package (@playform/compress) ships exactly this triple (.ts + .js + .d.ts).
// KEEP IN SYNC: an edit to ESBuild.ts must be mirrored here.
const Remove = {
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
};

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
	plugins: [Remove],
};
