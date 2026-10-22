import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  Plugin,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "G1: the default object carries exactly name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "hook-dsh-workspace-merge");
      assert.equal(typeof Plugin.apply, "function");
      assert.equal(typeof Plugin.Config, "function");
      assert.deepEqual(Plugin.inject, ["pluginFactory", "fs"]);
      assert.deepEqual(Object.keys(Plugin), ["name", "apply", "Config", "inject"]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "G2: apply returns NOTHING and exposes the state probe", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.Module, "merge");
      assert.equal(Run.State.DomainName, "workspace_merge");
      assert.equal(Run.State.Mode, "all-or-nothing");
    });
    Check(Count, "G2: the workspaceMerge service is registered from apply", () => {
      assert.ok(Run.Provided["workspaceMerge"] !== void 0);
      assert.ok(Run.Context.workspaceMerge !== void 0);
      assert.equal(typeof Run.Context.workspaceMerge.preview, "function");
      assert.equal(typeof Run.Context.workspaceMerge.commit, "function");
    });
    Check(Count, "G2: the storage effect is declared", () => {
      assert.deepEqual(Run.Effects, ["merge-storage"]);
    });
    Check(Count, "G2: the activation line is byte-exact (logger and durable file)", () => {
      assert.deepEqual(Run.Lines, [
        "merge: activated (domain=workspace_merge, mode=all-or-nothing)"
      ]);
      const Durable = LedgerWith(
        "activated (domain=workspace_merge, mode=all-or-nothing)"
      );
      assert.equal(Durable.length, 1);
      assert.match(Durable[0], /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] /);
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "G3: a disabled mount logs the honest line and registers no tool-less wiring", () => {
      assert.deepEqual(Run.Lines, ["merge: disabled (enabled=false)"]);
      assert.ok(Run.Provided["workspaceMerge"] !== void 0);
    });
  }
  {
    Check(Count, "G4: an empty domain fails loud with the module-prefixed error", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
        /merge: domain must be a non-empty string/
      );
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceMerge;
    await CheckAsync(Count, "G5: an empty batch is rejected with the byte-exact line", async () => {
      const Reply = await Service.commit({ operations: [] });
      assert.deepEqual(Reply, {
        id: "batch-1",
        status: "rejected",
        reason: "empty batch",
        replies: []
      });
      assert.deepEqual(LinesWith(Run, "batch"), [
        "merge: batch batch-1 started (0 files, 0 bytes)",
        "merge: batch batch-1 rejected (empty batch)"
      ]);
      assert.equal(LedgerWith("batch batch-1 rejected (empty batch)").length, 1);
    });
    await CheckAsync(Count, "G5: a missing version fence is rejected", async () => {
      const Reply = await Service.commit({
        operations: [{ path: "/repo/src/a.ts", content: "x", version: "" }]
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.reason, "a version fence is missing");
    });
    await CheckAsync(Count, "G5: a duplicate path is rejected", async () => {
      const Reply = await Service.commit({
        operations: [
          { path: "/repo/src/a.ts", content: "x", version: "v1" },
          { path: "/repo/src/a.ts", content: "y", version: "v1" }
        ]
      });
      assert.equal(Reply.reason, "duplicate path /repo/src/a.ts");
    });
    await CheckAsync(Count, "G5: the size gate and the byte gate reject with their reasons", async () => {
      const Small = await Make(Validate({ logFile: Ledger, enabled: true, maxFiles: 1 }));
      const ReplySmall = await Small.Context.workspaceMerge.commit({
        operations: [
          { path: "/repo/src/a.ts", content: "x", version: "v1" },
          { path: "/repo/src/b.ts", content: "y", version: "v1" }
        ]
      });
      assert.equal(ReplySmall.reason, "too many files (2 > 1)");
      const Byte = await Make(
        Validate({ logFile: Ledger, enabled: true, maxTotalBytes: 10 })
      );
      const ReplyByte = await Byte.Context.workspaceMerge.commit({
        operations: [{ path: "/repo/src/a.ts", content: "0123456789012345", version: "v1" }]
      });
      assert.equal(ReplyByte.reason, "too many bytes (16 > 10)");
    });
    await CheckAsync(Count, "G5: a version conflict rejects the whole batch (all-or-nothing)", async () => {
      const Reply = await Service.commit({
        operations: [{ path: "/repo/src/stale.ts", content: "x", version: "v1" }]
      });
      assert.equal(
        Reply.reason,
        "conflict /repo/src/stale.ts (expected v1, observed v2)"
      );
      assert.deepEqual(Reply.replies, [
        {
          path: "/repo/src/stale.ts",
          status: "rejected",
          reason: "conflict /repo/src/stale.ts (expected v1, observed v2)"
        }
      ]);
      assert.deepEqual(LinesWith(Run, "conflict"), [
        "merge: batch batch-4 rejected (conflict /repo/src/stale.ts (expected v1, observed v2))"
      ]);
      assert.equal(Run.Fs.writes.length, 0);
    });
    await CheckAsync(Count, "G5: a batch record is kept for every rejected attempt", async () => {
      const Record = Service.batch("batch-4");
      assert.equal(Record?.status, "rejected");
      assert.equal(Service.batches().length, 4);
      assert.equal(Service.statistics().rejected, 4);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceMerge;
    await CheckAsync(Count, "G6: the preview reports ready files and the digest, and writes NOTHING", async () => {
      const Reply = await Service.preview({
        operations: [
          { path: "/repo/src/a.ts", content: "one", version: "v1" },
          { path: "/repo/src/b.ts", content: "two", version: "v1" }
        ]
      });
      assert.equal(Reply.ok, true);
      assert.equal(Reply.id, "preview-1");
      assert.deepEqual(
        Reply.files.map((File) => [File.path, File.status]),
        [
          ["/repo/src/a.ts", "ready"],
          ["/repo/src/b.ts", "ready"]
        ]
      );
      assert.equal(
        Reply.digest,
        createHash("sha256").update("one\ntwo").digest("hex")
      );
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(LinesWith(Run, "batch").length, 0);
    });
    await CheckAsync(Count, "G6: a preview reports a conflict without writing", async () => {
      const Reply = await Service.preview({
        operations: [{ path: "/repo/src/stale.ts", content: "x", version: "v1" }]
      });
      assert.equal(Reply.ok, false);
      assert.deepEqual(Reply.files, []);
      assert.equal(
        Reply.reason,
        "conflict /repo/src/stale.ts (expected v1, observed v2)"
      );
      assert.equal(Run.Fs.writes.length, 0);
    });
  }
  return Finish(Count, "Wiring-And-Gates");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Gates`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
