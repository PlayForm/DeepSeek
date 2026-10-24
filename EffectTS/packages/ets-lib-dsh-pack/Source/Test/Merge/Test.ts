// Source/Test/Merge/Test.ts - the merge rules in isolation: families by
// id, targets by path, scalars replace, arrays replace, and the section
// objects merge key by key. Pure object fixtures: no filesystem.
import assert from "node:assert/strict";

import { Check, Finish, Library, MakeCounter } from "../Harness.js";

/** One family row with the given priority/threshold/targets. */
const Family = (
	Priority: number,
	Threshold: number,
	Targets: Library.Target[],
	Rule = "rule",
) => ({
	id: "Plan",
	priority: Priority,
	threshold: Threshold,
	note: "",
	familyGlobs: [],
	signals: [{ rule: Rule, pattern: Rule, weight: 1 }],
	targets: Targets,
});

/** One target row. */
const Target = (Path: string, Reason: string): Library.Target => ({
	path: Path,
	kind: "doc",
	prior: 1,
	reason: Reason,
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	const Base: Library.Pack = {
		signature: ["a", "b"],
		families: {
			"doc/Plan": Family(1, 0.75, [Target("A", "a"), Target("B", "b")], "one"),
			"doc/Guide": Family(2, 0.75, [Target("G", "g")], "guide"),
		},
		indexer: { scope: ["a"], excludes: ["x"], maxFiles: 10 },
		policy: { write: "approve", read: "auto" },
	};
	const Override: Library.Pack = {
		signature: ["c"],
		families: {
			"doc/Plan": {
				...Family(5, 0.5, [Target("B", "b2"), Target("C", "c")], "two"),
			},
			"doc/Index": Family(3, 0.75, [Target("I", "i")], "index"),
		},
		indexer: { scope: ["b"], languages: ["ts"] },
		policy: { write: "auto" },
	};

	const Merged = Library.Merge(Base, Override);

	Check(Count, "M1: families merge by id and the override's scalars win", () => {
		const Plan = Merged.families?.["doc/Plan"];
		assert.equal(Plan?.priority, 5);
		assert.equal(Plan?.threshold, 0.5);
		assert.equal(Plan?.signals.length, 1);
		assert.equal(Plan?.signals[0]?.rule, "two");
	});

	Check(Count, "M2: targets merge by path (replace in place, append the new)", () => {
		const Plan = Merged.families?.["doc/Plan"];
		assert.deepEqual(
			Plan?.targets.map((Row) => Row.path),
			["A", "B", "C"],
		);
		assert.equal(Plan?.targets[1]?.reason, "b2");
	});

	Check(Count, "M3: a family absent from the override is kept", () => {
		assert.equal(Merged.families?.["doc/Guide"]?.priority, 2);
		assert.equal(Merged.families?.["doc/Index"]?.priority, 3);
	});

	Check(Count, "M4: arrays replace (the signature is the override's list)", () => {
		assert.deepEqual(Merged.signature, ["c"]);
	});

	Check(Count, "M5: nested section objects merge key by key", () => {
		assert.deepEqual(Merged.indexer, {
			scope: ["b"],
			excludes: ["x"],
			maxFiles: 10,
			languages: ["ts"],
		});
	});

	Check(Count, "M6: the policy map merges per action", () => {
		assert.equal(Merged.policy?.["write"], "auto");
		assert.equal(Merged.policy?.["read"], "auto");
	});

	Check(Count, "M7: a duplicate override path keeps the last override row", () => {
		const Duplicate = Library.Merge(
			{ families: { "doc/Plan": Family(1, 0.75, [Target("A", "base")]) } },
			{ families: { "doc/Plan": Family(1, 0.75, [Target("A", "one"), Target("A", "two")]) } },
		);
		assert.deepEqual(
			Duplicate.families?.["doc/Plan"]?.targets.map((Row) => Row.reason),
			["two"],
		);
	});

	Check(Count, "M8: an override with no families keeps the base families", () => {
		const Kept = Library.Merge(Base, { signature: ["z"] });
		assert.equal(Kept.families?.["doc/Plan"]?.priority, 1);
		assert.deepEqual(Kept.signature, ["z"]);
	});

	return Finish(Count, "Merge");
};

// Standalone entry: `node Target/Test/Merge/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Merge`);
}
