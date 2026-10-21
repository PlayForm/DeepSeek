import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Refusal, Section } from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Refusal: the shared refusal guard (sections-only changes allowed)";
    {
      Check(Count, Sub, () => {
        const RefusalLines = [];
        const RAppend = (Message) => RefusalLines.push(Message);
        const Current = {
          name: "x",
          dependencies: { a: "^1.0.0" },
          scripts: { build: "tsc" }
        };
        const NextOk = { name: "x", dependencies: { a: "1.0.0" }, scripts: { build: "tsc" } };
        const NextBad = { name: "x", dependencies: { a: "1.0.0" }, scripts: { build: "bun" } };
        assert.equal(
          Refusal(RAppend, "/x/package.json", Section, Current, NextOk),
          false,
          "sections-only change \u2192 allowed"
        );
        assert.equal(RefusalLines.length, 0, "no refusal line");
        assert.equal(
          Refusal(RAppend, "/x/package.json", Section, Current, NextBad),
          true,
          "a non-dependency section change \u2192 refused"
        );
        assert.equal(
          RefusalLines[0],
          'REFUSED rewrite of /x/package.json: non-dependency section "scripts" would change',
          "the byte-identical refusal line"
        );
      });
    }
  }
  return Finish(Count, "Refusal");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Refusal`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
