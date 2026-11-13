import assert from "node:assert/strict";
import { SuggestRing } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "SuggestRing: the per-agent ring (keyed per agent, the caller's state and predicate)";
    {
      Check(Count, Sub, () => {
        const Fresh = () => ({
          touched: /* @__PURE__ */ new Set(),
          cooled: /* @__PURE__ */ new Map(),
          cooledNoted: /* @__PURE__ */ new Set(),
          notes: 0,
          calls: 0
        });
        const Match = (Path, Companion) => Path === Companion;
        const Ring = SuggestRing(Fresh, Match);
        const Agent = {};
        const One = Ring.State(Agent);
        assert.equal(Ring.State(Agent), One, "the same agent returns the same state");
        assert.notEqual(Ring.State({}), One, "distinct agents hold distinct states");
        assert.equal(
          Ring.State(null),
          Ring.State(void 0),
          "every no-agent call shares one default state"
        );
        Ring.Touch(One, "README.md");
        assert.ok(One.touched.has("README.md"), "Touch records the judged path");
        assert.equal(One.calls, 1, "Touch increments the call count");
        Ring.Mark(One, "History", "History:README.md");
        assert.equal(One.cooled.get("History"), 0, "Mark cools the family at age zero");
        assert.ok(One.cooledNoted.has("History:README.md"), "Mark keeps the dedupe key");
        assert.equal(One.notes, 1, "Mark moves the note count");
        Ring.Mark(One, "Replay", "Replay:README.md");
        Ring.Tick(One, 2);
        assert.deepEqual(
          [...One.cooled.entries()],
          [
            ["History", 1],
            ["Replay", 1]
          ],
          "Tick ages every cooling family by one judged call"
        );
        Ring.Tick(One, 2);
        assert.deepEqual(
          [...One.cooled.entries()],
          [
            ["History", 2],
            ["Replay", 2]
          ],
          "Tick keeps the families still inside the window"
        );
        Ring.Tick(One, 2);
        assert.equal(One.cooled.size, 0, "Tick drops the entries whose age passes the window");
        Ring.Open(One, "History", ["GUIDE.md"]);
        assert.deepEqual(
          One.pending,
          { family: "History", companions: ["GUIDE.md"], since: 0 },
          "Open stores the open note"
        );
        assert.equal(Ring.Follow(One, "SCHEME.md"), void 0, "a path outside the companions is no follow");
        assert.ok(One.pending !== void 0, "a missed follow keeps the note open");
        assert.deepEqual(
          Ring.Follow(One, "GUIDE.md"),
          { family: "History", companions: ["GUIDE.md"], companion: "GUIDE.md" },
          "a companion named by the judged path is a follow"
        );
        assert.equal(One.pending, void 0, "a follow closes the open note");
        Ring.Open(One, "History", ["GUIDE.md"]);
        assert.equal(Ring.Age(One, 2), void 0, "an open note inside the window stays open");
        assert.ok(One.pending !== void 0, "an aged note inside the window is not closed");
        assert.deepEqual(
          Ring.Age(One, 2),
          { family: "History", companions: ["GUIDE.md"] },
          "Age closes the note when its age reaches the window"
        );
        assert.equal(One.pending, void 0, "a closed note is forgotten");
        Ring.Touch(One, "GUIDE.md");
        Ring.Mark(One, "History", "History:GUIDE.md");
        Ring.Reset(One);
        assert.equal(One.touched.size, 0, "Reset clears the touched paths");
        assert.equal(One.cooled.size, 0, "Reset clears the cooldowns");
        assert.equal(One.cooledNoted.size, 0, "Reset clears the dedupe keys");
        assert.equal(One.notes, 0, "Reset clears the note count");
        assert.equal(One.calls, 0, "Reset clears the call count");
        assert.equal(One.pending, void 0, "Reset forgets an open note without a verdict");
      });
    }
  }
  return Finish(Count, "SuggestRing");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - SuggestRing`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
