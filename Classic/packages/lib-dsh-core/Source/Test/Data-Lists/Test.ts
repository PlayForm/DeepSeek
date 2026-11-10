import assert from "node:assert/strict";

import { Default, Section } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the two exported data lists.
 *
 * @remarks
 *
 * The test asserts the lists carry their exact contents - Section (the
 * canonical npm dependency sections) and Default (the built-in exclusion
 * segments, anywhere mode, exclusion-first).
 *
 * The file runs standalone (`node Target/Test/Data-Lists/Test.js`) AND under
 * the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it). It is a unit
 * smoke of `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: the data lists.
	{
		const Sub = "Section: the canonical npm dependency sections";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(
					Section,
					["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"],
					"the canonical npm dependency sections",
				);
			});
		}
	}
	{
		const Sub = "Default: the built-in exclusion segments (anywhere mode, exclusion-first)";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(
					Default,
					["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"],
					"the built-in exclusion segments",
				);
			});
		}
	}
	return Finish(Count, "Data-Lists");
};

// Standalone entry: `node Target/Test/Data-Lists/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Data-Lists`);
}
