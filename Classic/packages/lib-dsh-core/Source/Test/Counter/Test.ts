import assert from "node:assert/strict";

import { Counter } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the declared monotonic counter.
 *
 * @remarks
 *
 * The test covers the counter's whole contract: the initial value, `Next` as
 * the only way to advance, `Restore` raising the value and never lowering it
 * (the in-memory value is the floor), and two counters being independent (per
 * instance, never module-level).
 *
 * The file runs standalone (`node Target/Test/Counter/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Counter - the declared monotonic counter (Next advances, Restore raises and never lowers).
	{
		const Sub = "Counter: the declared monotonic counter (Next advances, Restore raises and never lowers)";
		{
			Check(Count, Sub, () => {
				const First = Counter();
				assert.equal(First.Value, 0, "a counter is born at the initial value (default 0)");
				assert.equal(First.Next(), 1, "Next advances and returns the new value");
				assert.equal(First.Value, 1, "the value read matches what Next returned");
				First.Restore(9);
				assert.equal(First.Value, 9, "a recovered value above the current one raises it");
				First.Restore(2);
				assert.equal(First.Value, 9, "a recovered value below it never lowers it");
				const Second = Counter(5);
				assert.equal(Second.Value, 5, "the initial value is the explicit floor");
				assert.equal(Second.Next(), 6, "the second counter advances on its own");
				assert.equal(First.Value, 9, "two counters are independent (per instance, never module-level)");
			});
		}
	}
	return Finish(Count, "Counter");
};

// Standalone entry: `node Target/Test/Counter/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Counter`);
}
