import assert from "node:assert/strict";
import { Decide } from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import { Check, Finish, LinesWith, Make, MakeCounter, Validate, rm } from "../Harness.js";
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
const Setup = (Raw = {}) => {
  rm();
  return Make(Validate({ logFile: "/nonexistent/evidence.log", enabled: true, ...Raw }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the evidence schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: "/nonexistent/evidence.log", enabled: true });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Setup();
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Setup({ policy: { read: "approve" } });
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, read: "approve" },
        "the override replaces read and keeps the rest"
      );
    });
  }
  {
    const Run = Setup();
    Check(Count, "P2: the package has no gated action", () => {
      assert.equal(Decide(Run.State.Allow, "read"), "auto", "the read verdict is automatic");
      assert.equal(Decide(Run.State.Allow, "record"), "auto", "the record verdict is automatic");
      assert.equal(LinesWith(Run, "held").length, 0, "no held line on the mount");
      assert.equal(LinesWith(Run, "policy").length, 0, "no policy line on the mount");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceEvidence;
    const Record = Service.validate("a", "reality", "the file on disk", ["x.ts"]);
    Check(Count, "P3: validate records under the shipped defaults and writes no file", () => {
      assert.equal(Record.id, "a", "the record is produced");
      assert.equal(Record.status, "fresh", "the record is fresh");
      assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line appears");
      assert.equal(Run.Fs.writes.length, 0, "the fake fs recorded zero writes");
    });
  }
  return Finish(Count, "Policy-Defaults");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Policy-Defaults`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
