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
    const Service = Run.Context.workspaceAudit;
    Check(Count, "S1: the service is the apply-registered instance with the full surface", () => {
      assert.equal(Service, Run.Provided["workspaceAudit"]);
      assert.equal(typeof Service.line, "function");
      assert.equal(typeof Service.assessment, "function");
      assert.equal(typeof Service.chain, "function");
      assert.equal(typeof Service.lines, "function");
      assert.equal(typeof Service.statistics, "function");
    });
    Check(Count, "S1: line() records with the exact shape and the byte-exact ledger line", () => {
      const Line = Service.line({
        operation: "op1",
        category: "commitment",
        path: "/repo/a.ts"
      });
      assert.equal(Line.id, "a1");
      assert.equal(Line.sequence, 1);
      assert.equal(Line.parent, "");
      assert.equal(Line.outcome, "pending");
      assert.equal(Line.assessment, "");
      assert.ok(
        Run.Lines.includes("audit: audit commitment op1 (pending) /repo/a.ts")
      );
    });
  }
  {
    const Run = await Setup();
    const Service = Run.Context.workspaceAudit;
    await CheckAsync(Count, "S1: assessment() closes the loop with the exact line", async () => {
      const Line = Service.assessment("op1", true);
      assert.equal(Line.category, "intent-assessment");
      assert.equal(Line.outcome, "success");
      assert.equal(Line.assessment, "satisfied");
      assert.ok(
        Run.Lines.includes("audit: audit intent-assessment op1 (satisfied) ")
      );
      assert.deepEqual(LinesWith(Run, "intent-assessment op1"), [
        "audit: audit intent-assessment op1 (satisfied) "
      ]);
    });
    await CheckAsync(Count, "S1: an unsatisfied assessment carries the detail", async () => {
      const Line = Service.assessment("op2", false, "spec unmet");
      assert.equal(Line.outcome, "failure");
      assert.equal(Line.assessment, "unsatisfied: spec unmet");
      assert.ok(
        Run.Lines.includes("audit: audit intent-assessment op2 (unsatisfied: spec unmet) ")
      );
    });
    await CheckAsync(Count, "S1: chain() and lines() read the ring and the chain view", async () => {
      Service.line({ operation: "op1", category: "authorization", path: "/x" });
      assert.deepEqual(
        Service.chain("op1").map((Line) => Line.category),
        ["intent-assessment", "authorization"]
      );
      assert.deepEqual(
        Service.lines().map((Line) => Line.id),
        ["a3", "a2", "a1"]
      );
      assert.deepEqual(Service.lines(1).map((Line) => Line.id), ["a3"]);
      assert.deepEqual(Service.statistics(), { operations: 2, lines: 3, sequence: 3 });
    });
  }
  {
    const Run = await Setup({ maxLines: 2 });
    const Service = Run.Context.workspaceAudit;
    Service.line({ operation: "op1", category: "commitment", path: "/a" });
    Service.line({ operation: "op1", category: "commitment", path: "/b" });
    Service.line({ operation: "op1", category: "commitment", path: "/c" });
    Check(Count, "S2: the ring caps at maxLines and the drop is ledgered byte-exactly", () => {
      assert.equal(Run.State.Ring.length, 2);
      assert.deepEqual(
        Service.lines().map((Line) => Line.path),
        ["/c", "/b"]
      );
      assert.deepEqual(LinesWith(Run, "capped a1"), ["audit: capped a1 (maxLines 2)"]);
      assert.deepEqual(Service.statistics(), { operations: 1, lines: 2, sequence: 3 });
    });
  }
  {
    const Run = await Setup();
    const Store = FakeStorage();
    await OpenStorage(Run, Store.facility);
    Check(Count, "S3: the domain spec is name/version/layout/invalidRecords/two tables", () => {
      const Spec = Store.spec;
      assert.equal(Spec.name, "workspace_audit");
      assert.equal(Spec.version, 1);
      assert.equal(Spec.layout, "per-record");
      assert.equal(Spec.invalidRecords, "backup-and-skip");
      assert.ok(Spec.tables.lines !== void 0);
      assert.ok(Spec.tables.ring !== void 0);
    });
    Run.Context.workspaceAudit.line({ operation: "op1", category: "commitment", path: "/a" });
    await Settle();
    const Lines = Store.tables.get("lines");
    const Ring = Store.tables.get("ring");
    Check(Count, "S3: the line lands keyed by id and the ring snapshot under the meta key", () => {
      assert.equal(Lines.get("a1").operation, "op1");
      assert.equal(Ring.get("__ring").length, 1);
    });
  }
  {
    const Store = FakeStorage();
    const First = await Setup({}, Store.facility);
    await Settle();
    await Settle();
    const FirstService = First.Context.workspaceAudit;
    FirstService.line({ operation: "op1", category: "commitment", path: "/a" });
    FirstService.line({ operation: "op1", category: "commitment", path: "/b" });
    FirstService.line({ operation: "op2", category: "commitment", path: "/c" });
    await Settle();
    await Settle();
    const Second = await Setup({}, Store.facility);
    await Settle();
    await Settle();
    const Service = Second.Context.workspaceAudit;
    Check(Count, "S4: the recovery rebuilds the chains and the ring", () => {
      assert.deepEqual(Service.statistics(), { operations: 2, lines: 3, sequence: 3 });
      assert.deepEqual(
        Service.chain("op1").map((Line) => Line.path),
        ["/a", "/b"]
      );
    });
    Check(Count, "S4: the sequence continues at the recovered maximum, never a wall clock", () => {
      const Line = Service.line({ operation: "op3", category: "commitment", path: "/d" });
      assert.equal(Line.id, "a4");
      assert.equal(Line.sequence, 4);
      assert.equal(Second.State.Sequence, 4);
    });
  }
  {
    const Run = await Setup();
    Check(Count, "S5: with no facility the effect is a silent skip and lines live in memory", () => {
      assert.deepEqual(Run.Effects, ["audit-storage"]);
      assert.equal(Run.State.Handle, void 0);
      Run.Context.workspaceAudit.line({ operation: "op1", category: "commitment", path: "/a" });
      assert.equal(Run.Context.workspaceAudit.statistics().lines, 1);
      assert.deepEqual(LinesWith(Run, "storage open failed"), []);
    });
    const Fail = await Setup();
    const Store = FakeStorage({ failOpen: true });
    await OpenStorage(Fail, Store.facility);
    Check(Count, "S5: a failed open logs the byte-exact line and degrades", () => {
      assert.deepEqual(LinesWith(Fail, "storage open failed"), [
        "audit: storage open failed: storage unavailable"
      ]);
      assert.equal(Fail.State.Handle, void 0);
      assert.equal(Fail.State.Ring.length, 0);
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
  return Finish(Count, "Service-And-Storage");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Service-And-Storage`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
