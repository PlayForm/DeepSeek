import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Packet } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the full packet renders the eight-line grammar byte-exact", () => {
      assert.equal(
        Packet({
          workspace: "deepseek",
          indexRevision: "r12",
          scope: "the loader contract",
          map: ["lib-dsh-core: helpers", "plugin-dsh-factory: state"],
          focus: "Load.ts:14-22 fp:abc v3",
          neighbors: ["Factory.ts: builds state", "Registry.ts: registers"],
          evidence: ["Load.ts:14-22", "Factory.ts:1-40"],
          open: ["how do cells unwrap?"],
          stale: "r9"
        }),
        [
          "WORKSPACE deepseek @ r12",
          "SCOPE the loader contract",
          "MAP lib-dsh-core: helpers",
          "MAP plugin-dsh-factory: state",
          "FOCUS Load.ts:14-22 fp:abc v3",
          "NEIGHBORS Factory.ts: builds state",
          "NEIGHBORS Registry.ts: registers",
          "EVIDENCE Load.ts:14-22",
          "EVIDENCE Factory.ts:1-40",
          "OPEN how do cells unwrap?",
          "STALE r9"
        ].join("\n")
      );
    });
  }
  {
    Check(Count, "P2: absent bands render `(none)` placeholders and FOCUS/STALE are omitted", () => {
      assert.equal(
        Packet({
          workspace: "w",
          indexRevision: "r1",
          scope: "s",
          map: [],
          neighbors: [],
          evidence: [],
          open: []
        }),
        [
          "WORKSPACE w @ r1",
          "SCOPE s",
          "MAP (none)",
          "NEIGHBORS (none)",
          "EVIDENCE (none)",
          "OPEN (none)"
        ].join("\n")
      );
    });
  }
  {
    Check(Count, "P3: STALE renders only when the caller's version differs", () => {
      const Text = Packet({
        workspace: "w",
        indexRevision: "r5",
        scope: "s",
        map: ["a"],
        neighbors: [],
        evidence: [],
        open: [],
        stale: "r2"
      });
      assert.ok(Text.includes("STALE r2"));
      assert.ok(Text.includes("WORKSPACE w @ r5"));
      const Fresh = Packet({
        workspace: "w",
        indexRevision: "r5",
        scope: "s",
        map: ["a"],
        neighbors: [],
        evidence: [],
        open: []
      });
      assert.equal(Fresh.includes("STALE"), false);
    });
  }
  return Finish(Count, "Packet");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Packet`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
