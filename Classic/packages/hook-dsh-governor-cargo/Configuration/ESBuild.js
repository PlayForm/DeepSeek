// Configuration/ESBuild.js — the plain-ESM twin of ESBuild.ts, kept byte-
// equivalent by hand. The `@playform/build` config loader imports the
// `--ESBuild` path with `.ts` swapped to `.js` (Target/Function/File.js), so
// a real `.js` file must exist beside the TypeScript source — the Compress
// package (@playform/compress) ships exactly this triple (.ts + .js + .d.ts).
// KEEP IN SYNC: an edit to ESBuild.ts must be mirrored here. This flavor is
// the Cargo.toml governor — the configuration is identical to the package.json
// governor's because the build layout is identical; only the Source tree it
// compiles differs.
//
// `minify: true` — the PRODUCTION build is minified, and that is safe: every
// ledger message is a runtime-evaluated string literal (template literals
// built at call time and written through Append → ctx.logger +
// appendFileSync), so minification cannot touch them, and the loader
// contract is name/export based (`name`, `apply`, `Config`, `inject`, the
// default object).
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
