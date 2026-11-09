import assert from "node:assert/strict";
import {
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
const Setup = (Config = {}, Facility = void 0) => {
  rm();
  return Make(
    Validate({ logFile: Ledger, enabled: true, ...Config }),
    (Context) => {
      if (Facility !== void 0) {
        Context.storageDomain = Facility;
      }
    }
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Provided["workspaceApprove"] !== void 0);
    });
    Check(Count, "W1: a disabled mount registers NOTHING on the root context", () => {
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Run.Effects, []);
    });
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["approve: disabled (enabled=false)"]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "W2: fs/observed is registered on the ROOT context only", () => {
      assert.deepEqual(Run.RootNames, ["fs/observed"]);
      assert.equal(Run.CtxListeners["fs/observed"], void 0);
    });
    Check(Count, "W2: the root identity is a distinct context object", () => {
      assert.notEqual(Run.Root, Run.Context);
      assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
    });
    Check(Count, "W2: the activation line is byte-exact and the storage effect is armed", () => {
      assert.deepEqual(Run.Lines, ["approve: activated (domain=workspace_approve)"]);
      assert.deepEqual(Run.Effects, ["approve-storage"]);
      assert.ok(Run.State !== void 0);
    });
  }
  {
    rm();
    Check(Count, "W3: an empty domain fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
        /approve: domain must be a non-empty string/
      );
    });
    Check(Count, "W3: maxBindings below 1 fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxBindings: 0 })),
        /approve: maxBindings must be an integer >= 1/
      );
    });
    Check(Count, "W3: a non-boolean requireConstraints fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, requireConstraints: "yes" })),
        /requireConstraints/
      );
    });
  }
  {
    const Run = Setup();
    Check(Count, "W4: with no facility the effect is a silent skip and the bindings live in memory", () => {
      assert.deepEqual(Run.Effects, ["approve-storage"]);
      assert.equal(Run.State.Handle, void 0);
      assert.deepEqual(LinesWith(Run, "storage open failed"), []);
    });
  }
  {
    const Run = Setup();
    const Store = FakeStorage({ failOpen: true });
    await CheckAsync(Count, "W5: a failed open logs the byte-exact line and degrades", async () => {
      await OpenStorage(Run, Store.facility);
      assert.deepEqual(LinesWith(Run, "storage open failed"), [
        "approve: storage open failed: storage unavailable"
      ]);
      assert.equal(Run.State.Handle, void 0);
    });
  }
  {
    const Store = FakeStorage();
    Store.seed("bindings", "ap-1", {
      id: "ap-1",
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: ["no tests"],
      summary: "first",
      decision: "approved",
      committedBy: "human-1",
      sequence: 1
    });
    Store.seed("bindings", "ap-2", {
      id: "ap-2",
      path: "/repo/b.ts",
      fingerprint: "fp-2",
      version: "2",
      constraints: ["review first"],
      summary: "second",
      decision: "pending",
      sequence: 5
    });
    Store.seed("ring", "__ring", [
      {
        id: "ap-1",
        path: "/repo/a.ts",
        fingerprint: "fp-1",
        version: "1",
        constraints: ["no tests"],
        summary: "first",
        decision: "approved",
        committedBy: "human-1",
        sequence: 1
      },
      {
        id: "ap-2",
        path: "/repo/b.ts",
        fingerprint: "fp-2",
        version: "2",
        constraints: ["review first"],
        summary: "second",
        decision: "pending",
        sequence: 5
      },
      { id: "broken" }
    ]);
    const Run = Setup();
    await CheckAsync(Count, "W6: the recovery rebuilds the by-id map and the ring, skipping invalid rows", async () => {
      await OpenStorage(Run, Store.facility);
      assert.equal(Run.State.ById.size, 2);
      assert.equal(Run.State.Ring.length, 2);
      assert.equal(Run.State.ById.get("ap-2").decision, "pending");
      assert.ok(Run.State.Handle !== void 0);
    });
    await CheckAsync(Count, "W6: the sequence restarts at the maximum loaded sequence, never a wall clock", async () => {
      assert.equal(Run.State.Sequence, 5);
      assert.equal(Store.spec.name, "workspace_approve");
      assert.equal(Store.spec.version, 1);
      assert.ok(Store.spec.tables.bindings !== void 0);
      assert.ok(Store.spec.tables.ring !== void 0);
    });
  }
  return Finish(Count, "Wiring-And-Storage");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Storage`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
