// Reconcile - THE RECONCILIATION (the completion spec's wave 2c re-spec for
// this package, Documentation/Plans/Completion-Spec/03-SUGGESTERS.md): on a
// judged call in a package, compare the package's SMOKE CLAIMS with the tree
// it actually has.
//
// THE THREE EVIDENCE SETS:
//   * the CLAIMS   - each `Source/Test/<Folder>/README.md`'s
//                    `## Expected count` (Function/Counts, the aggregate
//                    runner's own parse);
//   * the TREE     - the folders that actually exist, each folder's `Test.ts`,
//                    and the aggregate runner's roster (Function/Roster: the
//                    built `Target/Test/<Folder>/Test.js` folders);
//   * the INDEX    - when the workspace graph is present, its `Test` nodes for
//                    the package (Function/Nodes; an unpopulated graph simply
//                    contributes nothing).
//
// THE DRIFTS (each names ONE file and the two counts; the note text is
// Function/Reconciled):
//   1. `no "## Expected count"`            - a folder with no claim;
//   2. `the README count has no Test.ts`   - a claim whose suite is gone;
//   3. `not in the aggregate runner's roster` - a suite the runner never runs;
//   4. `the graph's Test node has no file` - an index claim the tree dropped.
//
// READ-ONLY BY CONSTRUCTION: this module reads with node:fs (never ctx.fs -
// the hook's purity contract) and returns a description; it never writes,
// never fixes, and never throws (a package without a smoke tree answers
// `undefined` - the documented silence).
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, sep } from "node:path";

import type Drift from "@Interface/Drift.js";
import type { Reconciliation } from "@Interface/Drift.js";

import Counts from "./Counts.js";
import Folders from "./Folders.js";
import Roster from "./Roster.js";

/**
 * The repo-relative display of a path (a relative one is already displayable;
 * the workspace root itself displays as its own name).
 */
const Display = (Root: string, Path: string): string => {
	const Shown = isAbsolute(Path) ? relative(Root, Path) : Path;
	return (Shown.length === 0 ? basename(Path) : Shown).split(sep).join("/");
};

/** The declared count of one folder's README, or undefined (no claim). */
const Declared = (Readme: string): number | undefined => {
	try {
		return Counts(readFileSync(Readme, "utf8"));
	} catch {
		return undefined;
	}
};

export default (
	/** The package root (already resolved by Function/Package). */
	PackageRoot: string,
	/** The resolved workspace root (the display base). */
	Root: string,
	/** The graph's Test node paths for the package (empty when absent). */
	Nodes: string[],
): Reconciliation | undefined => {
	const TestRoot = join(PackageRoot, "Source", "Test");
	switch (true) {
		case statSync(TestRoot, { throwIfNoEntry: false })?.isDirectory() !== true:
			return undefined;
		default:
	}
	const Roster_ = Roster(PackageRoot);
	const Drifts: Drift[] = [];
	let Expected = 0;
	let Actual = 0;
	for (const Folder of Folders(TestRoot)) {
		const Readme = join(TestRoot, Folder, "README.md");
		const Suite = join(TestRoot, Folder, "Test.ts");
		const Claimed = Declared(Readme);
		// Every CLAIM counts toward the package's expected total, whether or
		// not the tree supports it; only the folders the runner will really
		// run count toward the actual total.
		if (Claimed !== undefined) {
			Expected += Claimed;
		}
		switch (true) {
			case Claimed === undefined:
				Drifts.push({
					file: Display(Root, Readme),
					reason: 'no "## Expected count"',
					expected: 0,
					actual: 0,
				});
				break;
			case !existsSync(Suite):
				Drifts.push({
					file: Display(Root, Suite),
					reason: "the README count has no Test.ts",
					expected: Claimed,
					actual: 0,
				});
				break;
			case !Roster_.has(Folder):
				Drifts.push({
					file: Display(Root, join(PackageRoot, "Target", "Test", Folder, "Test.js")),
					reason: "not in the aggregate runner's roster",
					expected: Claimed,
					actual: 0,
				});
				break;
			default:
				Actual += Claimed;
		}
	}
	for (const Node_ of Nodes) {
		switch (true) {
			case existsSync(Node_):
				break;
			default:
				Drifts.push({
					file: Display(Root, Node_),
					reason: "the graph's Test node has no file",
					expected: 1,
					actual: 0,
				});
		}
	}
	return {
		package: Display(Root, PackageRoot),
		drifts: Drifts.sort((Left, Right) => Left.file.localeCompare(Right.file)),
		expected: Expected,
		actual: Actual,
		nodes: Nodes.length,
	};
};
