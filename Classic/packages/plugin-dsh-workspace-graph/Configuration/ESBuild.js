// Configuration/ESBuild.js - the plain-ESM twin of ESBuild.ts, kept byte-
// equivalent by hand. The `@playform/build` config loader imports the
// `--ESBuild` path with `.ts` swapped to `.js` (Target/Function/File.js), so
// a real `.js` file must exist beside the TypeScript source - the published
// package ships exactly this triple (.ts + .js + .d.ts).
// KEEP IN SYNC: an edit to ESBuild.ts must be mirrored here.
//
// `minify: true` - the PRODUCTION build is minified, and that is safe: every
// ledger message is a runtime-evaluated string literal (built at call time),
// so minification cannot touch them, the id grammar (`File:`, `Symbol:`,
// `Block:`, `Test:`, `DocSection:`) is runtime-evaluated template literals
// (never regexes built from source text), and the loader contract is
// name/export based (the class, `static inject`, `static Config`) - none of
// it is affected by minified internals.
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
