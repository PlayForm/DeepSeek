// The stylesheet build step: one sass compile, shared by the client bundler
// (which turns a plugin's Source/Stylesheet/Plugin.scss into the string its
// injector mounts) and the material's own publish build (which copies the
// partials to Target and compiles the base CSS there).
//
// The Dart-JS `sass` package crashes on Node 26 the moment it resolves an
// imported path, so the compiler is sass-embedded.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import * as Path from "node:path";

import type { Plugin } from "esbuild";
import { compile } from "sass-embedded";

// Every existing `node_modules` directory from `Directory` up to the file
// system root, nearest first: a standalone package resolves its own
// dependencies, and a hoisted monorepo resolves the root one.
function Resolve(Directory: string): string[] {
	const Paths: string[] = [];
	let Current = Path.resolve(Directory);
	while (true) {
		const Candidate = Path.join(Current, "node_modules");
		if (existsSync(Candidate)) Paths.push(Candidate);
		const Parent = Path.dirname(Current);
		if (Parent === Current) break;
		Current = Parent;
	}
	return Paths;
}

/** The CSS text of one sheet, with the material resolved through the package's load paths. */
export function Compile(File: string, LoadPaths: string[]): string {
	return compile(File, {
		loadPaths: LoadPaths,
		style: "expanded",
		charset: false,
	}).css;
}

/** The esbuild plugin: every `.scss` resolves to a JS module exporting its CSS. */
export default function Stylesheet(Directory: string): Plugin {
	const Paths = Resolve(Directory);
	return {
		name: "Stylesheet",
		setup(Build) {
			Build.onResolve({ filter: /\.scss$/ }, (Arguments) => ({
				path: Path.resolve(Arguments.resolveDir, Arguments.path),
				namespace: "stylesheet",
			}));
			Build.onLoad({ filter: /.*/, namespace: "stylesheet" }, (Arguments) => ({
				contents: `export default ${JSON.stringify(Compile(Arguments.path, Paths))}`,
				loader: "js",
			}));
		},
	};
}

// The material's build: its public surface is Target, so the partials are
// copied there for the plugins' `@use`, and Base.scss compiles to the one CSS
// artifact a non-sass consumer can read.
export function Publish(Directory: string): void {
	const Root = Path.resolve(Directory);
	const Source = Path.join(Root, "Source/Stylesheet");
	const Target = Path.join(Root, "Target/Stylesheet");
	rmSync(Target, { recursive: true, force: true });
	mkdirSync(Target, { recursive: true });
	for (const Name of readdirSync(Source).filter((Name) => Name.endsWith(".scss"))) {
		copyFileSync(Path.join(Source, Name), Path.join(Target, Name));
	}
	writeFileSync(
		Path.join(Target, "Base.css"),
		Compile(Path.join(Source, "Base.scss"), Resolve(Root)),
	);
	console.log("material ok");
}
