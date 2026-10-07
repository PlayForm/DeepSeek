import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the FACTORY (@playform/plugin-dsh-factory),
 * passed to `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the
 * Compress-package convention, byte-identical to the trio's configuration).
 * The base configuration from the build tool already applies: `format: esm`,
 * `platform: node`, `bundle: false` — each Source file transpiles to its own
 * Target file, imports stay external (the runtime import of
 * `@deepseek-ai/schemastery` in Function/Schema and the dynamic
 * `@deepseek-ai/dsh-storage-domain` / `zod` imports in Function/Open are
 * never bundled), and tsconfig `paths` aliases are rewritten to relative
 * output paths.
 *
 * `minify: true` — the PRODUCTION build is minified, and that is safe: every
 * ledger message is a runtime-evaluated string literal (template literals
 * built at call time and written through Append → ctx.logger +
 * appendFileSync), so minification cannot touch them, and the loader
 * contract is class/export based (`export default class PluginFactory extends
 * Service`, `static inject`) — none of it is affected by minified internals.
 * No `define` block — the factory needs no build-time constants.
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
