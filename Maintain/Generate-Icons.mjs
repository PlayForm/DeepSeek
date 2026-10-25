#!/usr/bin/env node

// Maintain/Generate-Icons.mjs - the icon CLI. With no flag it writes both SVG
// sets and the ledger; --check verifies the generated files against the tree
// and exits 1 on any drift; --report prints the genome table without writing.
// See Documentation/Brand/ICON-GRAMMAR.md section 10.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build, check, write } from "./Icon/Index.mjs";

// The repository root, resolved from this file's own location: the CLI runs
// from the repo root or from anywhere else, with no git dependency.
const Root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const Usage = [
	"Usage: node Maintain/Generate-Icons.mjs [--check | --report]",
	"",
	"\t(no flag)\tWrite Site/Public/Icons/<dir>.svg, Site/Public/Icons/Color/<dir>.svg and Maintain/Icon/Ledger.json.",
	"\t--check\tBuild in memory and report every missing or differing file; exit 1 on any drift.",
	"\t--report\tPrint the genome table (package, kind, tree, order, arms, rings, seed); no writes.",
].join("\n");

const Known = new Set(["--check", "--report"]);
const Flags = process.argv.slice(2);
for (const Flag of Flags) {
	if (!Known.has(Flag)) {
		process.stderr.write(`${Usage}\n`);
		process.exit(2);
	}
}

const pad = (Value, Width) => String(Value).padEnd(Width);

if (Flags.includes("--check")) {
	const { ok, missing, stale } = check(Root);
	for (const Path of missing) {
		console.log(`STALE: ${Path} is missing`);
	}
	for (const Path of stale) {
		console.log(`STALE: ${Path} differs from the generated file`);
	}
	if (!ok) {
		process.exit(1);
	}
	console.log("All generated icon files are up to date.");
} else if (Flags.includes("--report")) {
	const { genomes } = build(Root);
	console.log(
		`${pad("package", 46)}${pad("kind", 8)}${pad("tree", 10)}${pad("order", 7)}${pad("arms", 6)}${pad("rings", 7)}seed`,
	);
	for (const Genome of genomes) {
		console.log(
			[
				pad(Genome.package, 46),
				pad(Genome.kind, 8),
				pad(Genome.tree, 10),
				pad(Genome.plan?.order ?? "-", 7),
				pad(Genome.plan?.arms ?? 0, 6),
				pad(Genome.plan?.rings ?? Genome.plan?.mutations?.rings ?? 0, 7),
				Genome.seed.slice(0, 8),
			].join(""),
		);
	}
} else {
	const { genomes } = build(Root);
	const { written } = write(Root);
	const Classic = genomes.filter((Genome) => Genome.tree === "Classic").length;
	const kindCount = (Kind) => genomes.filter((Genome) => Genome.kind === Kind).length;
	console.log(
		`Packages: ${genomes.length} (Classic ${Classic}, EffectTS ${genomes.length - Classic}; ` +
			`hook ${kindCount("hook")}, plugin ${kindCount("plugin")}, ` +
			`client ${kindCount("client")}, lib ${kindCount("lib")})`,
	);
	console.log(
		`Wrote ${written} files (mono ${genomes.length}, colour ${genomes.length}, ledger 1).`,
	);
}
