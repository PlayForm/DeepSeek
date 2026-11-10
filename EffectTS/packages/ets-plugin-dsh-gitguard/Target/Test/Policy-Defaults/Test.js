import assert from "node:assert/strict";
import { Check, Finish, Ledger, Make, MakeCounter, Validate } from "../Harness.js";
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
  Check(Count, "P1: the guard's schema fills the D6 policy defaults", () => {
    const Config = Validate({ logFile: Ledger });
    assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
  });
  Check(Count, "P1: the built State carries the block on Verdicts", () => {
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    assert.deepEqual(Run.State.Verdicts, Defaults, "the apply maps policy -> Verdicts");
  });
  Check(Count, "P1: a policy override lands on the built State", () => {
    const Run = Make(Validate({ logFile: Ledger, enabled: true, policy: { record: "approve" } }));
    assert.deepEqual(
      Run.State.Verdicts,
      { ...Defaults, record: "approve" },
      "the override replaces record and keeps the rest"
    );
  });
  Check(Count, "P1: the guard's own action classes are automatic", () => {
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    assert.equal(Run.State.Verdicts.read, "auto", "classification is automatic");
    assert.equal(Run.State.Verdicts.record, "auto", "the denial ledger is automatic");
    assert.equal(Run.State.Verdicts.write, "approve", "the guard never writes");
  });
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
