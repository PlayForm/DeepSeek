import FileSystem from "node:fs";
import Path from "node:path";

import Root from "../../../Common/Function/Root.mjs";
import BaselinePath from "../Variable/BaselinePath.mjs";
import Guarded from "./Guarded.mjs";

// UPDATE: record the current normalized hashes, deliberately. The per-group
// PASS lines say what was recorded; the summary names the baseline file.
export default (Entries) => {
	const Files = {};
	for (const Entry of Entries) {
		for (const Flavor of Guarded(Entry.cluster)) {
			Files[Entry.files[Flavor].file] = Entry.files[Flavor].hash;
		}
	}
	const Baseline = {
		version: 1,
		note: "Normalized hashes (comments stripped, whitespace collapsed) of the six stream flavors' Command/StepBatch/Overpass files plus normalize-file's StepBatch/Overpass arms (its Command is the unique files sweep and stays out). Regenerate only after an intended change passed its behavioral gate: node Maintain/Check/Overpass-Drift/Index.mjs --update",
		files: Files,
	};
	FileSystem.writeFileSync(BaselinePath, `${JSON.stringify(Baseline, null, "\t")}\n`, "utf8");
	for (const Entry of Entries) {
		console.log(
			`PASS ${Entry.tree} / ${Entry.cluster} (${Object.keys(Entry.files).length} files recorded)`,
		);
	}
	console.log(
		`\nUPDATED ${Path.relative(Root, BaselinePath)} (${Object.keys(Files).length} hashes).`,
	);
	return 0;
};
