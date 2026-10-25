import Path from "node:path";

import Root from "../../../Common/Function/Root.mjs";
import BaselinePath from "../Variable/BaselinePath.mjs";
import Guarded from "./Guarded.mjs";

// CHECK: compare every guarded file with the baseline. Any missing baseline,
// missing file, missing entry or differing hash is drift.
export default (Entries, Baseline) => {
	if (Baseline === null) {
		console.error(
			`FAIL - baseline ${Path.relative(Root, BaselinePath)} is missing; generate it with: node Maintain/Check/Overpass-Drift/Index.mjs --update`,
		);
		return 1;
	}

	let Failed = 0;
	for (const Entry of Entries) {
		const Drift = [];
		const Missing = [];
		const New = [];
		for (const Flavor of Guarded(Entry.cluster)) {
			const Current = Entry.files[Flavor];
			const Expected = Baseline.files?.[Current.file];
			switch (true) {
				case Current.hash === null:
					Missing.push(Flavor);
					break;
				case Expected === undefined:
					New.push(Flavor);
					break;
				case Expected !== Current.hash:
					Drift.push(Flavor);
					break;
			}
		}
		const FailedHere = Drift.length + Missing.length + New.length;
		const GuardedCount = Object.keys(Entry.files).length;
		switch (true) {
			case FailedHere === 0:
				console.log(
					`PASS ${Entry.tree} / ${Entry.cluster} (${GuardedCount}/${GuardedCount} files match)`,
				);
				break;
			default: {
				Failed += 1;
				console.log(
					`FAIL ${Entry.tree} / ${Entry.cluster} - ${Drift.length} drift, ${Missing.length} missing, ${New.length} not in baseline`,
				);
				for (const Flavor of Drift) {
					console.log(
						`  drift: ${Entry.files[Flavor].file} (baseline ${Baseline.files[Entry.files[Flavor].file].slice(0, 12)}..., now ${Entry.files[Flavor].hash.slice(0, 12)}...)`,
					);
				}
				for (const Flavor of Missing) {
					console.log(`  missing: ${Entry.files[Flavor].file}`);
				}
				for (const Flavor of New) {
					console.log(`  not in baseline: ${Entry.files[Flavor].file}`);
				}
			}
		}
	}

	if (Failed > 0) {
		console.error(
			`\nFAIL - overpass drift detected in ${Failed} tree/cluster group(s); fix the logic or, after an intended behavioral gate, run node Maintain/Check/Overpass-Drift/Index.mjs --update`,
		);
		return 1;
	}
	const GuardedTotal = Entries.reduce(
		(Total, Entry) => Total + Object.keys(Entry.files).length,
		0,
	);
	console.log(`\nPASS - all ${GuardedTotal} normalized hashes match the baseline.`);
	return 0;
};
