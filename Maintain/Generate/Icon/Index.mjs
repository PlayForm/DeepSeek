#!/usr/bin/env node

// Maintain/Generate/Icon/Index.mjs - the icon CLI. With no flag it writes both SVG
// sets and the ledger; --check verifies the generated files against the tree
// and exits 1 on any drift; --report prints the genome table without writing.
// See Documentation/Brand/ICON-GRAMMAR.md section 10.
import Root from "../../Common/Function/Root.mjs";
import Check from "./Function/Check.mjs";
import Report from "./Function/Report.mjs";
import Write from "./Function/Write.mjs";

const Usage = [
	"Usage: node Maintain/Generate/Icon/Index.mjs [--check | --report]",
	"",
	"\t(no flag)\tWrite Maintain/Icon/Asset/Mono/<dir>.svg, Maintain/Icon/Asset/Color/<dir>.svg and Maintain/Icon/Ledger.json.",
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

switch (true) {
	case Flags.includes("--check"):
		if (!Check(Root)) {
			process.exit(1);
		}
		break;
	case Flags.includes("--report"):
		Report(Root);
		break;
	default:
		Write(Root);
}
