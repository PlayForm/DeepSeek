// Source/Test/Stage/Test.ts - THE STAGE CLASSIFIER (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 16.1): the six rules, in their exact order -
// a search locates, a restored touch reverts, a read after an edit verifies,
// a read after a read rereads, a first read reads, every mutating touch
// edits - and anything the classifier cannot place is a discovery, never a
// guess. The order itself is asserted where the rules could collide.
import assert from "node:assert/strict";

import Stage from "../../../Target/Function/Stage.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Check(Count, "B1: a search is a discovery, ahead of every other rule", () => {
		assert.equal(Stage([], "search", false), "discover");
		assert.equal(Stage(["edit"], "search", false), "discover");
		assert.equal(Stage([], "search", true), "discover");
	});
	Check(Count, "B1: a restored touch reverts, whatever the kind", () => {
		assert.equal(Stage([], "write", true), "revert");
		assert.equal(Stage(["read"], "read", true), "revert");
	});
	Check(Count, "B1: a read after a write or an edit verifies the change", () => {
		assert.equal(Stage(["edit"], "read", false), "verify");
		assert.equal(Stage(["write"], "read", false), "verify");
		assert.equal(Stage(["read", "edit"], "read", false), "verify");
	});
	Check(Count, "B1: a read after a read with no edit in between rereads", () => {
		assert.equal(Stage(["read"], "read", false), "reread");
		assert.equal(Stage(["read", "search"], "read", false), "reread");
	});
	Check(Count, "B1: a first read with no prior touches reads", () => {
		assert.equal(Stage([], "read", false), "read");
	});
	Check(Count, "B1: a write, an edit, a delete or a move edits", () => {
		assert.equal(Stage([], "write", false), "edit");
		assert.equal(Stage(["read"], "edit", false), "edit");
		assert.equal(Stage([], "delete", false), "edit");
		assert.equal(Stage([], "move", false), "edit");
	});
	Check(Count, "B1: anything the classifier cannot place is a discovery", () => {
		assert.equal(Stage([], "task", false), "discover");
		assert.equal(Stage(["read"], "", false), "discover");
	});
	return Finish(Count, "Stage");
};

// Standalone entry: `node Target/Test/Stage/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Stage`);
}
