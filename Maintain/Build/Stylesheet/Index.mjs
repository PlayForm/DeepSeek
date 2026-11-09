// The stylesheet build step: one sass compile, shared by the client bundler
// (which turns a plugin's Source/Stylesheet/Plugin.scss into the string its
// injector mounts) and the material's own publish build (which copies the
// partials to Target and compiles the base CSS there).
//
// The Dart-JS `sass` package crashes on Node 26 the moment it resolves an
// imported path, so the compiler is sass-embedded.
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "sass-embedded";

const Root = Path.resolve(Path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** The CSS text of one sheet, with the material resolved through the root node_modules. */
export function Compile(File) {
	return compile(File, {
		loadPaths: [Path.join(Root, "node_modules")],
		style: "expanded",
		charset: false,
	}).css;
}

/** The esbuild plugin: every `.scss` resolves to a JS module exporting its CSS. */
export function Stylesheet() {
	return {
		name: "Stylesheet",
		setup(Build) {
			Build.onResolve({ filter: /\.scss$/ }, (Arguments) => ({
				path: Path.resolve(Arguments.resolveDir, Arguments.path),
				namespace: "stylesheet",
			}));
			Build.onLoad({ filter: /.*/, namespace: "stylesheet" }, (Arguments) => ({
				contents: `export default ${JSON.stringify(Compile(Arguments.path))}`,
				loader: "js",
			}));
		},
	};
}

// The material's build: its public surface is Target, so the three partials
// are copied there for the plugins' `@use`, and Base.scss compiles to the one
// CSS artifact a non-sass consumer can read.
function Material() {
	const Source = Path.join(Root, "Classic/packages/style-dsh-material/Source/Stylesheet");
	const Target = Path.join(Root, "Classic/packages/style-dsh-material/Target/Stylesheet");
	mkdirSync(Target, { recursive: true });
	for (const Name of readdirSync(Source).filter((Name) => Name.endsWith(".scss"))) {
		copyFileSync(Path.join(Source, Name), Path.join(Target, Name));
	}
	writeFileSync(Path.join(Target, "Base.css"), Compile(Path.join(Source, "Base.scss")));
	console.log("material ok");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	switch (true) {
		case process.argv.includes("--material"): {
			Material();
			break;
		}
		default:
			console.error("usage: node Maintain/Build/Stylesheet/Index.mjs --material");
			process.exit(2);
	}
}
