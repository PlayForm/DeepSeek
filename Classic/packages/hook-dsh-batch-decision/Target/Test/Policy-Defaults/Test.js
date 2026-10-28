import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Proposal,
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
const Setup = (Policy) => {
  const Run = Make(
    Validate({
      logFile: Ledger,
      enabled: true,
      autoApprove: "on",
      allowlist: ["version-bump"],
      maxAutoTargets: 5,
      minConfidence: 0.8,
      pendingTtlMs: 36e5,
      ...Policy === void 0 ? {} : { policy: Policy }
    })
  );
  Run.State.SeenIntents.set("version-bump", 1);
  return Run;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the hook's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Make(Validate({ logFile: Ledger, enabled: true }));
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Make(
        Validate({ logFile: Ledger, enabled: true, policy: { commit: "auto" } })
      );
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, commit: "auto" },
        "the override replaces commit and keeps the rest"
      );
    });
  }
  {
    const Run = Setup();
    Run.CtxListeners["batch/proposed"](Proposal({}));
    Check(Count, "P2: an approve verdict records the held line and no decision", () => {
      assert.ok(
        Run.Lines.includes(
          "hook-dsh-batch-decision: decision held prop-1 (policy commit=approve)"
        ),
        "the documented held line"
      );
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("decision approved")).length,
        0,
        "no policy approval"
      );
      assert.equal(
        Run.Emits.filter((Emitted) => Emitted[0] === "batch/decision").length,
        0,
        "nothing on the bus"
      );
      assert.equal(
        Run.State.Pending.get("prop-1")?.decided,
        void 0,
        "the proposal stays pending for the user"
      );
    });
    Check(Count, "P2: the proposal is still recorded and listable for the user", () => {
      assert.ok(
        Run.Lines.includes(
          "hook-dsh-batch-decision: proposal prop-1 recorded (intent version-bump, targets 1, rev 1)"
        ),
        "the recorder still runs"
      );
      assert.equal(Run.State.Pending.size, 1);
    });
  }
  {
    const Run = Setup({ commit: "auto" });
    Run.CtxListeners["batch/proposed"](Proposal({}));
    Check(Count, "P3: an auto verdict proceeds to the policy approval", () => {
      assert.ok(
        Run.Lines.includes(
          "hook-dsh-batch-decision: decision approved prop-1 (by policy)"
        ),
        "the policy approval line"
      );
      const Emitted = Run.Emits.find((Entry) => Entry[0] === "batch/decision");
      assert.ok(Emitted !== void 0, "the decision reaches the bus");
      assert.equal(Emitted[1].proposal, "prop-1");
      assert.equal(Emitted[1].by, "policy");
      assert.equal(Run.State.Pending.get("prop-1")?.decided?.outcome, "approved");
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("decision held")).length,
        0,
        "no held line when the gate is open"
      );
    });
  }
  {
    const Run = Setup({ commit: "auto" });
    Run.State.AutoApprove = "off";
    Run.CtxListeners["batch/proposed"](Proposal({}));
    Check(Count, "P4: a knob that is off requires the user silently, even with the gate open", () => {
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("decision held")).length,
        0,
        "no held line - the knob refused first"
      );
      assert.equal(
        Run.Emits.filter((Emitted) => Emitted[0] === "batch/decision").length,
        0,
        "nothing on the bus"
      );
      assert.equal(
        Run.State.Pending.get("prop-1")?.decided,
        void 0,
        "the proposal waits for the user"
      );
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
