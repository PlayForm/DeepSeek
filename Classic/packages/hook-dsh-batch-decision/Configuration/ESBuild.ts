// Configuration/ESBuild.ts - the plain-ESM twin convention (the
// live-containers / factory / normalize family template). The base
// configuration from @playform/build already applies: format esm, platform
// node, bundle false - each Source file transpiles to its own Target file,
// imports stay external (the runtime import of @deepseek-ai/schemastery is
// never bundled; the type-only imports of cordis and dsh-tools are erased),
// and tsconfig paths aliases are rewritten to relative output paths.
//
// minify: true is safe: every ledger line is a runtime-evaluated template
// literal, and the loader contract is name/export based.
//
// The Target plugin wipes outdir "Target" recursively on start so stale
// files can never linger after a rename or removal.
import type { BuildOptions, Plugin } from "esbuild";

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
