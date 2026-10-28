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

/**
 * @module ESBuild
 *
 * Custom ESBuild configuration for the file-content normalizer flavor, passed
 * to `@playform/build` via `--ESBuild Configuration/ESBuild.ts` (the
 * twin-file convention - byte-identical with the factory's, the trio's
 * and the stream flavors' template). The base configuration from the build
 * tool already applies: `format: esm`, `platform: node`, `bundle: false` -
 * each Source file transpiles to its own Target file, imports stay external
 * (the runtime imports of `@deepseek-ai/schemastery` and `@deepseek-ai/dsh-tools`
 * are never bundled, and the TYPE-ONLY imports of the factory's and the core's
 * vocabularies are erased - the built Target has NO runtime import of
 * `@playform/ets-plugin-dsh-factory` or `@playform/ets-lib-dsh-core`: at runtime the
 * service resolves from the profile through the injector and the transforms
 * arrive through the core package the profile links), and tsconfig `paths`
 * aliases are rewritten to relative output paths.
 *
 * `minify: true` - the PRODUCTION build is minified, and that is safe: every
 * ledger message is a runtime-evaluated string literal (template literals
 * built at call time and written through Factory.Append → ctx.logger +
 * appendFileSync), so minification cannot touch them, and the loader contract
 * is name/export based (`name`, `apply`, `Config`, `inject`, the default
 * object) - none of it is affected by minified internals. The counting
 * six-fold chain is composed at call time from the core's exported tables and
 * replacers - also untouched. The `define` block makes the build-time
 * constants explicit: the package's own name and version (read at config-load
 * time) compile into `process.env.NAME_PACKAGE` and
 * `process.env.VERSION_PACKAGE` rather than relying on the build tool's
 * default define.
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
