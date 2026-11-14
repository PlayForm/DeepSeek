#!/usr/bin/env node
//===============================================================================
// Maintain/Generate/Catalog/Index.mjs - the harness tool-catalog projection.
//===============================================================================
//
// Reads the DeepSeek Harness submodule's generated docs/tool-catalog.md and
// writes Source/Variable/Catalog.ts into both release trees: the static tool
// fallback the tool-coach composes its notes from when the live registry is
// unreachable or fetchLive is off.
//
// The harness owns the catalog: scripts/gen-tool-catalog.ts boots every tool
// plugin on a real context, reads ctx.tools.schemas(), and its own CI
// re-derives the file and fails when it is stale. This repository consumes that
// verified artifact from a pinned submodule commit instead of booting the
// harness or hand-maintaining a copy of its tool descriptions - the hand-written
// table this replaces had already drifted from the registry.
//
// Usage:
//   node Maintain/Generate/Catalog/Index.mjs                       # generate and write
//   node Maintain/Generate/Catalog/Index.mjs --check                # verify; never writes
//   node Maintain/Generate/Catalog/Index.mjs --source <path>        # read another catalog
//===============================================================================
import Parse from "./Function/Parse.mjs";
import Project from "./Function/Project.mjs";
import Read from "./Function/Read.mjs";
import Report from "./Function/Report.mjs";
import Serialize from "./Function/Serialize.mjs";
import Write from "./Function/Write.mjs";

const SourceIndex = process.argv.indexOf("--source");
const Source = SourceIndex < 0 ? undefined : process.argv[SourceIndex + 1];
if (SourceIndex >= 0 && Source === undefined) {
	console.error("catalog: --source needs a path to a tool-catalog.md");
	process.exit(1);
}

const Catalog = Read(Source);
const Tools = Project(Parse(Catalog.text));
const Bytes = Serialize(Tools);

if (process.argv.includes("--check")) {
	if (Report(Bytes)) {
		process.exit(1);
	}
	console.log(`catalog is up to date: ${Tools.length} tools from ${Catalog.path}`);
} else {
	Write(Tools, Bytes, Catalog.path);
}
