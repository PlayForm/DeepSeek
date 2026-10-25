import assert from "node:assert/strict";
import {
  Check,
  Exec,
  Finish,
  Ledger,
  Make,
  MakeCounter,
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
const Setup = (Raw = {}) => Make(Validate({ logFile: Ledger, enabled: true, ...Raw }), { "a.txt": "hello\nworld\n" });
const Open = async (Run) => Run.Tool.execute(
  {
    action: "open",
    files: ["a.txt"],
    searches: ["s=hello"],
    ops: ["file=* search=s op=replace with=hi"]
  },
  Exec()
);
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the tool's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Setup();
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Setup({ policy: { write: "auto" } });
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, write: "auto" },
        "the override replaces write and keeps the rest"
      );
    });
  }
  {
    const Run = Setup();
    await Open(Run);
    const Refusal = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec()).then(
      () => void 0,
      (Error2) => Error2
    );
    Check(Count, "P2: the default mount refuses the apply with the documented line", () => {
      assert.ok(Refusal instanceof Error, "the commit rejects");
      assert.equal(
        Refusal.message,
        "plugin-dsh-batch-edit: apply refused mach-1 (policy write=approve)",
        "the thrown refusal line"
      );
      assert.ok(
        Run.Lines.includes(
          "plugin-dsh-batch-edit: apply refused mach-1 (policy write=approve)"
        ),
        "the durable ledger line"
      );
    });
    Check(Count, "P2: nothing was planned or written and the machine stays open", () => {
      assert.equal(Run.Fs.writes.length, 0, "zero writes");
      assert.equal(Run.Fs.reads.length, 0, "zero reads (the gate is before the plan)");
      const Machine = Run.State.Machines.get("agent-a")?.get("mach-1");
      assert.ok(Machine !== void 0, "the machine is still open");
      assert.equal(Machine.closed, false, "not closed");
      assert.equal(
        [...Machine.files.values()][0]?.status,
        "observed",
        "the cell waits, uncommitted"
      );
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("transition applied")).length,
        0,
        "no applied line"
      );
    });
  }
  {
    const Run = Setup({ policy: { write: "auto" } });
    await Open(Run);
    const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
    Check(Count, "P3: an auto verdict applies the transition through the write executor", () => {
      assert.equal(Out.applied, 1, "one file applied");
      assert.equal(Out.failed, 0, "no failure");
      assert.equal(Run.Fs.writes.length, 1, "one write");
      assert.ok(
        Run.Lines.includes("plugin-dsh-batch-edit: transition applied a.txt version v1 -> v2"),
        "the applied line"
      );
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("apply refused")).length,
        0,
        "no refusal line when the gate is open"
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
