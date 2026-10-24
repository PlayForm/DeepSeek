import assert from "node:assert/strict";
import {
  Automation,
  Check,
  Finish,
  LinesWith,
  Make,
  MakeCounter,
  Ledger,
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
    Check(Count, "P1: the queue's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger, enabled: true });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Make(Validate({ logFile: Ledger, enabled: true }));
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Make(
        Validate({ logFile: Ledger, enabled: true, policy: { spawn: "auto" } })
      );
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, spawn: "auto" },
        "the override replaces spawn and keeps the rest"
      );
    });
  }
  {
    const { Run, Service, Subagents } = Automation({ policy: { spawn: "approve" } });
    Service.Enqueue({ spec: "Build the parser", role: "coder", priority: 1 });
    await Service.Flush();
    Check(Count, "P2: an approve verdict never calls the subagent service", () => {
      assert.equal(Subagents.calls.length, 0, "no spawn call");
      assert.equal(LinesWith(Run, "spawned").length, 0, "no spawned line");
    });
    Check(Count, "P2: the held line is byte-exact and the task waits with its seat", () => {
      assert.ok(
        Run.Lines.includes("plugin-dsh-queue: spawn held queue-1 (policy spawn=approve)"),
        "the documented refusal line"
      );
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "dispatched", "the task waits");
      assert.equal(Run.State.Seats.get("main"), 1, "the seat stays held");
      assert.equal(Run.State.Tasks.get("queue-1")?.childId, void 0, "no child id");
    });
  }
  {
    const { Run, Service, Subagents } = Automation();
    Service.Enqueue({ spec: "Build the parser", role: "coder", priority: 1 });
    await Service.Flush();
    Check(Count, "P3: an auto verdict proceeds to the spawn", () => {
      assert.equal(Subagents.calls.length, 1, "exactly one spawn call");
      assert.ok(
        Run.Lines.includes("plugin-dsh-queue: spawned queue-1 -> child-1"),
        "the spawned line"
      );
      assert.equal(Run.State.Tasks.get("queue-1")?.childId, "child-1");
    });
  }
  {
    const { Run, Service, Subagents } = Automation({ autoSpawn: false });
    Service.Enqueue({ spec: "x" });
    await Service.Flush();
    Check(Count, "P4: a knob that is off refuses silently even with the gate open", () => {
      assert.equal(Subagents.calls.length, 0, "no spawn call");
      assert.equal(LinesWith(Run, "spawn").length, 0, "no spawn line at all");
      assert.equal(Run.State.Tasks.get("queue-1")?.state, "queued", "the task waits queued");
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
