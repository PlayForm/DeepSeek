import assert from "node:assert/strict";
import { Counter } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Counter: the declared monotonic counter (Next advances, Restore raises and never lowers)";
    {
      Check(Count, Sub, () => {
        const First = Counter();
        assert.equal(First.Value, 0, "a counter is born at the initial value (default 0)");
        assert.equal(First.Next(), 1, "Next advances and returns the new value");
        assert.equal(First.Value, 1, "the value read matches what Next returned");
        First.Restore(9);
        assert.equal(First.Value, 9, "a recovered value above the current one raises it");
        First.Restore(2);
        assert.equal(First.Value, 9, "a recovered value below it never lowers it");
        const Second = Counter(5);
        assert.equal(Second.Value, 5, "the initial value is the explicit floor");
        assert.equal(Second.Next(), 6, "the second counter advances on its own");
        assert.equal(First.Value, 9, "two counters are independent (per instance, never module-level)");
      });
    }
  }
  return Finish(Count, "Counter");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Counter`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
