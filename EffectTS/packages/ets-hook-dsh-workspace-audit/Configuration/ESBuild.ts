import type { BuildOptions, Plugin } from "esbuild";

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the WORKSPACE-AUDIT hook, passed to
 * `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the twin-file
 * convention - byte-identical with the live-containers, the factory and the
 * normalize family's template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file, imports stay external (the
 * runtime import of `@deepseek-ai/schemastery` is never bundled, and the
 * dynamic imports of `@deepseek-ai/dsh-storage-domain` and `zod` stay
 * dynamic - a module-level import of an unresolvable optional package would
 * crash the whole bundle load, the factory's live-verified pitfall), and
 * tsconfig `paths` aliases are rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: every
 * ledger line is a runtime-evaluated string literal (template literals built
 * at call time and written through Factory.Append), the line records travel
 * as data (never as source text), and the loader contract is name/export
 * based (`name`, `apply`, `Config`, `inject`, the default object) - none of
 * it is affected by minified internals. No `define` block - the audit hook
 * needs no build-time constants.
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
