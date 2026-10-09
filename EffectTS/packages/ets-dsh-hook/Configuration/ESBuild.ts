import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the BASE (@playform/ets-dsh-hook),
 * passed to `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the
 * twin-file convention, byte-identical to the family's
 * configuration). The base configuration from the build tool already
 * applies: `format: esm`, `platform: node`, `bundle: false` - each Source
 * file transpiles to its own Target file, imports stay external, and
 * tsconfig `paths` aliases are rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: the
 * base owns no ledger strings and no loader contract; its output is pure
 * machinery.
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
