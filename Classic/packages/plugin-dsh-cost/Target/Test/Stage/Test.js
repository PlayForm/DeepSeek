import assert from "node:assert/strict";
import Stage from "../../../Target/Function/Stage.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "B1: a search is a discovery, ahead of every other rule", () => {
    assert.equal(Stage([], "search", false), "discover");
    assert.equal(Stage(["edit"], "search", false), "discover");
    assert.equal(Stage([], "search", true), "discover");
  });
  Check(Count, "B1: a restored touch reverts, whatever the kind", () => {
    assert.equal(Stage([], "write", true), "revert");
    assert.equal(Stage(["read"], "read", true), "revert");
  });
  Check(Count, "B1: a read after a write or an edit verifies the change", () => {
    assert.equal(Stage(["edit"], "read", false), "verify");
    assert.equal(Stage(["write"], "read", false), "verify");
    assert.equal(Stage(["read", "edit"], "read", false), "verify");
  });
  Check(Count, "B1: a read after a read with no edit in between rereads", () => {
    assert.equal(Stage(["read"], "read", false), "reread");
    assert.equal(Stage(["read", "search"], "read", false), "reread");
  });
  Check(Count, "B1: a first read with no prior touches reads", () => {
    assert.equal(Stage([], "read", false), "read");
  });
  Check(Count, "B1: a write, an edit, a delete or a move edits", () => {
    assert.equal(Stage([], "write", false), "edit");
    assert.equal(Stage(["read"], "edit", false), "edit");
    assert.equal(Stage([], "delete", false), "edit");
    assert.equal(Stage([], "move", false), "edit");
  });
  Check(Count, "B1: anything the classifier cannot place is a discovery", () => {
    assert.equal(Stage([], "task", false), "discover");
    assert.equal(Stage(["read"], "", false), "discover");
  });
  return Finish(Count, "Stage");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Stage`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
