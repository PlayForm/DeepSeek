// Source/Test/Replace/Test.ts - one singular test: the two replacement
// mechanics - Replace (the generic class-to-string replacer: match+count,
// count 0, literal $& insertion, lastIndex untouched) and ReplaceMap (the
// char-to-char map replacer: the Quotes + Fullwidth flavors, literal values,
// count 0). The two mechanics share one folder (the merged smallest pair of
// the source suite's sections 6 + 7); each keeps its own Check with the
// source suite's ok label verbatim.
// Runs standalone (`node Target/Test/Replace/Test.js`) AND under the aggregate
// (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-lib-dsh-core: the REAL built entry only.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Dashes, Fullwidth, Quotes, Replace, ReplaceMap } from "../../../Target/Library.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the replacement mechanics.
	{
		// Sub: the generic class-to-string replacer. The Check label is the
		// source suite's ok label, verbatim (the class/arrow glyphs are
		// escaped for an ASCII source file).
		Check(
			Count,
			"Replace: the generic class\u2192string replacer (the Dashes flavor, literal replacement, count 0 unchanged)",
			() => {
				assert.deepEqual(
					Replace("a \u2014 b \u2013 c", Dashes, "-"),
					{ text: "a - b - c", count: 2 },
					"the Dashes class \u2192 the replacement, with the count",
				);
				assert.deepEqual(
					Replace("plain", Dashes, "-"),
					{ text: "plain", count: 0 },
					"no match \u2192 count 0 (the caller keeps the segment by identity)",
				);
				assert.equal(
					Replace("\u2014end", Dashes, "$&").text,
					"$&end",
					"the replacement is inserted LITERALLY (function replacer, no $-pattern interpretation)",
				);
				assert.equal(
					Dashes.lastIndex,
					0,
					"the caller's regex is never mutated (per-call construction from source)",
				);
			},
		);
	}
	{
		// Sub: the char-to-char map replacer. The Check label is the source
		// suite's ok label, verbatim.
		Check(
			Count,
			"ReplaceMap: the char\u2192char map replacer (the Quotes + Fullwidth flavors, literal values, count 0 unchanged)",
			() => {
				assert.deepEqual(
					ReplaceMap("\u2018x\u2019\u201Dy\u201E", Quotes),
					{ text: "'x'\"y\"", count: 4 },
					"the Quotes map \u2192 the straight counterparts, with the count",
				);
				assert.deepEqual(
					ReplaceMap("\uFF21\uff4a\uff10", Fullwidth),
					{ text: "Aj0", count: 3 },
					"the Fullwidth map \u2192 the half-width counterparts",
				);
				assert.equal(
					ReplaceMap("a", { a: "$&" }).text,
					"$&",
					"the map value is inserted LITERALLY (function replacer, no $-pattern interpretation)",
				);
				assert.deepEqual(
					ReplaceMap("plain", Quotes),
					{ text: "plain", count: 0 },
					"no key match \u2192 count 0 (unchanged)",
				);
			},
		);
	}
	return Finish(Count, "Replace");
};

// Standalone entry: `node Target/Test/Replace/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Replace`);
}
