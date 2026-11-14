import assert from "node:assert/strict";
import { Resume } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Resume: the monotonic recovery rule (raise, never lower, no-op)";
    {
      Check(Count, Sub, () => {
        assert.equal(Resume(0, 5), 5, "a recovered value above the current one wins");
        assert.equal(Resume(5, 2), 5, "a recovered value below it is ignored");
        assert.equal(Resume(5, 5), 5, "an equal value is a no-op");
      });
    }
  }
  return Finish(Count, "Resume");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Resume`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
