#!/usr/bin/env node
//===============================================================================
// Maintain/Generate/Placeholders/Index.mjs - the derived 0.0.0 empty-first-publish scaffold.
//===============================================================================
//
// A trusted publisher binds only to a package that already exists on the npm
// registry, so every new @playform name needs ONE permanent 0.0.0 placeholder
// publish before .github/workflows/NPM.yml can publish the real version over
// OIDC (Documentation/Plans/TRUSTED-PUBLISHER.md).
//
// The scaffold is DERIVED, never hand-maintained: every package under
// Classic/packages and EffectTS/packages is read from its own package.json and
// classified against the registry, so a package added to a tree appears here on
// the next run.
//
//   1-missing      absent from the registry - needs the 0.0.0 placeholder
//   2-placeholder  on the registry, but the repo version is not published yet
//   3-published    the repo version is already on the registry
//
// Usage:
//   node Maintain/Generate/Placeholders/Index.mjs             # probe, print, write nothing
//   node Maintain/Generate/Placeholders/Index.mjs --write     # probe and write the scaffold
//   node Maintain/Generate/Placeholders/Index.mjs --offline   # inventory only, no probe
//===============================================================================
import Packages from "../../Common/Function/Packages.mjs";
import Probe from "../../Common/Function/Probe.mjs";
import Trees from "../../Common/Variable/Trees.mjs";
import Report from "./Function/Report.mjs";
import Row from "./Function/Row.mjs";
import Write from "./Function/Write.mjs";
import Tiers from "./Variable/Tiers.mjs";

const Offline = process.argv.includes("--offline");
const Writing = process.argv.includes("--write");

const Workspace = Trees.flatMap((Tree) => Packages(Tree)).sort((Left, Right) =>
	Left.Name.localeCompare(Right.Name),
);

if (Offline && Writing) {
	console.error("--offline cannot classify the tiers; drop --write or drop --offline.");
	process.exit(1);
}

if (Offline) {
	console.log(`${Workspace.length} package(s) in the workspace (the registry was not probed).`);
	for (const Package of Workspace) {
		console.log(`  ${Package.Name}  [${Package.Tree}]  ${Package.Version}`);
	}
	process.exit(0);
}

const Documents = await Probe(Workspace);
const Rows = Workspace.map((Package) => Row(Package, Documents.get(Package.Name)));

Rows.sort(
	(Left, Right) =>
		Tiers.indexOf(Left.Tier) - Tiers.indexOf(Right.Tier) || Left.Name.localeCompare(Right.Name),
);

Report(Rows);

if (!Writing) {
	console.log("\nDry run - nothing written. Re-run with --write to emit the scaffold.");
	process.exit(0);
}

Write(Rows);
