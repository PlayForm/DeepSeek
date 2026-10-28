import assert from "node:assert/strict";
import { Check, Finish, Make, MakeCounter, PatternService } from "../Harness.js";
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
  Check(Count, "P1: the service's schema fills the D6 policy defaults", () => {
    const Config = PatternService.Config({});
    assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
  });
  Check(Count, "P1: a bare construction carries the D6 block in the knobs", () => {
    const Run = Make();
    assert.deepEqual(Run.Service.Knobs.policy, Defaults, "the bare default is the D6 table");
  });
  Check(Count, "P1: a policy override lands in the knobs", () => {
    const Run = Make({ policy: { record: "approve" } });
    assert.deepEqual(
      Run.Service.Knobs.policy,
      { ...Defaults, record: "approve" },
      "the override replaces record and keeps the rest"
    );
  });
  Check(Count, "P1: the registry's own action classes are automatic", () => {
    const Run = Make();
    assert.equal(Run.Service.Knobs.policy.read, "auto", "the match read is automatic");
    assert.equal(Run.Service.Knobs.policy.record, "auto", "the outcome record is automatic");
    assert.equal(Run.Service.Knobs.policy.write, "approve", "the service never writes");
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
