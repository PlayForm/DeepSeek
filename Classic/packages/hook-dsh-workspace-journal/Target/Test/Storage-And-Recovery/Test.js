import assert from "node:assert/strict";
import {
  Boot,
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LinesWith,
  MakeCounter,
  Make,
  OpenStorage,
  rm,
  Validate,
  FakeStorage
} from "../Harness.js";
const Setup = async (Config = {}, Facility = void 0) => {
  rm();
  const Run = Make(
    Validate({ logFile: Ledger, enabled: true, ...Config }),
    (Context) => {
      if (Facility !== void 0) {
        Context.storageDomain = Facility.facility ?? Facility;
      }
    }
  );
  await Boot();
  return Run;
};
const Settle = async () => {
  await new Promise((Resolve) => setImmediate(Resolve));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = await Setup();
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    Check(Count, "S1: the domain spec is name/version/layout/invalidRecords/three tables", () => {
      const Spec = Store.spec;
      assert.equal(Spec.name, "workspace_journal");
      assert.equal(Spec.version, 1);
      assert.equal(Spec.layout, "per-record");
      assert.equal(Spec.invalidRecords, "backup-and-skip");
      assert.ok(Spec.tables.batches !== void 0);
      assert.ok(Spec.tables.entries !== void 0);
      assert.ok(Spec.tables.ring !== void 0);
    });
    Check(Count, "S1: the open binds the handle", () => {
      assert.ok(Run.State.Handle !== void 0);
    });
  }
  {
    const Run = await Setup();
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    await Run.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
      [
        { path: "/a", state: "present", version: "1", content: "A" },
        { path: "/b", state: "absent", version: "absent", content: "" }
      ]
    );
    await Settle();
    const Batches = Store.tables.get("batches");
    const Entries = Store.tables.get("entries");
    const Ring = Store.tables.get("ring");
    Check(Count, "S2: the batch record lands keyed by batchId", () => {
      assert.equal(Batches.get("b1").state, "applying");
      assert.deepEqual(Batches.get("b1").files, ["/a", "/b"]);
    });
    Check(Count, "S2: the entries land keyed batchId:path", () => {
      assert.equal(Entries.get("b1:/a").state, "present");
      assert.equal(Entries.get("b1:/b").state, "absent");
    });
    Check(Count, "S2: the ring snapshot lands under the meta key", () => {
      assert.deepEqual(Ring.get("__ring"), ["b1"]);
    });
  }
  {
    const Store = FakeStorage();
    const First = await Setup({}, Store.facility);
    await OpenStorage(First, Store.facility);
    await First.Context.workspaceJournal.open(
      { batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
      [
        { path: "/a", state: "present", version: "1", content: "A" },
        { path: "/b", state: "absent", version: "absent", content: "" }
      ]
    );
    await Settle();
    const Second = await Setup({}, Store.facility);
    await OpenStorage(Second, Store.facility);
    Check(Count, "S3: the recovery rebuilds batches, entries and ring from the store", () => {
      assert.equal(Second.State.Batches.size, 1);
      assert.equal(Second.State.Entries.size, 2);
      assert.deepEqual(Second.State.Ring, ["b1"]);
      assert.equal(Second.Context.workspaceJournal.batch("b1").state, "applying");
      assert.deepEqual(
        Second.Context.workspaceJournal.entries("b1").map((E) => E.path),
        ["/a", "/b"]
      );
    });
    Check(Count, "S3: the recovered batch still progresses on observed writes", () => {
      Second.Listeners["fs/observed"](
        { displayPath: "/a", targetKey: "/a" },
        { kind: "present", version: "1" },
        { agent: { id: "agent-a" } }
      );
      assert.equal(Second.State.Batches.get("b1").progress, 1);
      assert.deepEqual(LinesWith(Second, "observed /a in b1"), [
        "journal: observed /a in b1 (progress 1)"
      ]);
    });
  }
  {
    const Store = FakeStorage();
    Store.seed("batches", "bad", { batchId: "bad", state: "nonsense" });
    Store.seed("batches", "b1", {
      batchId: "b1",
      operation: "workspace.commit",
      parent: "",
      state: "applying",
      files: ["/a"],
      progress: 0,
      reason: "",
      at: 1
    });
    const Run = await Setup({}, Store.facility);
    await OpenStorage(Run, Store.facility);
    Check(Count, "S4: a record failing validation is skipped, never guessed", () => {
      assert.equal(Run.State.Batches.size, 1);
      assert.equal(Run.State.Batches.get("bad"), void 0);
      assert.equal(Run.State.Batches.get("b1").batchId, "b1");
    });
  }
  {
    const Run = await Setup();
    Check(Count, "S5: with no facility the effect is a silent skip and batches live in memory", () => {
      assert.deepEqual(Run.Effects, ["journal-storage"]);
      assert.equal(Run.State.Handle, void 0);
      assert.deepEqual(LinesWith(Run, "storage open failed"), []);
    });
    const Fail = await Setup();
    const Store = FakeStorage({ failOpen: true });
    await OpenStorage(Fail, Store.facility);
    Check(Count, "S5: a failed open logs the byte-exact line and degrades", () => {
      assert.deepEqual(LinesWith(Fail, "storage open failed"), [
        "journal: storage open failed: storage unavailable"
      ]);
      assert.equal(Fail.State.Handle, void 0);
    });
  }
  {
    let Closed = 0;
    const Store = FakeStorage();
    const RawOpen = Store.facility.open;
    Store.facility.open = async (Spec) => {
      const Handle = await RawOpen(Spec);
      return {
        ...Handle,
        close: async () => {
          Closed += 1;
        }
      };
    };
    const Run = await Setup({}, Store.facility);
    await OpenStorage(Run, Store.facility);
    await CheckAsync(Count, "S6: the disposer closes the open handle and clears it", async () => {
      assert.ok(Run.State.Handle !== void 0);
      assert.equal(Run.Disposers.length, 1);
      await Run.Disposers[0]();
      await Settle();
      assert.equal(Closed, 1);
      assert.equal(Run.State.Handle, void 0);
    });
  }
  return Finish(Count, "Storage-And-Recovery");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Storage-And-Recovery`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
