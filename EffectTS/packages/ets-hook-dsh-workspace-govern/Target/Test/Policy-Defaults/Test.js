import assert from "node:assert/strict";
import { Decide } from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import {
  Check,
  Finish,
  Ledger,
  LinesWith,
  Make,
  MakeCounter,
  Proposal,
  rm,
  Validate
} from "../Harness.js";
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
  {
    Check(Count, "P1: the hook's schema fills the D6 policy defaults on automation", () => {
      const Config = Validate({ logFile: Ledger, enabled: true });
      assert.deepEqual(
        Config.automation.get(),
        Defaults,
        "the composed block carries the defaults"
      );
      assert.deepEqual(
        Config.policy.get(),
        [],
        "the decision rule table stays a separate key"
      );
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Make(Validate({ logFile: Ledger, enabled: true }));
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps automation -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Make(
        Validate({ logFile: Ledger, enabled: true, automation: { read: "approve" } })
      );
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, read: "approve" },
        "the override replaces read and keeps the rest"
      );
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Check(Count, "P2: the hook has no gated action (record is automatic)", () => {
      assert.equal(Decide(Run.State.Allow, "record"), "auto", "the record class is automatic");
      assert.equal(LinesWith(Run, "held").length, 0, "no held line");
      assert.deepEqual(
        Run.Lines.filter((Line) => Line.includes("policy")),
        ["govern: activated (tools=4, policy=0)"],
        "the only policy mention is the rule-table count in the activation proof"
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    const Decision = Run.Context.workspaceGovern.gate(Proposal());
    Check(Count, "P3: the gate proceeds under the defaults and writes no file", () => {
      assert.equal(Decision.decision, "pass", "the decision is recorded");
      assert.equal(LinesWith(Run, "denied").length, 0, "no refusal line");
      assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line");
      assert.equal(LinesWith(Run, "held").length, 0, "no held line");
      assert.equal(Run.Fs.writes.length, 0, "zero file writes");
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
