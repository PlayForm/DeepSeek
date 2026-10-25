#!/usr/bin/env node
//===============================================================================
// Maintain/Publish/Packages/Index.mjs - publish every unpublished workspace package, in
// dependency order.
//===============================================================================
//
// The order is DERIVED from the workspace's own dependency graph: a package
// publishes only after every workspace package it depends on, so the registry
// never receives a tarball whose @playform dependency is missing.
//
// A version already on the registry is SKIPPED - a published version is
// immutable, so a re-run is safe. A package whose dependency failed to publish
// is BLOCKED, never published against a missing dependency.
//
// Usage:
//   node Maintain/Publish/Packages/Index.mjs                  # publish, in order
//   node Maintain/Publish/Packages/Index.mjs --dry-run        # print the plan only
//   node Maintain/Publish/Packages/Index.mjs --layer 2        # one layer only
//   node Maintain/Publish/Packages/Index.mjs --no-provenance  # a local run (no OIDC)
//===============================================================================
import Packages from "../../Common/Function/Packages.mjs";
import Probe from "../../Common/Function/Probe.mjs";
import Trees from "../../Common/Variable/Trees.mjs";
import Depend from "./Function/Depend.mjs";
import Depth from "./Function/Depth.mjs";
import Layer from "./Function/Layer.mjs";
import Publish from "./Function/Publish.mjs";

const Scope = "@playform/";

const DryRun = process.argv.includes("--dry-run");
const NoProvenance = process.argv.includes("--no-provenance");
const LayerArgument = process.argv.indexOf("--layer");
const OnlyLayer =
	LayerArgument === -1 ? null : Number.parseInt(process.argv[LayerArgument + 1], 10);

const Flags = NoProvenance
	? ["--access", "public", "--ignore-scripts"]
	: ["--provenance", "--access", "public", "--ignore-scripts"];

const Inventory = Trees.flatMap((Tree) =>
	Packages(Tree).map((Package) => ({ ...Package, Deps: Depend(Package.Manifest, Scope) })),
).sort((Left, Right) => Left.Name.localeCompare(Right.Name));

const Graph = Depth(Inventory);

if (Graph.Cycles.length > 0) {
	console.error(`Dependency cycle(s) in the workspace: ${Graph.Cycles.join("; ")}`);
	process.exit(1);
}

const Layers = Layer(Inventory, Graph.Depth);
const Documents = await Probe(Inventory);

const Failed = new Set();
const Blocked = new Set();
let Published = 0;
let Skipped = 0;

for (const [Index, Group] of Layers.entries()) {
	if (OnlyLayer !== null && OnlyLayer !== Index) {
		continue;
	}
	console.log(`\nL${Index} - ${Group.length} package(s)`);
	for (const Package of Group) {
		const Unpublished = Package.Deps.find((Name) => Failed.has(Name) || Blocked.has(Name));
		if (Unpublished !== undefined) {
			Blocked.add(Package.Name);
			console.log(
				`BLOCK  ${Package.Name}@${Package.Version} (${Unpublished} is unpublished)`,
			);
			continue;
		}
		if (Documents.get(Package.Name)?.versions?.[Package.Version] !== undefined) {
			Skipped += 1;
			console.log(`SKIP   ${Package.Name}@${Package.Version} (already on the registry)`);
			continue;
		}
		if (DryRun) {
			console.log(`DRY    ${Package.Name}@${Package.Version}`);
			continue;
		}
		if (Publish(Package, Flags)) {
			Published += 1;
		} else {
			Failed.add(Package.Name);
		}
	}
}

console.log(
	`\n${Published} published, ${Skipped} skipped, ${Blocked.size} blocked, ${Failed.size} failed.`,
);

if (Failed.size > 0 || Blocked.size > 0) {
	process.exit(1);
}
