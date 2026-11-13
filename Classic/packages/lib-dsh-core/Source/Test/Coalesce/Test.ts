import assert from "node:assert/strict";

import { Coalesce } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the repeat-event coalescer.
 *
 * @remarks
 *
 * The test covers the four rules: the first sighting processes, the same
 * version inside the window is dropped, a different version (or the same
 * version outside the window) processes, and a first sighting past the cap
 * still processes because a missing entry always processes.
 *
 * The file runs standalone (`node Target/Test/Coalesce/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Coalesce - the repeat-event guard (window, cap, last-version-wins).
	{
		const Sub = "Coalesce: the repeat-event guard (window, cap, last-version-wins)";
		{
			Check(Count, Sub, () => {
				const Seen = new Map<string, { version: string; at: number }>();
				assert.equal(
					Coalesce(Seen, "/a", "v1", () => 1000),
					false,
					"the first sighting processes",
				);
				assert.equal(
					Coalesce(Seen, "/a", "v1", () => 1500),
					true,
					"the same version inside the window is dropped",
				);
				assert.equal(
					Coalesce(Seen, "/a", "v2", () => 1600),
					false,
					"a different version processes",
				);
				assert.equal(
					Coalesce(Seen, "/a", "v2", () => 5000),
					false,
					"the same version outside the window processes",
				);
				assert.equal(
					Coalesce(Seen, "/b", "v1", () => 1001),
					false,
					"a first sighting of another path processes",
				);
				const Small = new Map<string, { version: string; at: number }>();
				for (const Index of [0, 1, 2]) {
					Coalesce(Small, `/p${Index}`, "v1", () => 1000, 2000, 2);
				}
				assert.equal(Small.size <= 2, true, "the map is capped");
				assert.equal(
					Coalesce(Small, "/p9", "v1", () => 1000, 2000, 2),
					false,
					"a first sighting past the cap still processes",
				);
			});
		}
	}
	return Finish(Count, "Coalesce");
};

// Standalone entry: `node Target/Test/Coalesce/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Coalesce`);
}
