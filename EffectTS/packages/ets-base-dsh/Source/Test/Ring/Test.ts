import assert from "node:assert/strict";

import { Ring } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the bounded ring.
 *
 * @remarks
 *
 * The test covers the three rules: an entry under the cap is appended and
 * nothing is dropped, an entry over the cap drops the oldest and returns it, and
 * a cap that shrank below the array length drops from the front until the bound
 * holds and returns the last entry dropped.
 *
 * The file runs standalone (`node Target/Test/Ring/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/ets-base-dsh`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Ring - the bounded ring (append, evict the oldest, honour a shrunken cap).
	{
		const Sub = "Ring: the bounded ring (append, evict the oldest, honour a shrunken cap)";
		{
			Check(Count, Sub, () => {
				const Entries = [1, 2];
				assert.equal(Ring(Entries, 3, 5), undefined, "under the cap nothing is dropped");
				assert.deepEqual(Entries, [1, 2, 3], "the entry is appended at the end");
				assert.equal(Ring(Entries, 4, 3), 1, "over the cap the oldest is dropped and returned");
				assert.deepEqual(Entries, [2, 3, 4], "the ring keeps the newest Cap entries");
				const Shrunk = [1, 2, 3, 4, 5];
				assert.equal(Ring(Shrunk, 6, 2), 4, "a shrunken cap drops until the bound holds");
				assert.deepEqual(Shrunk, [5, 6], "only the newest Cap entries survive");
			});
		}
	}
	return Finish(Count, "Ring");
};

// Standalone entry: `node Target/Test/Ring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Ring`);
}
