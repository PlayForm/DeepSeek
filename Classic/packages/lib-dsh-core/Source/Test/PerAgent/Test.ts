import assert from "node:assert/strict";

import { PerAgent } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the per-agent registry.
 *
 * @remarks
 *
 * The test covers the four rules: one state per key, the state created once and
 * returned on every call, distinct keys holding distinct states, and every
 * no-agent call sharing the one default key.
 *
 * The file runs standalone (`node Target/Test/PerAgent/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: PerAgent - the per-agent registry (one state per key, lazy, default key).
	{
		const Sub = "PerAgent: the per-agent registry (one state per key, lazy, default key)";
		{
			Check(Count, Sub, () => {
				let Born = 0;
				const AgentOf = PerAgent(() => {
					Born += 1;
					return { born: Born };
				});
				const First = {};
				const Second = {};
				const One = AgentOf(First);
				assert.equal(AgentOf(First), One, "the same key returns the same state");
				assert.equal(AgentOf(Second) === One, false, "distinct keys hold distinct states");
				assert.equal(AgentOf(undefined), AgentOf(null), "every no-agent call shares one default state");
				assert.equal(Born, 3, "the factory runs once per distinct key");
				const Other = PerAgent(() => 0);
				assert.equal(Other(First), 0, "a second registry is independent");
			});
		}
	}
	return Finish(Count, "PerAgent");
};

// Standalone entry: `node Target/Test/PerAgent/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - PerAgent`);
}
