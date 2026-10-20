import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Default, Section } from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Section: the canonical npm dependency sections";
    {
      Check(Count, Sub, () => {
        assert.deepEqual(
          Section,
          ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"],
          "the canonical npm dependency sections"
        );
      });
    }
  }
  {
    const Sub = "Default: the built-in exclusion segments (anywhere mode, exclusion-first)";
    {
      Check(Count, Sub, () => {
        assert.deepEqual(
          Default,
          ["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"],
          "the built-in exclusion segments"
        );
      });
    }
  }
  return Finish(Count, "Data-Lists");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Data-Lists`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
