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
 * Custom ESBuild configuration for the workspace live client
 * (@playform/client-dsh-workspace-live), passed to `@playform/build` via
 * `--ESBuild Configuration/ESBuild.ts` (the twin-file convention, modeled on
 * the live-containers template). The base configuration from the build tool
 * already applies: `format: esm`, `platform: node`, `bundle: false` - each
 * Source file transpiles to its own Target file and imports stay external;
 * the type-only imports of `@deepseek-ai/cordis` are erased. The client half
 * (Source/Client.ts -> Target/Client.js, the `./client` export) keeps react
 * external - the module system's platform seed table resolves it.
 *
 * `minify: true` - safe: every user-facing string is a runtime-evaluated
 * locale literal, the presentation is a pure function of the subscribed
 * snapshot, and no regex is built from source text. The `define` block makes
 * the build-time constants explicit: the package's own name and version (read
 * at config-load time) compile into `process.env.NAME_PACKAGE` and
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
