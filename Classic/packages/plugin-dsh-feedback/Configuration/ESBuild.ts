import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the FEEDBACK member
 * (@playform/plugin-dsh-feedback), passed to `@playform/build` via
 * `--ESBuild Configuration/ESBuild.ts` (the twin-file convention - the
 * live-containers template, byte-identical in shape). The base configuration
 * from the build tool already applies: `format: esm`, `platform: node`,
 * `bundle: false` - each Source file transpiles to its own Target file,
 * imports stay external (the runtime import of `@deepseek-ai/schemastery` is
 * never bundled, the type-only imports of `@deepseek-ai/cordis` are erased -
 * at runtime the Service base class arrives from the live cordis and the
 * config schema from the real schemastery), and tsconfig `paths` aliases are
 * rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: every
 * journal line and every rendered block is a runtime-evaluated template
 * literal, the block grammar is runtime-evaluated (never a regex built from
 * source text), and the loader contract is class/name based (the default
 * export class with `static inject`/`static Config`) - none of it is affected
 * by minified internals. No `define` block - the feedback member needs no
 * build-time constants.
 *
 * The `Target` plugin (wipe `Target/` on start) is kept so stale files can
 * never linger after a rename or removal.
 */
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
