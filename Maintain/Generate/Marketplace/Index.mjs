#!/usr/bin/env node
//===============================================================================
// Maintain/Generate/Marketplace/Index.mjs - the static DSH plugin-market index generator.
//===============================================================================
//
// Builds the format-1 plugin market index from the two release trees
// (Classic/packages and EffectTS/packages) plus the npm registry, validates it
// with @deepseek-ai/dsh-plugin-market-index, and writes the SAME bytes to
// <root>/marketplace.json and <root>/Site/Public/marketplace.json.
//
// Usage:
//   node Maintain/Generate/Marketplace/Index.mjs           # generate and write
//   node Maintain/Generate/Marketplace/Index.mjs --check   # verify both files; never writes
//===============================================================================
import Packages from "../../Common/Function/Packages.mjs";
import Probe from "../../Common/Function/Probe.mjs";
import Trees from "../../Common/Variable/Trees.mjs";
import Index from "./Function/Index.mjs";
import Plugin from "./Function/Plugin.mjs";
import Report from "./Function/Report.mjs";
import Serialize from "./Function/Serialize.mjs";
import Write from "./Function/Write.mjs";

const Workspace = Trees.flatMap((Tree) => Packages(Tree));
const Documents = await Probe(Workspace);
const Plugins = Workspace.map((Package) => Plugin(Package, Documents.get(Package.Name)));
const Bytes = Serialize(Index(Plugins));

if (process.argv.includes("--check")) {
	if (Report(Bytes)) {
		process.exit(1);
	}
	console.log("marketplace.json is up to date");
} else {
	Write(Plugins, Bytes);
}
