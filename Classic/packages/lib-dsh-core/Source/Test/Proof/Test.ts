import assert from "node:assert/strict";

import { Proof } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the mount-proof composer.
 *
 * @remarks
 *
 * The test covers the three shapes: the live summary joining the module's own
 * pairs, the byte-exact disabled marker, and the pair grammar the composer
 * inherits from `Activate` (the bare segment, the empty-string value and the
 * absent pair).
 *
 * The file runs standalone (`node Target/Test/Proof/Test.js`) AND under the
 * aggregate (`Maintain/Run/Smokes/Index.mjs`). It is a unit smoke of
 * `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Proof - the mount proof (live summary, disabled marker, pair grammar).
	{
		const Sub = "Proof: the mount proof (live summary, disabled marker, pair grammar)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					Proof(true, [
						["bundle", "0.2.1"],
						["cap", "3"],
					]),
					"activated (bundle=0.2.1, cap=3)",
					"the live summary joins the pairs",
				);
				assert.equal(
					Proof(false, [["bundle", "0.2.1"]]),
					"disabled (enabled=false)",
					"the disabled marker is byte-exact",
				);
				assert.equal(
					Proof(true, [
						["", "anywhere mode"],
						["replacement", ""],
					]),
					"activated (anywhere mode, replacement=)",
					"the bare segment and the empty-string value survive",
				);
				assert.equal(
					Proof(true, [["cap", undefined]]),
					"activated ()",
					"an absent pair is skipped",
				);
			});
		}
	}
	return Finish(Count, "Proof");
};

// Standalone entry: `node Target/Test/Proof/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Proof`);
}
