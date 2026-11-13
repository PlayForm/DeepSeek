import assert from "node:assert/strict";
import { Capped } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Capped: the eviction line (id, bound name, cap)";
    {
      Check(Count, Sub, () => {
        assert.equal(
          Capped("/repo/src/a.ts", "Stamps", 3),
          "capped /repo/src/a.ts (maxStamps 3)",
          "the path id with the stamp bound"
        );
        assert.equal(
          Capped("ap-1", "Bindings", 2),
          "capped ap-1 (maxBindings 2)",
          "an id with the binding bound"
        );
        assert.equal(
          Capped("b1", "Batches", 0),
          "capped b1 (maxBatches 0)",
          "a zero cap renders"
        );
      });
    }
  }
  return Finish(Count, "Capped");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Capped`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
