import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
  Check,
  CheckAsync,
  FakeStorage,
  Finish,
  Home,
  Make,
  MakeCounter
} from "../Harness.js";
const Day = 864e5;
const SnapshotPath = () => Path.join(Home, ".dsh", "pattern", "registry.json");
const Activated = "pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/plugin-dsh-pattern.log)";
const Pattern = (Id, Confidence, UpdatedAt) => ({
  id: Id,
  intent: Id,
  trigger: { keywords: [`kw-${Id}`] },
  targets: [],
  transform: [],
  arbiter: "test",
  confidence: Confidence,
  allowlist: false,
  updatedAt: UpdatedAt
});
const SeedJson = (Patterns) => {
  FileSystem.mkdirSync(Path.dirname(SnapshotPath()), { recursive: true });
  FileSystem.writeFileSync(
    SnapshotPath(),
    JSON.stringify({ version: 1, savedAt: 1, patterns: Patterns }),
    "utf8"
  );
};
const Mount = (Knobs, Store) => Make({ storagePath: SnapshotPath(), ...Knobs }, (Context) => {
  Context.storageDomain = Store.facility;
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Store = FakeStorage();
    const Run = Mount({}, Store);
    await Run.Service.Flush();
    Check(Count, "D1: the spec is name/version/layout/tables with NO compatibleVersions", () => {
      assert.equal(Store.spec.name, "pattern");
      assert.equal(Store.spec.version, 1);
      assert.equal(Store.spec.layout, "per-record");
      assert.equal(Store.spec.invalidRecords, "backup-and-skip");
      assert.ok(Store.spec.tables.patterns !== void 0);
      assert.ok(Store.spec.tables.meta !== void 0);
      assert.equal(Store.spec.compatibleVersions, void 0);
    });
    Check(Count, "D1: the open binds the domain and the effect closes it on dispose", () => {
      assert.deepEqual(Run.Effects, ["pattern-storage"]);
      assert.equal(Run.Disposers.length, 1);
      assert.equal(Store.closed, false);
      Run.Disposers[0]();
      assert.equal(Store.closed, true);
    });
  }
  {
    const Store = FakeStorage();
    const Run = Mount({}, Store);
    await Run.Service.Flush();
    await CheckAsync(Count, "D2: a Record writes the pattern to the patterns table", async () => {
      Run.Service.Record("version-bump", "accepted", 1e3);
      await Run.Service.Flush();
      const Patterns = Store.tables.get("patterns");
      assert.deepEqual(Store.writes, [["patterns", "version-bump"]]);
      assert.equal(Patterns.get("version-bump").confidence, 0.6);
      assert.equal(Patterns.get("version-bump").updatedAt, 1e3);
    });
    await CheckAsync(Count, "D2: the decay writes every pattern it moved, and only those", async () => {
      Run.Service.Record("rename", "rejected", 0);
      Run.Service.Put(Pattern("floor", 0.5, 7));
      await Run.Service.Flush();
      Run.Service.Decay(14 * Day);
      await Run.Service.Flush();
      const Patterns = Store.tables.get("patterns");
      assert.ok(Math.abs(Patterns.get("rename").confidence - 0.4) < 1e-12);
      assert.equal(
        Store.writes.filter(([, Key]) => Key === "rename").length,
        2
      );
      assert.equal(
        Store.writes.filter(([, Key]) => Key === "floor").length,
        0
      );
    });
    await CheckAsync(Count, "D2: the explicit Save writes every pattern and the meta timestamp", async () => {
      await Run.Service.Save();
      const Patterns = Store.tables.get("patterns");
      const Meta = Store.tables.get("meta");
      assert.deepEqual([...Patterns.keys()].sort(), [
        "floor",
        "rename",
        "search",
        "test-update",
        "version-bump"
      ]);
      assert.equal(typeof Meta.get("__savedAt"), "number");
      assert.deepEqual(Run.Lines.slice(-1), [
        "pattern: saved 5 patterns to pattern (logFile ~/.dsh/playform/plugin-dsh-pattern.log)"
      ]);
    });
    await CheckAsync(Count, "D2: a Record in the open window survives the recovery", async () => {
      const Seeded = FakeStorage();
      Seeded.seed("patterns", "version-bump", Pattern("version-bump", 0.9, 1));
      const Window = Mount({}, Seeded);
      Window.Service.Record("version-bump", "accepted", 1e3);
      await Window.Service.Flush();
      const Patterns = Seeded.tables.get("patterns");
      assert.equal(Window.Service.Get("version-bump")?.confidence, 0.6);
      assert.equal(Patterns.get("version-bump").confidence, 0.6);
    });
  }
  {
    const Store = FakeStorage();
    const First = Mount({}, Store);
    await First.Service.Flush();
    First.Service.Record("version-bump", "accepted", 1e3);
    First.Service.Record("rename", "rejected", 1e3);
    await First.Service.Flush();
    const Second = Mount({}, Store);
    await Second.Service.Flush();
    Check(Count, "D3: a reopen restores the stored patterns over the catalog", () => {
      assert.deepEqual(Second.Service.List().map((One) => One.id), [
        "rename",
        "search",
        "test-update",
        "version-bump"
      ]);
      assert.ok(
        Second.Lines.includes(
          "pattern: restored 2 patterns from snapshot (logFile ~/.dsh/playform/plugin-dsh-pattern.log)"
        )
      );
      assert.deepEqual(Second.Lines.slice(0, 2), [
        Activated,
        "pattern: restored 2 patterns from snapshot (logFile ~/.dsh/playform/plugin-dsh-pattern.log)"
      ]);
    });
    Check(Count, "D3: the restored pattern carries the persisted confidence", () => {
      assert.equal(Second.Service.Get("version-bump")?.confidence, 0.6);
      assert.equal(Second.Service.Get("rename")?.confidence, 0.3);
      assert.equal(Second.Service.Get("search")?.confidence, 0.5);
    });
  }
  {
    FileSystem.rmSync(SnapshotPath(), { force: true });
    const Run = Make({ storagePath: SnapshotPath() });
    await CheckAsync(Count, "D4: without a facility the JSON snapshot is the store", async () => {
      Run.Service.Record("version-bump", "accepted", 1e3);
      await Run.Service.Save();
      const Raw = JSON.parse(FileSystem.readFileSync(SnapshotPath(), "utf8"));
      assert.equal(Raw.version, 1);
      assert.equal(Raw.patterns.length, 4);
      assert.deepEqual(Run.Effects, []);
      assert.deepEqual(Run.Lines.slice(-1), [
        `pattern: saved 4 patterns to ${SnapshotPath()} (logFile ~/.dsh/playform/plugin-dsh-pattern.log)`
      ]);
    });
    await CheckAsync(Count, "D4: without a facility the JSON snapshot restores the registry", async () => {
      SeedJson([Pattern("only-one", 0.75, 0), Pattern("only-two", 0.25, 0)]);
      const Fallback = Make({ storagePath: SnapshotPath() });
      await Fallback.Service.Flush();
      assert.deepEqual(Fallback.Service.List().map((One) => One.id), [
        "only-one",
        "only-two"
      ]);
      assert.ok(
        Fallback.Lines.includes(
          "pattern: restored 2 patterns from snapshot (logFile ~/.dsh/playform/plugin-dsh-pattern.log)"
        )
      );
    });
  }
  {
    FileSystem.rmSync(SnapshotPath(), { force: true });
    SeedJson([Pattern("from-file", 0.5, 0)]);
    const Store = FakeStorage({ version: 2 });
    const Run = Mount({}, Store);
    await Run.Service.Flush();
    Check(Count, "D5: a domain-version mismatch is loud and degrades to the JSON fallback", () => {
      assert.ok(
        Run.Lines.includes(
          "pattern: storage open failed: version-mismatch: stored 2, declared 1 (logFile ~/.dsh/playform/plugin-dsh-pattern.log)"
        )
      );
      assert.equal(Store.spec, void 0);
      assert.deepEqual(Run.Service.List().map((One) => One.id), ["from-file"]);
    });
    await CheckAsync(Count, "D5: the degraded mount keeps writing the JSON fallback, never the domain", async () => {
      await Run.Service.Save();
      const Raw = JSON.parse(FileSystem.readFileSync(SnapshotPath(), "utf8"));
      assert.deepEqual(Raw.patterns.map((One) => One.id), ["from-file"]);
      assert.deepEqual(Store.writes, []);
      assert.deepEqual(Run.Lines.slice(-1), [
        `pattern: saved 1 patterns to ${SnapshotPath()} (logFile ~/.dsh/playform/plugin-dsh-pattern.log)`
      ]);
    });
  }
  {
    const Store = FakeStorage();
    const Run = Mount({ domain: "pattern_test" }, Store);
    await Run.Service.Flush();
    Check(Count, "D6: the domain knob renames the domain", () => {
      assert.equal(Store.spec.name, "pattern_test");
    });
    Check(Count, "D6: an invalid domain name fails loud at load", () => {
      assert.throws(
        () => Mount({ domain: "Pattern-Test" }, FakeStorage()),
        /pattern: domain must be a lowercase unit name/
      );
    });
  }
  return Finish(Count, "Storage-Domain");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Storage-Domain`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
