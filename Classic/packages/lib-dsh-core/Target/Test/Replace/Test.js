import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Dashes, Fullwidth, Quotes, Replace, ReplaceMap } from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(
      Count,
      "Replace: the generic class\u2192string replacer (the Dashes flavor, literal replacement, count 0 unchanged)",
      () => {
        assert.deepEqual(
          Replace("a \u2014 b \u2013 c", Dashes, "-"),
          { text: "a - b - c", count: 2 },
          "the Dashes class \u2192 the replacement, with the count"
        );
        assert.deepEqual(
          Replace("plain", Dashes, "-"),
          { text: "plain", count: 0 },
          "no match \u2192 count 0 (the caller keeps the segment by identity)"
        );
        assert.equal(
          Replace("\u2014end", Dashes, "$&").text,
          "$&end",
          "the replacement is inserted LITERALLY (function replacer, no $-pattern interpretation)"
        );
        assert.equal(
          Dashes.lastIndex,
          0,
          "the caller's regex is never mutated (per-call construction from source)"
        );
      }
    );
  }
  {
    Check(
      Count,
      "ReplaceMap: the char\u2192char map replacer (the Quotes + Fullwidth flavors, literal values, count 0 unchanged)",
      () => {
        assert.deepEqual(
          ReplaceMap("\u2018x\u2019\u201Dy\u201E", Quotes),
          { text: `'x'"y"`, count: 4 },
          "the Quotes map \u2192 the straight counterparts, with the count"
        );
        assert.deepEqual(
          ReplaceMap("\uFF21\uFF4A\uFF10", Fullwidth),
          { text: "Aj0", count: 3 },
          "the Fullwidth map \u2192 the half-width counterparts"
        );
        assert.equal(
          ReplaceMap("a", { a: "$&" }).text,
          "$&",
          "the map value is inserted LITERALLY (function replacer, no $-pattern interpretation)"
        );
        assert.deepEqual(
          ReplaceMap("plain", Quotes),
          { text: "plain", count: 0 },
          "no key match \u2192 count 0 (unchanged)"
        );
      }
    );
  }
  return Finish(Count, "Replace");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Replace`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
