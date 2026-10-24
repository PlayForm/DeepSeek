import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LinesWith,
  Make,
  MakeCounter,
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
const Mount = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};
const Operations = [
  { path: "/repo/src/a.ts", content: "one\n", version: "v1" },
  { path: "/repo/src/b.ts", content: "two\n", version: "v1" }
];
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the hook's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Mount();
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Mount({ policy: { commit: "auto" } });
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, commit: "auto" },
        "the override replaces commit and keeps the rest"
      );
    });
  }
  {
    const Run = Mount();
    const Service = Run.Context.workspaceMerge;
    const Reply = await Service.commit({ id: "b1", operations: Operations });
    await CheckAsync(Count, "P2: an approve verdict refuses the merge with the exact line", async () => {
      assert.deepEqual(LinesWith(Run, "held"), [
        "merge: merge held (2 files) (policy commit=approve)"
      ]);
      assert.equal(
        LinesWith(Run, "batch").length,
        0,
        "the batch never starts and nothing is persisted"
      );
    });
    await CheckAsync(Count, "P2: the refusal is the rejected commit shape, never a guess", async () => {
      assert.deepEqual(Reply, {
        id: "b1",
        status: "rejected",
        reason: "the policy holds the commit (commit=approve)",
        replies: [
          {
            path: "/repo/src/a.ts",
            status: "rejected",
            reason: "the policy holds the commit (commit=approve)"
          },
          {
            path: "/repo/src/b.ts",
            status: "rejected",
            reason: "the policy holds the commit (commit=approve)"
          }
        ]
      });
    });
    await CheckAsync(Count, "P2: ZERO writes, zero reads and no recorded batch", async () => {
      assert.equal(Run.Fs.writes.length, 0, "no write reaches the filesystem");
      assert.equal(Run.Fs.reads.length, 0, "the gates never ran either");
      assert.equal(Run.Fs.stats.length, 0, "no file was even stat-ed");
      assert.deepEqual(Service.batches(), [], "no batch record");
      assert.equal(Service.statistics().batches, 0, "the statistics stay honest");
    });
  }
  {
    const Run = Mount({ policy: { commit: "auto" } });
    const Reply = await Run.Context.workspaceMerge.commit({ id: "b2", operations: Operations });
    await CheckAsync(Count, "P3: an auto verdict proceeds to the gates and the commits", async () => {
      assert.equal(Reply.status, "applied");
      assert.equal(Run.Fs.writes.length, 2, "both files are written");
      assert.deepEqual(LinesWith(Run, "b2"), [
        "merge: batch b2 started (2 files, 8 bytes)",
        "merge: applied /repo/src/a.ts version v2 (batch b2)",
        "merge: applied /repo/src/b.ts version v2 (batch b2)",
        "merge: batch b2 complete (applied 2, conflict 0, denied 0, recovery 0, unknown 0)"
      ]);
      assert.equal(LinesWith(Run, "held").length, 0, "no held line when the gate is open");
    });
  }
  {
    const Run = Mount({ policy: { write: "auto" } });
    const Reply = await Run.Context.workspaceMerge.commit({ id: "b3", operations: Operations });
    await CheckAsync(Count, "P4: a write override never opens the commit gate", async () => {
      assert.equal(Reply.status, "rejected", "the commit is still held");
      assert.ok(
        LinesWith(Run, "held").includes(
          "merge: merge held (2 files) (policy commit=approve)"
        ),
        "the documented held line"
      );
      assert.equal(Run.Fs.writes.length, 0, "still zero writes");
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
