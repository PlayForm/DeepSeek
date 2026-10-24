import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Decide, Policy, Schema } from "../../../Target/Library.js";
const Defaults = {
  read: "auto",
  index: "auto",
  record: "auto",
  suggest: "auto",
  write: "approve",
  commit: "approve",
  spawn: "approve",
  message: "auto"
};
const runTest = async () => {
  const Count = MakeCounter();
  const Block = Policy();
  {
    const Sub = "Policy: the eight action classes in the D6 order with the D6 defaults";
    Check(Count, Sub, () => {
      assert.deepEqual(
        Object.keys(Block.dict),
        ["read", "index", "record", "suggest", "write", "commit", "spawn", "message"],
        "one key per action class, in the documented order"
      );
      assert.deepEqual(Block({}).get(), Defaults, "the schema fills the D6 defaults");
      assert.equal(
        typeof Block({}).get,
        "function",
        "the block is a volatile cell (one hot-editable object)"
      );
    });
  }
  {
    const Sub = "Policy: an explicit override replaces one action and keeps the rest";
    Check(Count, Sub, () => {
      assert.deepEqual(
        Block({ write: "auto" }).get(),
        { ...Defaults, write: "auto" },
        "a partial override merges over the D6 defaults"
      );
      assert.deepEqual(
        Block({ read: "approve", commit: "auto", message: "approve" }).get(),
        {
          ...Defaults,
          read: "approve",
          commit: "auto",
          message: "approve"
        },
        "every action is independently overridable"
      );
    });
  }
  {
    const Sub = "Policy: an unknown verdict fails loud at validation";
    Check(Count, Sub, () => {
      assert.throws(
        () => Block({ spawn: "sometimes" }),
        /expected "auto" \| "approve"/,
        "the enum rejects a value that is neither auto nor approve"
      );
    });
  }
  {
    const Sub = "Policy: composed into a consumer schema as ONE volatile cell";
    Check(Count, Sub, () => {
      const Composed = Schema(false, { policy: Block });
      const Config = Composed({});
      assert.equal(typeof Config.policy.get, "function", "the composed field is a cell");
      assert.deepEqual(Config.policy.get(), Defaults, "the composed cell carries the defaults");
      assert.deepEqual(
        Composed({ policy: { commit: "auto" } }).policy.get(),
        { ...Defaults, commit: "auto" },
        "the composed cell accepts a partial override"
      );
      assert.throws(
        () => Composed({ policy: { commit: "whenever" } }),
        /expected "auto" \| "approve"/,
        "the composed field rejects an unknown verdict too"
      );
    });
  }
  {
    const Sub = "Decide: the action names ARE the keys - every D6 verdict resolves";
    Check(Count, Sub, () => {
      assert.equal(Decide(Defaults, "read"), "auto");
      assert.equal(Decide(Defaults, "index"), "auto");
      assert.equal(Decide(Defaults, "record"), "auto");
      assert.equal(Decide(Defaults, "suggest"), "auto");
      assert.equal(Decide(Defaults, "write"), "approve");
      assert.equal(Decide(Defaults, "commit"), "approve");
      assert.equal(Decide(Defaults, "spawn"), "approve");
      assert.equal(Decide(Defaults, "message"), "auto");
    });
  }
  {
    const Sub = "Decide: an override flips exactly its action";
    Check(Count, Sub, () => {
      assert.equal(Decide({ ...Defaults, write: "auto" }, "write"), "auto");
      assert.equal(Decide({ ...Defaults, write: "auto" }, "commit"), "approve");
      assert.equal(Decide({ ...Defaults, read: "approve" }, "read"), "approve");
      assert.equal(Decide({ ...Defaults, spawn: "auto" }, "spawn"), "auto");
    });
  }
  {
    const Sub = "Decide: a missing or malformed key takes that action's D6 default";
    Check(Count, Sub, () => {
      assert.equal(Decide({}, "read"), "auto", "missing read -> auto");
      assert.equal(Decide({}, "commit"), "approve", "missing commit -> approve");
      assert.equal(Decide({}, "spawn"), "approve", "missing spawn -> approve");
      assert.equal(Decide({}, "message"), "auto", "missing message -> auto");
      assert.equal(
        Decide({ write: "sometimes" }, "write"),
        "approve",
        "a malformed write never widens to auto"
      );
      assert.equal(
        Decide({ read: "sometimes" }, "read"),
        "auto",
        "a malformed read falls back to its automatic default"
      );
    });
  }
  {
    const Sub = "Library: Policy and Decide are module-level functions beside Schema";
    Check(Count, Sub, () => {
      assert.equal(typeof Policy, "function", "the Policy builder is a named export");
      assert.equal(typeof Decide, "function", "the Decide lookup is a named export");
      assert.equal(typeof Schema, "function", "the Schema factory stays exported");
    });
  }
  return Finish(Count, "Policy-And-Decide");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Policy-And-Decide`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
