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
  Check(Count, "P1: the member's schema fills the D6 policy defaults", () => {
    const Config = Validate({ logFile: Ledger });
    assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
  });
  Check(Count, "P1: the built State carries the block on Config.policy", () => {
    const Run = Make(Validate({ logFile: Ledger }));
    assert.deepEqual(Run.State.Config.policy, Defaults, "the constructor keeps the block");
  });
  Check(Count, "P1: a policy override lands on the built State", () => {
    const Run = Make(Validate({ logFile: Ledger, policy: { suggest: "approve" } }));
    assert.deepEqual(
      Run.State.Config.policy,
      { ...Defaults, suggest: "approve" },
      "the override replaces suggest and keeps the rest"
    );
  });
  Check(Count, "P1: the member's own action classes are automatic", () => {
    const Run = Make(Validate({ logFile: Ledger }));
    assert.equal(Run.State.Config.policy.record, "auto", "the outcome record is automatic");
    assert.equal(Run.State.Config.policy.suggest, "auto", "the summary is automatic");
    assert.equal(Run.State.Config.policy.write, "approve", "the member never writes");
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
