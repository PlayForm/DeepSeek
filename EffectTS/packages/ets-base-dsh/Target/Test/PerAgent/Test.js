import assert from "node:assert/strict";
import { PerAgent } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "PerAgent: the per-agent registry (one state per key, lazy, default key)";
    {
      Check(Count, Sub, () => {
        let Born = 0;
        const AgentOf = PerAgent(() => {
          Born += 1;
          return { born: Born };
        });
        const First = {};
        const Second = {};
        const One = AgentOf(First);
        assert.equal(AgentOf(First), One, "the same key returns the same state");
        assert.equal(AgentOf(Second) === One, false, "distinct keys hold distinct states");
        assert.equal(AgentOf(void 0), AgentOf(null), "every no-agent call shares one default state");
        assert.equal(Born, 3, "the factory runs once per distinct key");
        const Other = PerAgent(() => 0);
        assert.equal(Other(First), 0, "a second registry is independent");
      });
    }
  }
  return Finish(Count, "PerAgent");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - PerAgent`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
