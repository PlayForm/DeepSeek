import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Fire,
  Ledger,
  LinesWith,
  MakeCounter,
  Make,
  OpenStorage,
  rm,
  Validate,
  FakeStorage
} from "../Harness.js";
const Setup = (Config = {}, Facility = void 0, Files = {}) => {
  rm();
  return Make(
    Validate({ logFile: Ledger, enabled: true, ...Config }),
    (Context, Run) => {
      if (Facility !== void 0) {
        Context.storageDomain = Facility.facility ?? Facility;
      }
      if (Object.keys(Files).length > 0) {
        const Fs = Run.Fs;
        Fs.files = Files;
      }
    }
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    Check(Count, "S1: the domain spec is name/version/layout/invalidRecords/two tables", () => {
      const Spec = Store.spec;
      assert.equal(Spec.name, "workspace_observe");
      assert.equal(Spec.version, 1);
      assert.equal(Spec.layout, "per-record");
      assert.equal(Spec.invalidRecords, "backup-and-skip");
      assert.ok(Spec.tables.stamps !== void 0);
      assert.ok(Spec.tables.ring !== void 0);
    });
    Check(Count, "S1: the open binds the handle", () => {
      assert.ok(Run.State.Handle !== void 0);
    });
  }
  {
    const Run = Setup();
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "2");
    const Latest = Store.tables.get("stamps");
    const Ring = Store.tables.get("ring");
    Check(Count, "S2: the latest records land keyed by path with the exact shape", () => {
      assert.deepEqual(Latest.get("/repo/src/a.ts"), {
        path: "/repo/src/a.ts",
        version: "1",
        origin: "fs/observed",
        sequence: 1
      });
      assert.deepEqual(Latest.get("/repo/src/b.ts"), {
        path: "/repo/src/b.ts",
        version: "2",
        origin: "fs/observed",
        sequence: 2
      });
    });
    Check(Count, "S2: the ring snapshot lands under the meta key", () => {
      assert.deepEqual(Ring.get("__ring"), Run.State.Ring);
    });
  }
  {
    const Store = FakeStorage();
    const First = Setup();
    await OpenStorage(First, Store.facility);
    Fire(First, "/repo/src/a.ts", "1");
    Fire(First, "/repo/src/b.ts", "2");
    const Second = Setup({}, Store.facility);
    await OpenStorage(Second, Store.facility);
    Check(Count, "S3: the recovery rebuilds latest and ring from the store", () => {
      assert.equal(Second.State.Latest.size, 2);
      assert.equal(Second.State.Ring.length, 2);
      assert.deepEqual(Second.Context.workspaceObserve.stamp("/repo/src/b.ts"), {
        path: "/repo/src/b.ts",
        version: "2",
        origin: "fs/observed",
        sequence: 2
      });
    });
    Check(Count, "S3: the sequence continues at the recovered maximum, never a wall clock", () => {
      Fire(Second, "/repo/src/c.ts", "3");
      assert.equal(Second.State.Sequence, 3);
      assert.equal(Second.State.Latest.get("/repo/src/c.ts").sequence, 3);
    });
  }
  {
    const Run = Setup({ maxStamps: 2 });
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "2");
    Fire(Run, "/repo/src/c.ts", "3");
    const Ring = Store.tables.get("ring");
    Check(Count, "S4: the persisted ring is capped; the latest map is not", () => {
      assert.equal(Ring.get("__ring").length, 2);
      assert.equal(Run.State.Latest.size, 3);
    });
  }
  {
    const Run = Setup({}, void 0, { "/repo/src/a.ts": "9" });
    await CheckAsync(Count, "S5: manual stamps with the stat version and the manual ledger line", async () => {
      const Stamp = await Run.Context.workspaceObserve.manual("/repo/src/a.ts");
      assert.deepEqual(Stamp, {
        path: "/repo/src/a.ts",
        version: "9",
        origin: "manual",
        sequence: 1
      });
      assert.equal(Run.State.Latest.get("/repo/src/a.ts").origin, "manual");
      assert.ok(LinesWith(Run, "manual").includes("observe: manual /repo/src/a.ts version 9"));
      assert.equal(LinesWith(Run, "(fs/observed)").length, 0);
    });
    await CheckAsync(Count, "S5: a manual stat on an absent target records version absent", async () => {
      const Stamp = await Run.Context.workspaceObserve.manual("/repo/src/none.ts");
      assert.equal(Stamp.version, "absent");
      assert.equal(Stamp.sequence, 2);
    });
  }
  {
    const Run = Setup();
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    Fire(Run, "/repo/src/a.ts", "1");
    await Run.Context.workspaceObserve.manual("/repo/src/b.ts");
    Check(Count, "S6: the fake fs records ZERO writeText and readText calls", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.reads.length, 0);
    });
  }
  {
    const Run = Setup();
    Check(Count, "S7: with no facility the effect is a silent skip and the stamps live in memory", () => {
      assert.deepEqual(Run.Effects, ["observe-storage"]);
      assert.equal(Run.State.Handle, void 0);
      Fire(Run, "/repo/src/a.ts", "1");
      assert.equal(Run.Context.workspaceObserve.stamps().length, 1);
      assert.deepEqual(LinesWith(Run, "storage open failed"), []);
    });
  }
  {
    const Run = Setup();
    const Store = FakeStorage({ failOpen: true });
    await OpenStorage(Run, Store.facility);
    Check(Count, "S8: a failed open logs the byte-exact line and degrades", () => {
      assert.deepEqual(LinesWith(Run, "storage open failed"), [
        "observe: storage open failed: storage unavailable"
      ]);
      assert.equal(Run.State.Handle, void 0);
      assert.equal(Run.State.Latest.size, 0);
    });
  }
  {
    const Run = Setup({}, void 0, { "/repo/src/m.ts": "7" });
    Fire(Run, "/repo/src/a.ts", "1");
    await Run.Context.workspaceObserve.manual("/repo/src/m.ts");
    const Service = Run.Context.workspaceObserve;
    Check(Count, "S9: the service statistics count both origins and the shared sequence", () => {
      assert.deepEqual(Service.statistics(), { paths: 2, stamps: 2, sequence: 2 });
    });
    Check(Count, "S9: stamp() resolves the manual latest too", () => {
      assert.equal(Service.stamp("/repo/src/m.ts")?.version, "7");
    });
  }
  return Finish(Count, "Storage-And-Service");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Storage-And-Service`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
