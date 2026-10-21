// Source/Test/Refusal/Test.ts - one singular test: the shared refusal guard -
// only the declared dependency sections may differ; a non-dependency section
// change is refused with the byte-identical refusal line.
// Runs standalone (`node Target/Test/Refusal/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-lib-dsh-core: the REAL built entry only.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Refusal, Section } from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Refusal - only the declared dependency sections may differ.
	{
		const Sub = "Refusal: the shared refusal guard (sections-only changes allowed)";
		{
			Check(Count, Sub, () => {
				const RefusalLines: string[] = [];
				const RAppend = (Message: string) => RefusalLines.push(Message);
				const Current = {
					name: "x",
					dependencies: { a: "^1.0.0" },
					scripts: { build: "tsc" },
				};
				const NextOk = { name: "x", dependencies: { a: "1.0.0" }, scripts: { build: "tsc" } };
				const NextBad = { name: "x", dependencies: { a: "1.0.0" }, scripts: { build: "bun" } };
				assert.equal(
					Refusal(RAppend, "/x/package.json", Section, Current, NextOk),
					false,
					"sections-only change \u2192 allowed",
				);
				assert.equal(RefusalLines.length, 0, "no refusal line");
				assert.equal(
					Refusal(RAppend, "/x/package.json", Section, Current, NextBad),
					true,
					"a non-dependency section change \u2192 refused",
				);
				assert.equal(
					RefusalLines[0],
					'REFUSED rewrite of /x/package.json: non-dependency section "scripts" would change',
					"the byte-identical refusal line",
				);
			});
		}
	}
	return Finish(Count, "Refusal");
};

// Standalone entry: `node Target/Test/Refusal/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Refusal`);
}
