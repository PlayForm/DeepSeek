// Source/Test/Stability/Test.ts - the A5 invariants: re-indexing the
// unchanged file keeps every id and every fingerprint; changing one symbol
// changes that symbol's fingerprint, the file's and its block's, and leaves
// the other symbols' intact; the id set is unchanged across the edit; every
// node carries the file version token from stat time; the revision increments
// per successful index. Unit smoke of @playform/plugin-dsh-workspace-graph:
// the fake ctx + the REAL built class, from the Harness.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Check, Finish, MakeCounter, MakeGraph } from "../Harness.js";

const FIXTURE_TS = readFileSync(
	new URL("../../../Source/Test/Parse-And-Fingerprint/Fixture.ts", import.meta.url),
	"utf8",
);
// The edit: one symbol's body line changes, everything else stays.
const EDITED_TS = FIXTURE_TS.replace("return `hello ${name}`;", "return `hey ${name}`;");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Path = "/proj/src/stable.ts";
	const Fingerprints = (Run: any): Map<string, string> => {
		const Map_ = new Map<string, string>();
		for (const NodeItem of Run.Graph.snapshot().nodes) {
			Map_.set(NodeItem.id, NodeItem.fingerprint);
		}
		return Map_;
	};

	// Group: re-index the unchanged file.
	{
		const Run = MakeGraph({ enabled: true, files: { [Path]: FIXTURE_TS } });
		await Run.Graph.indexFile(Path);
		const First = Fingerprints(Run);
		await Run.Graph.indexFile(Path);
		const Second = Fingerprints(Run);
		Check(Count, "stability: re-indexing the unchanged file keeps every id and every fingerprint (A5)", () => {
			assert.equal(Second.size, First.size, "same node count");
			for (const [Id, Print] of First) {
				assert.equal(Second.get(Id), Print, `same fingerprint: ${Id}`);
			}
			assert.equal(Run.Graph.statistics().indexRevision, "2", "each successful index bumps the revision");
		});
	}

	// Group: edit one symbol, re-index.
	{
		const Run = MakeGraph({ enabled: true, files: { [Path]: FIXTURE_TS } });
		await Run.Graph.indexFile(Path);
		const Before = Fingerprints(Run);
		const BeforeIds = [...Before.keys()].sort();
		Run.files[Path] = EDITED_TS;
		await Run.Graph.indexFile(Path);
		const After = Fingerprints(Run);
		const Changed = [...Before.keys()].filter((Id) => After.get(Id) !== Before.get(Id));
		Check(Count, "stability: changing one symbol changes that symbol, its block and the file, and nothing else (A5)", () => {
			assert.deepEqual(
				Changed.sort(),
				[
					`Block:${Path}:7:body`,
					`File:${Path}`,
					`Symbol:${Path}:greet`,
				],
				"exactly the file, the changed symbol and its body block changed",
			);
			for (const Id of [`Symbol:${Path}:VERSION`, `Symbol:${Path}:Greeter`, `Symbol:${Path}:Shape`, `Symbol:${Path}:Alias`, `Symbol:${Path}:counter`]) {
				assert.equal(After.get(Id), Before.get(Id), `unchanged: ${Id}`);
			}
		});
		Check(Count, "stability: the id set is unchanged across the edit", () => {
			assert.deepEqual([...After.keys()].sort(), BeforeIds);
		});
		Check(Count, "stability: every node carries the file version token from stat time", () => {
			for (const NodeItem of Run.Graph.snapshot().nodes) {
				assert.equal(NodeItem.version, "v1", `version on ${NodeItem.id}`);
			}
		});
	}

	return Finish(Count, "Stability");
};

// Standalone entry: `node Target/Test/Stability/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Stability`);
}
