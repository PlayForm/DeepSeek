// Configuration/ESBuild.js - the plain-ESM twin of ESBuild.ts, kept byte-
// equivalent by hand. The `@playform/build` config loader imports the
// `--ESBuild` path with `.ts` swapped to `.js`, so a real `.js` file must
// exist beside the TypeScript source.
// KEEP IN SYNC: an edit to ESBuild.ts must be mirrored here.
//
// The define block makes the build-time constants explicit: the package's own
// name and version (read at config-load time) compile into
// `process.env.NAME_PACKAGE` and `process.env.VERSION_PACKAGE` rather than
// relying on the build tool's default define.
import { readFileSync } from "node:fs";

const Package = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const Version = Package.version ?? "0.0.0";
const Name = Package.name ?? "";
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
	define: {
		"process.env.VERSION_PACKAGE": JSON.stringify(Version),
		"process.env.NAME_PACKAGE": JSON.stringify(Name),
	},
	plugins: [Remove],
};
