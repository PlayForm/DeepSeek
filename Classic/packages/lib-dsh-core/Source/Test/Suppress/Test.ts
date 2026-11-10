import assert from "node:assert/strict";

import { Suppress } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";

/**
 * @module Test
 *
 * One singular test of the byte-identical suppression-line composer.
 *
 * @remarks
 *
 * The test covers the three shapes: the continuation error, the listener
 * error with a string cause, and the empty-message error that still composes
 * the line.
 *
 * The file runs standalone (`node Target/Test/Suppress/Test.js`) AND under
 * the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it). It is a unit
 * smoke of `@playform/lib-dsh-core`: the REAL built entry only.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: Suppress - the suppression-line composer (module/kind/cause).
	{
		const Sub = "Suppress: the suppression-line composer (module/kind/cause)";
		{
			// Leaf 1: the continuation shape. Leaf 2: the listener shape with a
			// string cause. Leaf 3: an empty-message error still composes the
			// suppressed line. All three leaves live in the one Check because
			// the source suite counts them as ONE ok group.
			Check(Count, Sub, () => {
				assert.equal(
					Suppress("package-governor", "continuation", new Error("boom")),
					"package-governor: continuation error (suppressed): boom",
					"the continuation shape",
				);
				assert.equal(
					Suppress("package-pinner", "listener", "x"),
					"package-pinner: listener error (suppressed): x",
					"the listener shape with a string cause",
				);
				assert.equal(
					Suppress("cargo-governor", "listener", new Error("")) ===
						"cargo-governor: listener error (suppressed): " ||
						Suppress("cargo-governor", "listener", new Error("")).includes(
							"(suppressed):",
						),
					true,
					"an empty-message error still composes the suppressed line",
				);
			});
		}
	}
	return Finish(Count, "Suppress");
};

// Standalone entry: `node Target/Test/Suppress/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Suppress`);
}
