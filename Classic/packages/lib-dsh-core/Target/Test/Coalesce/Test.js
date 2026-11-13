import assert from "node:assert/strict";
import { Coalesce } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Coalesce: the repeat-event guard (window, cap, last-version-wins)";
    {
      Check(Count, Sub, () => {
        const Seen = /* @__PURE__ */ new Map();
        assert.equal(
          Coalesce(Seen, "/a", "v1", () => 1e3),
          false,
          "the first sighting processes"
        );
        assert.equal(
          Coalesce(Seen, "/a", "v1", () => 1500),
          true,
          "the same version inside the window is dropped"
        );
        assert.equal(
          Coalesce(Seen, "/a", "v2", () => 1600),
          false,
          "a different version processes"
        );
        assert.equal(
          Coalesce(Seen, "/a", "v2", () => 5e3),
          false,
          "the same version outside the window processes"
        );
        assert.equal(
          Coalesce(Seen, "/b", "v1", () => 1001),
          false,
          "a first sighting of another path processes"
        );
        const Small = /* @__PURE__ */ new Map();
        for (const Index of [0, 1, 2]) {
          Coalesce(Small, `/p${Index}`, "v1", () => 1e3, 2e3, 2);
        }
        assert.equal(Small.size <= 2, true, "the map is capped");
        assert.equal(
          Coalesce(Small, "/p9", "v1", () => 1e3, 2e3, 2),
          false,
          "a first sighting past the cap still processes"
        );
      });
    }
  }
  return Finish(Count, "Coalesce");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Coalesce`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
