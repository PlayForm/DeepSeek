import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the invisible hook, passed to
 * `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the
 * Compress-package convention — byte-identical with the factory's and the
 * trio's template). The base configuration from the build tool already
 * applies: `format: esm`, `platform: node`, `bundle: false` — each Source
 * file transpiles to its own Target file, imports stay external (the runtime
 * import of `@deepseek-ai/schemastery` is never bundled, and the TYPE-ONLY
 * import of `@deepseek-ai/dsh-llm` is erased — the built Target has NO
 * runtime import of it: at runtime the chunk vocabulary arrives from the
 * live LlmRuntime), and tsconfig `paths` aliases are rewritten to relative
 * output paths.
 *
 * `minify: true` — the PRODUCTION build is minified, and that is safe: every
 * ledger message is a runtime-evaluated string literal (template literals
 * built at call time and written through Factory.Append → ctx.logger +
 * appendFileSync), so minification cannot touch them, and the loader contract
 * is name/export based (`name`, `apply`, `Config`, `inject`, the default
 * object) — none of it is affected by minified internals. The zero-width/
 * invisible class is a regex literal evaluated at call time — also untouched.
 * No `define` block — the invisible hook needs no build-time constants.
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
