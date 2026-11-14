import assert from "node:assert/strict";

import { Resume } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the monotonic resume rule.
 *
 * @remarks
 *
 * The test covers the three cases: a recovered value above the current one
 * wins, a recovered value below it is ignored (the counter never moves
 * backwards), and an equal value is a no-op.
 *
 * The file runs standalone (`node Target/Test/Resume/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Resume - the monotonic recovery rule (raise, never lower, no-op).
	{
		const Sub = "Resume: the monotonic recovery rule (raise, never lower, no-op)";
		{
			Check(Count, Sub, () => {
				assert.equal(Resume(0, 5), 5, "a recovered value above the current one wins");
				assert.equal(Resume(5, 2), 5, "a recovered value below it is ignored");
				assert.equal(Resume(5, 5), 5, "an equal value is a no-op");
			});
		}
	}
	return Finish(Count, "Resume");
};

// Standalone entry: `node Target/Test/Resume/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Resume`);
}
