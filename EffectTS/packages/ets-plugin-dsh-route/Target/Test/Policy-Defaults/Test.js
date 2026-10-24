import assert from "node:assert/strict";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";
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
  Check(Count, "P1: the router's schema fills the D6 policy defaults on automation", () => {
    const Config = Validate({});
    assert.deepEqual(Config.automation.get(), Defaults, "the composed block carries the defaults");
    assert.equal(Config.policy === void 0, false, "the routing policy stays a separate key");
  });
  Check(Count, "P1: the built State carries the block on Allow", () => {
    const Run = Make(Validate({ enabled: true }));
    assert.deepEqual(
      Run.Service.State.Allow,
      Defaults,
      "the apply maps automation -> Allow"
    );
  });
  Check(Count, "P1: a policy override lands on the built State", () => {
    const Run = Make(Validate({ enabled: true, automation: { suggest: "approve" } }));
    assert.deepEqual(
      Run.Service.State.Allow,
      { ...Defaults, suggest: "approve" },
      "the override replaces suggest and keeps the rest"
    );
  });
  Check(Count, "P1: the router's own action classes are automatic", () => {
    const Run = Make(Validate({ enabled: true }));
    assert.equal(Run.Service.State.Allow.read, "auto", "the classification is automatic");
    assert.equal(Run.Service.State.Allow.suggest, "auto", "the route is automatic");
    assert.equal(Run.Service.State.Allow.write, "approve", "the router never writes");
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
