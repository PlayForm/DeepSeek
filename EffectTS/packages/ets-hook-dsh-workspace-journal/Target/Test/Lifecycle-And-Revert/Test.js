import assert from "node:assert/strict";
import {
  Boot,
  Batch,
  Check,
  CheckAsync,
  Entry,
  Finish,
  Fire,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const Setup = async (Config = {}, Files = {}, Stale = []) => {
  rm();
  const Run = Make(Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" }, ...Config }));
  Run.Fs.files = Files;
  for (const Path of Stale) {
    Run.Fs.staleOn.add(Path);
  }
  await Boot();
  return Run;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = await Setup({}, { "/a": "1" });
    await CheckAsync(Count, "L1: open records the batch and the entries before any write", async () => {
      await Run.Context.workspaceJournal.open(
        { batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
        [
          { path: "/a", state: "present", version: "1", content: "A" },
          { path: "/b", state: "absent", version: "absent", content: "" }
        ]
      );
      assert.equal(Run.State.Batches.get("b1").state, "applying");
      assert.equal(Run.State.Entries.get("b1:/a").state, "present");
      assert.equal(Run.State.Entries.get("b1:/b").state, "absent");
      assert.deepEqual(Run.State.Ring, ["b1"]);
    });
    Check(Count, "L1: the open line is byte-exact", () => {
      assert.deepEqual(LinesWith(Run, "opened b1"), ["journal: opened b1 (2 files)"]);
      assert.deepEqual(
        LedgerWith("opened b1 (2 files)"),
        LedgerLines().filter((Line) => Line.endsWith("opened b1 (2 files)"))
      );
    });
    Check(Count, "L1: the queries read the open batch", () => {
      const Stats = Run.Context.workspaceJournal.statistics();
      assert.deepEqual(Stats, { batches: 1, entries: 2, applying: 1 });
      assert.equal(Run.Context.workspaceJournal.batch("b1").progress, 0);
      assert.deepEqual(
        Run.Context.workspaceJournal.entries("b1").map((E) => E.path),
        ["/a", "/b"]
      );
      assert.deepEqual(
        Run.Context.workspaceJournal.batches().map((B) => B.batchId),
        ["b1"]
      );
    });
  }
  {
    const Run = await Setup();
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a"] },
      [{ path: "/a", state: "present", version: "1", content: "A" }]
    );
    await CheckAsync(Count, "L2: seal verified closes the applying batch byte-exactly", async () => {
      const Sealed = await Run.Context.workspaceJournal.seal("b1", "verified");
      assert.equal(Sealed.state, "verified");
      assert.deepEqual(LinesWith(Run, "sealed b1"), ["journal: sealed b1 verified"]);
    });
    await CheckAsync(Count, "L2: sealing a terminal batch is refused with the byte-exact line", async () => {
      await assert.rejects(
        () => Run.Context.workspaceJournal.seal("b1", "recovery-required", "late"),
        /batch b1 is verified, not applying/
      );
      assert.deepEqual(LinesWith(Run, "seal failed b1"), [
        "journal: seal failed b1 (state verified, not applying)"
      ]);
    });
    await CheckAsync(Count, "L2: sealing an unknown batch is refused byte-exactly", async () => {
      await assert.rejects(() => Run.Context.workspaceJournal.seal("b9", "verified"), /unknown batch: b9/);
      assert.deepEqual(LinesWith(Run, "seal failed b9"), [
        "journal: seal failed b9 (unknown batch)"
      ]);
    });
  }
  {
    const Run = await Setup({}, { "/a": "1" });
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
      [
        { path: "/a", state: "present", version: "1", content: "ORIGINAL" },
        { path: "/b", state: "absent", version: "absent", content: "" }
      ]
    );
    await CheckAsync(Count, "L3: the revert replays backward with the per-file report", async () => {
      const Report = await Run.Context.workspaceJournal.revert("b1");
      assert.deepEqual(
        Report.files.map((F) => [F.path, F.action]),
        [
          ["/b", "removed"],
          ["/a", "restored"]
        ]
      );
    });
    Check(Count, "L3: the absent pre-image is removed and ledgered byte-exactly", () => {
      assert.ok(LinesWith(Run, "reverted b1 /b (already absent)").length === 1);
    });
    Check(Count, "L3: the restored pre-image goes through the fenced write and is ledgered byte-exactly", () => {
      assert.ok(LinesWith(Run, "reverted b1 /a (fence ok)").length === 1);
      assert.equal(Run.Fs.writes.length, 1);
      assert.equal(Run.Fs.writes[0][1], "ORIGINAL");
      assert.equal(Run.Fs.writes[0][2].kind, "replaceIfVersion");
      assert.equal(Run.Fs.writes[0][2].version, "1");
    });
    Check(Count, "L3: the summary line is byte-exact and the batch is terminal", () => {
      assert.deepEqual(LinesWith(Run, "reverted b1 ("), ["journal: reverted b1 (2 files)"]);
      assert.equal(Run.State.Batches.get("b1").state, "reverted");
    });
  }
  {
    const Run = await Setup({}, { "/a": "1" }, ["/a"]);
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a"] },
      [{ path: "/a", state: "present", version: "1", content: "A" }]
    );
    await CheckAsync(Count, "L4: a stale-version write is a conflict, never a silent overwrite", async () => {
      const Report = await Run.Context.workspaceJournal.revert("b1");
      assert.deepEqual(Report.files, [
        { path: "/a", action: "conflict", reason: "version fence failed" }
      ]);
      assert.deepEqual(LinesWith(Run, "conflict: version fence failed"), [
        "journal: reverted b1 /a (conflict: version fence failed)"
      ]);
      assert.equal(Run.Fs.writes.length, 1);
    });
  }
  {
    const Run = await Setup({}, {});
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a"] },
      [{ path: "/a", state: "present", version: "1", content: "A" }]
    );
    await CheckAsync(Count, "L4: a vanished file is a conflict (no restore onto absence)", async () => {
      const Report = await Run.Context.workspaceJournal.revert("b1");
      assert.deepEqual(Report.files, [
        { path: "/a", action: "conflict", reason: "file now absent" }
      ]);
      assert.deepEqual(LinesWith(Run, "conflict: file now absent"), [
        "journal: reverted b1 /a (conflict: file now absent, expected content)"
      ]);
    });
  }
  {
    const Run = await Setup({ maxEntryBytes: 1 });
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a"] },
      [{ path: "/a", state: "present", version: "1", content: "TOOLONG" }]
    );
    await CheckAsync(Count, "L4: a truncated pre-image is skipped, never half-applied", async () => {
      assert.equal(Run.State.Entries.get("b1:/a").truncated, true);
      assert.equal(Run.State.Entries.get("b1:/a").content, "");
      const Report = await Run.Context.workspaceJournal.revert("b1");
      assert.deepEqual(Report.files, [
        { path: "/a", action: "skipped", reason: "truncated pre-image" }
      ]);
      assert.deepEqual(LinesWith(Run, "skipped: pre-image over maxEntryBytes"), [
        "journal: reverted b1 /a (skipped: pre-image over maxEntryBytes)"
      ]);
      assert.equal(Run.Fs.writes.length, 0);
    });
  }
  {
    const Run = await Setup();
    await CheckAsync(Count, "L4: reverting an unknown batch is refused byte-exactly", async () => {
      await assert.rejects(() => Run.Context.workspaceJournal.revert("b9"), /unknown batch: b9/);
      assert.deepEqual(LinesWith(Run, "revert failed b9"), [
        "journal: revert failed b9 (unknown batch)"
      ]);
    });
  }
  {
    const Run = await Setup();
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a"] },
      [{ path: "/a", state: "present", version: "1", content: "A" }]
    );
    await Run.Context.workspaceJournal.seal("b1", "recovery-required", "crash");
    await CheckAsync(Count, "L4: a recovery-required batch is not reversible", async () => {
      await assert.rejects(
        () => Run.Context.workspaceJournal.revert("b1"),
        /batch b1 is recovery-required, not reversible/
      );
      assert.deepEqual(LinesWith(Run, "revert failed b1"), [
        "journal: revert failed b1 (state recovery-required, not reversible)"
      ]);
    });
  }
  {
    const Run = await Setup({ maxBatches: 2 });
    for (const Id of ["b1", "b2", "b3"]) {
      await Run.Context.workspaceJournal.open(
        { batchId: Id, operation: "workspace.commit", files: [`/${Id}`] },
        [Entry(Id, `/${Id}`)]
      );
    }
    Check(Count, "L5: the ring caps at maxBatches and the eviction is ledgered byte-exactly", () => {
      assert.deepEqual(Run.State.Ring, ["b2", "b3"]);
      assert.deepEqual(LinesWith(Run, "capped b1"), ["journal: capped b1 (maxBatches 2)"]);
      assert.equal(Run.Context.workspaceJournal.batch("b1"), void 0);
      assert.equal(Run.Context.workspaceJournal.statistics().batches, 2);
    });
  }
  {
    const Run = await Setup();
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
      [Entry("b1", "/a"), Entry("b1", "/b")]
    );
    Fire(Run, "/a");
    Check(Count, "L6: an observed write on an applying batch advances progress byte-exactly", () => {
      assert.equal(Run.State.Batches.get("b1").progress, 1);
      assert.deepEqual(LinesWith(Run, "observed /a in b1"), [
        "journal: observed /a in b1 (progress 1)"
      ]);
    });
    Fire(Run, "/b");
    await CheckAsync(Count, "L6: the boot pass marks applying batches recovery-required byte-exactly", async () => {
      const Report = await Run.Context.workspaceJournal.recover();
      assert.deepEqual(Report, { batchIds: ["b1"] });
      assert.equal(Run.State.Batches.get("b1").state, "recovery-required");
      assert.equal(
        Run.State.Batches.get("b1").reason,
        "applying at boot with 2/2 writes observed"
      );
      assert.deepEqual(LinesWith(Run, "recovery-required b1"), [
        "journal: recovery-required b1 (applying at boot with 2/2 writes observed)"
      ]);
    });
    await CheckAsync(Count, "L6: a second pass reports nothing (no double-marking)", async () => {
      const Report = await Run.Context.workspaceJournal.recover();
      assert.deepEqual(Report, { batchIds: [] });
    });
  }
  {
    const Run = await Setup();
    Run.State.Batches.set("z1", Batch("z1", ["/x"]));
    Run.State.Batches.get("z1").progress = 0;
    await CheckAsync(Count, "L6: a zero-progress applying batch is marked with 0/1", async () => {
      await Run.Context.workspaceJournal.recover();
      assert.equal(Run.State.Batches.get("z1").state, "recovery-required");
      assert.deepEqual(LinesWith(Run, "recovery-required z1"), [
        "journal: recovery-required z1 (applying at boot with 0/1 writes observed)"
      ]);
    });
  }
  return Finish(Count, "Lifecycle-And-Revert");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Lifecycle-And-Revert`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
