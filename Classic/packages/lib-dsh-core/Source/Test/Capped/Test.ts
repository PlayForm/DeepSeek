import assert from "node:assert/strict";

import { Capped } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the eviction-line composer.
 *
 * @remarks
 *
 * The test pins the byte-exact template `capped <id> (max<Name> <cap>)` for the
 * three shapes the family writes: a path id with the stamp bound, an id with a
 * binding bound, and a batch id with the batch bound.
 *
 * The file runs standalone (`node Target/Test/Capped/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Capped - the eviction line (id, bound name, cap).
	{
		const Sub = "Capped: the eviction line (id, bound name, cap)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					Capped("/repo/src/a.ts", "Stamps", 3),
					"capped /repo/src/a.ts (maxStamps 3)",
					"the path id with the stamp bound",
				);
				assert.equal(
					Capped("ap-1", "Bindings", 2),
					"capped ap-1 (maxBindings 2)",
					"an id with the binding bound",
				);
				assert.equal(
					Capped("b1", "Batches", 0),
					"capped b1 (maxBatches 0)",
					"a zero cap renders",
				);
			});
		}
	}
	return Finish(Count, "Capped");
};

// Standalone entry: `node Target/Test/Capped/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Capped`);
}
