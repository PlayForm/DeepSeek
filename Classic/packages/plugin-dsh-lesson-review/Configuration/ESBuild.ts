// Configuration/ESBuild.ts - the plain-ESM twin convention (the
// live-containers / factory / normalize family template). The base
// configuration from @playform/build already applies: format esm, platform
// node, bundle false - each Source file transpiles to its own Target file,
// imports stay external (the runtime import of @deepseek-ai/schemastery is
// never bundled; the type-only imports of cordis and of the factory's Schema
// helper are erased), and tsconfig paths aliases are rewritten to relative
// output paths.
//
// minify: true is safe: every ledger line is a runtime-evaluated template
// literal, and the loader contract is name/export based.
//
// The define block makes the build-time constants explicit: the package's own
// name and version (read at config-load time) compile into
// `process.env.NAME_PACKAGE` and `process.env.VERSION_PACKAGE` rather than
// relying on the build tool's default define.
//
// The Target plugin wipes outdir "Target" recursively on start so stale
// files can never linger after a rename or removal.
import { readFileSync } from "node:fs";

import type { BuildOptions, Plugin } from "esbuild";

// The package manifest, read at config-load time: its name and version become
// the build-time constants the define block below compiles into the Target.
const Package = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
	name?: string;
	version?: string;
};

const Version = Package.version ?? "0.0.0";
const Name = Package.name ?? "";

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
	plugins: [
		{
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
		} as Plugin,
	],
} satisfies BuildOptions as BuildOptions;
