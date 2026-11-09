#!/usr/bin/env node
// Maintain/Generate/Stylesheet/Index.mjs - the shared sheet compiler.
//
// Every UI plugin hand-authors Source/Stylesheet/Plugin.scss and commits its
// compiled twin Source/Variable/Styles.ts, so a fresh checkout type-checks and
// builds without a generation step. This script is the one generator: it scans
// both release trees for the sheet, so the roster is the tree and never a list.
// Four modes:
//
//   (no flag)    compile every sheet, write every twin, print "written
//                <relative package dir>" per package and a final "N twins".
//   --check      compile and compare instead of writing; print PASS/FAIL per
//                package, then "N checked, M stale"; exit 1 on any drift.
//   --validate   compile only the material's Base.scss and print "material
//                ok" - the material package's prepublishOnly gate.
//   <directory>  operate on one package directory (a plugin's prepublishOnly
//                runs --check . from inside the package); the path resolves
//                against process.cwd(). Flags may precede or follow it.
//
// sass-embedded is the compiler because the Dart-JS `sass` package crashes on
// Node 26 the moment it resolves an imported path, while the embedded native
// compiler resolves the material through the root node_modules cleanly.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "sass-embedded";

const Root = Path.resolve(Path.dirname(fileURLToPath(import.meta.url)), "../../..");
const Sheet = "Source/Stylesheet/Plugin.scss";
const Twin = "Source/Variable/Styles.ts";
const Trees = ["Classic/packages", "EffectTS/packages"];
const Material = "Classic/packages/style-dsh-material";
const Header = [
	"// Generated from Source/Stylesheet/Plugin.scss by",
	"// Maintain/Generate/Stylesheet/Index.mjs. Edit the .scss and run",
	"// `pnpm stylesheets`; never hand-edit this file.",
].join("\n");

function Relative(Directory) {
	return Path.relative(Root, Directory);
}

function Escape(Css) {
	const Slashes = Css.replaceAll("\\", "\\\\");
	const Ticks = Slashes.replaceAll("`", "\\`");
	return Ticks.replaceAll("${", "\\${");
}

function CompileSheet(File, Directory) {
	try {
		return compile(File, {
			loadPaths: [Path.join(Root, "node_modules")],
			style: "expanded",
			charset: false,
		}).css;
	} catch (Failure) {
		console.error(`FAIL ${Directory}: ${Failure.message}`);
		process.exitCode = 1;
		return null;
	}
}

function Generate(Directory) {
	const Css = CompileSheet(Path.join(Directory, Sheet), Relative(Directory));
	if (Css === null) return null;
	return `${Header}\nexport default \`\n${Escape(Css)}\`;\n`;
}

function Discover() {
	return Trees.flatMap((Tree) => {
		const Directory = Path.join(Root, Tree);
		if (!existsSync(Directory)) return [];
		return readdirSync(Directory, { withFileTypes: true })
			.filter((Entry) => Entry.isDirectory())
			.map((Entry) => Path.join(Directory, Entry.name))
			.filter((Package) => existsSync(Path.join(Package, Sheet)));
	});
}

function Write(Packages) {
	let Count = 0;
	for (const Package of Packages) {
		const Text = Generate(Package);
		if (Text === null) continue;
		writeFileSync(Path.join(Package, Twin), Text);
		console.log(`written ${Relative(Package)}`);
		Count += 1;
	}
	console.log(`${Count} twins`);
}

function Check(Packages) {
	let Stale = 0;
	for (const Package of Packages) {
		const Directory = Relative(Package);
		const Text = Generate(Package);
		if (Text === null) {
			Stale += 1;
			continue;
		}
		const TwinFile = Path.join(Package, Twin);
		const Current = existsSync(TwinFile) ? readFileSync(TwinFile, "utf8") : null;
		if (Current === Text) {
			console.log(`PASS ${Directory}`);
			continue;
		}
		console.log(`FAIL ${Directory} (stale twin; run pnpm stylesheets)`);
		Stale += 1;
	}
	console.log(`${Packages.length} checked, ${Stale} stale`);
	return Stale === 0;
}

function Validate() {
	const File = Path.join(Root, Material, "Source/Stylesheet/Base.scss");
	const Css = CompileSheet(File, Material);
	if (Css === null) return false;
	console.log("material ok");
	return true;
}

const Arguments = process.argv.slice(2);
const Flags = Arguments.filter((Argument) => Argument.startsWith("--"));
const Positional = Arguments.filter((Argument) => !Argument.startsWith("--"));
const Known = new Set(["--check", "--validate"]);

if (Flags.some((Flag) => !Known.has(Flag))) {
	console.error("Usage: node Maintain/Generate/Stylesheet/Index.mjs [--check|--validate] [dir]");
	process.exit(2);
}

const Targets = () =>
	Positional.length === 0 ? Discover() : [Path.resolve(process.cwd(), Positional[0])];

switch (true) {
	case Flags.includes("--validate"):
		if (!Validate()) process.exit(1);
		break;
	case Flags.includes("--check"):
		if (!Check(Targets())) process.exit(1);
		break;
	default:
		Write(Targets());
}
