import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import Output from "../Variable/Output.mjs";
import Manifest from "./Manifest.mjs";
import Publish from "./Publish.mjs";
import Readme from "./Readme.mjs";
import Scaffold from "./Scaffold.mjs";

export default (Rows) => {
	const Count = Scaffold(Rows);
	writeFileSync(join(Output, "MANIFEST.json"), Manifest(Rows));
	writeFileSync(join(Output, "README.md"), Readme(Rows));
	writeFileSync(join(Output, "Publish.sh"), Publish());
	chmodSync(join(Output, "Publish.sh"), 0o755);
	console.log(`\nWrote the scaffold to ${Output}`);
	console.log(`  ${join(Output, "MANIFEST.json")}`);
	console.log(`  ${join(Output, "README.md")}`);
	console.log(`  ${join(Output, "Publish.sh")}`);
	console.log(`  ${join(Output, "1-missing")} (${Count} placeholder manifest(s))`);
};
