// Source/Test/Data-Lists/Test.ts - one singular test: the two exported data
// lists carry their exact contents - Section (the canonical npm dependency
// sections) and Default (the built-in exclusion segments, anywhere mode,
// exclusion-first).
// Runs standalone (`node Target/Test/Data-Lists/Test.js`) AND under the
// aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/lib-dsh-core: the REAL built entry only.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Default, Section } from "../../../Target/Library.js";

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
