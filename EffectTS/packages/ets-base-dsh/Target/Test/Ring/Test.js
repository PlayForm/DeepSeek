import assert from "node:assert/strict";
import { Ring } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Ring: the bounded ring (append, evict the oldest, honour a shrunken cap)";
    {
      Check(Count, Sub, () => {
        const Entries = [1, 2];
        assert.equal(Ring(Entries, 3, 5), void 0, "under the cap nothing is dropped");
        assert.deepEqual(Entries, [1, 2, 3], "the entry is appended at the end");
        assert.equal(Ring(Entries, 4, 3), 1, "over the cap the oldest is dropped and returned");
        assert.deepEqual(Entries, [2, 3, 4], "the ring keeps the newest Cap entries");
        const Shrunk = [1, 2, 3, 4, 5];
        assert.equal(Ring(Shrunk, 6, 2), 4, "a shrunken cap drops until the bound holds");
        assert.deepEqual(Shrunk, [5, 6], "only the newest Cap entries survive");
      });
    }
  }
  return Finish(Count, "Ring");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Ring`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
