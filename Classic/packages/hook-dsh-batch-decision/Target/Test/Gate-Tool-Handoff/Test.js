import assert from "node:assert/strict";
import GateModule from "../../../Target/Function/Gate.js";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Proposal,
  Tool,
  rm,
  Validate
} from "../Harness.js";
const Gate = GateModule;
const Setup = () => {
  rm();
  return Make(
    Validate({
      logFile: Ledger,
      enabled: true,
      autoApprove: "on",
      allowlist: ["version-bump"],
      maxAutoTargets: 5,
      minConfidence: 0.8,
      pendingTtlMs: 36e5
    })
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.CtxListeners["batch/proposed"](Proposal({}));
    Check(Count, "G1: a proposal is recorded with the byte-exact line", () => {
      assert.ok(
        Run.Lines.includes(
          "hook-dsh-batch-decision: proposal prop-1 recorded (intent version-bump, targets 1, rev 1)"
        )
      );
      assert.equal(Run.State.Pending.get("prop-1").proposal.revision, 1);
    });
    Check(Count, "G1: a same-or-lower revision is ignored with the byte-exact line", () => {
      Run.CtxListeners["batch/proposed"](Proposal({}));
      Run.CtxListeners["batch/proposed"](Proposal({ revision: 0 }));
      assert.ok(
        Run.Lines.includes("hook-dsh-batch-decision: proposal prop-1 ignored (revision not newer)")
      );
      assert.equal(Run.State.Pending.get("prop-1").proposal.revision, 1);
    });
    Check(Count, "G1: a revision bump replaces in place", () => {
      Run.CtxListeners["batch/proposed"](Proposal({ revision: 2 }));
      assert.equal(Run.State.Pending.get("prop-1").proposal.revision, 2);
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: proposal prop-1 recorded (intent version-bump, targets 1, rev 2)"));
    });
    Check(Count, "G1: a malformed payload never throws the listener", () => {
      Run.CtxListeners["batch/proposed"](null);
      Run.CtxListeners["batch/proposed"](void 0);
      Run.CtxListeners["batch/proposed"]("not an object");
      assert.equal(Run.Warns.length, 0);
    });
  }
  {
    const Run = Setup();
    Run.CtxListeners["batch/proposed"](Proposal({}));
    Check(Count, "G2: an expired proposal is decided 'expired' by 'policy', whatever was requested", () => {
      Run.Clock.Now = 11e5;
      const Decision = Gate(Run.State, Proposal({}), "approved", "user");
      assert.equal(Decision.outcome, "expired");
      assert.equal(Decision.by, "policy");
      assert.equal(Decision.proposal, "prop-1");
      assert.equal(Decision.at, 11e5);
    });
    Check(Count, "G2: an unknown proposal is never decided silently - the gate returns undefined", () => {
      assert.equal(Gate(Run.State, Proposal({ id: "ghost" }), "approved", "user"), void 0);
    });
    Check(Count, "G2: a live proposal records the requested decision", () => {
      Run.Clock.Now = 1e6;
      Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-live", revision: 5 }));
      const Decision = Gate(Run.State, Proposal({ id: "prop-live", revision: 5 }), "denied", "user");
      assert.equal(Decision.outcome, "denied");
      assert.equal(Decision.by, "user");
    });
  }
  {
    const Run = Setup();
    Run.State.SeenIntents.set("version-bump", 1);
    Run.CtxListeners["batch/proposed"](Proposal({}));
    Check(Count, "G3: an auto-approved proposal emits batch/decision with the policy decision", () => {
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: decision approved prop-1 (by policy)"));
      const Emitted = Run.Emits.find((E) => E[0] === "batch/decision");
      assert.ok(Emitted !== void 0);
      assert.equal(Emitted[1].proposal, "prop-1");
      assert.equal(Emitted[1].outcome, "approved");
      assert.equal(Emitted[1].by, "policy");
    });
    Check(Count, "G3: a require-user proposal emits nothing", () => {
      const Before = Run.Emits.length;
      Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-2", intent: "rename" }));
      assert.equal(Run.Emits.length, Before);
      assert.ok(
        Run.Lines.includes("hook-dsh-batch-decision: proposal prop-2 recorded (intent rename, targets 1, rev 1)")
      );
    });
  }
  {
    const Run = Setup();
    const ToolDef = Tool(Run);
    await CheckAsync(Count, "G4: an empty list reports no pending batch proposals", async () => {
      const Result = await ToolDef.execute({}, {});
      assert.deepEqual(Result, { decided: false, kind: "list", detail: "no pending batch proposals" });
    });
    await CheckAsync(Count, "G4: the list summarizes each pending proposal", async () => {
      Run.CtxListeners["batch/proposed"](Proposal({}));
      const Result = await ToolDef.execute({}, {});
      assert.equal(Result.kind, "list");
      assert.equal(Result.detail, "prop-1 intent=version-bump targets=1 rev=1");
    });
    await CheckAsync(Count, "G4: an unknown id never decides silently", async () => {
      const Result = await ToolDef.execute({ id: "nope", approve: true }, {});
      assert.deepEqual(Result, { decided: false, kind: "unknown", detail: "no proposal nope" });
    });
    await CheckAsync(Count, "G4: an id without approve is rejected with the exact phrasing", async () => {
      Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-3" }));
      const Result = await ToolDef.execute({ id: "prop-3" }, {});
      assert.deepEqual(Result, { decided: false, kind: "missing-approve", detail: "approve=true|false is required with id" });
    });
    await CheckAsync(Count, "G4: a user approval logs the byte-exact lines and moves SeenIntents exactly once", async () => {
      const Result = await ToolDef.execute({ id: "prop-3", approve: true }, {});
      assert.deepEqual(Result, {
        decided: true,
        kind: "approved",
        detail: "approved prop-3; no ingester service present"
      });
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: decision approved prop-3 (by user)"));
      assert.ok(
        Run.Lines.includes("hook-dsh-batch-decision: handoff prop-3: no ingester service present (the batch stays approved)")
      );
      assert.equal(Run.State.SeenIntents.get("version-bump"), 1);
    });
    await CheckAsync(Count, "G4: a decided proposal is never decided again", async () => {
      const Result = await ToolDef.execute({ id: "prop-3", approve: false }, {});
      assert.deepEqual(Result, {
        decided: false,
        kind: "already-decided",
        detail: "proposal prop-3 already approved (by user)"
      });
    });
    await CheckAsync(Count, "G4: a user denial logs the byte-exact decision line", async () => {
      Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-4", intent: "rename" }));
      const Result = await ToolDef.execute({ id: "prop-4", approve: false }, {});
      assert.deepEqual(Result, { decided: true, kind: "denied", detail: "denied prop-4" });
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: decision denied prop-4 (by user)"));
      assert.equal(Run.State.SeenIntents.get("version-bump"), 1);
    });
    await CheckAsync(Count, "G4: the list path sweeps expired proposals with the byte-exact line", async () => {
      Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-5", intent: "rename", expiresAt: 101e4 }));
      Run.Clock.Now = 11e5;
      const Result = await ToolDef.execute({}, {});
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: decision expired prop-5 (by policy)"));
      assert.ok(!Result.detail.includes("prop-5"));
      assert.equal(Run.State.Pending.get("prop-5").decided.outcome, "expired");
    });
  }
  {
    const Run = Setup();
    Run.Services["batchIngester"] = {
      apply: async (Decision) => ({
        proposal: Decision.proposal,
        perTarget: [],
        applied: 1,
        conflicts: 0,
        recovery: 0
      })
    };
    Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-h" }));
    await CheckAsync(Count, "G5: a present ingester receives the decision and the result is logged byte-exactly", async () => {
      const Result = await Tool(Run).execute({ id: "prop-h", approve: true }, {});
      assert.deepEqual(Result, {
        decided: true,
        kind: "approved",
        detail: "approved prop-h; applied 1, conflicts 0, recovery 0"
      });
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: handoff prop-h: applied 1, conflicts 0, recovery 0"));
      assert.ok(Run.Gets.includes("batchIngester"));
    });
    await CheckAsync(Count, "G5: a failing ingester never throws into the caller - the batch stays approved", async () => {
      Run.Services["batchIngester"] = {
        apply: async () => {
          throw new Error("boom");
        }
      };
      Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-b", intent: "rename" }));
      const Result = await Tool(Run).execute({ id: "prop-b", approve: true }, {});
      assert.equal(Result.detail, "approved prop-b; no ingester service present");
    });
  }
  return Finish(Count, "Gate-Tool-Handoff");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Gate-Tool-Handoff`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
