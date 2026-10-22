import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Fire,
  Ledger,
  LedgerWith,
  MakeCounter,
  Make,
  rm,
  LedgerLines,
  Validate
} from "../Harness.js";
const Setup = () => {
  rm();
  const Run = Make(Validate({ logFile: Ledger, enabled: true }));
  return Run;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Provided["workspaceObserve"] !== void 0);
    });
    Check(Count, "W1: a disabled mount registers NOTHING on the root context", () => {
      assert.deepEqual(Run.RootNames, []);
    });
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["observe: disabled (enabled=false)"]);
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
      assert.deepEqual(Run.Lines, ["observe: activated (domain=workspace_observe)"]);
      assert.deepEqual(Run.Effects, ["observe-storage"]);
    });
  }
  {
    const Run = Setup();
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "2");
    const First = Run.State.Latest.get("/repo/src/a.ts");
    const Second = Run.State.Latest.get("/repo/src/b.ts");
    Check(Count, "W3: two events record sequences 1 and 2 - no wall clock", () => {
      assert.deepEqual(First, {
        path: "/repo/src/a.ts",
        version: "1",
        origin: "fs/observed",
        sequence: 1
      });
      assert.deepEqual(Second, {
        path: "/repo/src/b.ts",
        version: "2",
        origin: "fs/observed",
        sequence: 2
      });
    });
    Check(Count, "W3: a third event advances the sequence to exactly 3", () => {
      Fire(Run, "/repo/src/c.ts", "3");
      assert.equal(Run.State.Latest.get("/repo/src/c.ts").sequence, 3);
      assert.equal(Run.State.Sequence, 3);
    });
    Check(Count, "W3: the stamped ledger line is byte-exact", () => {
      assert.ok(
        Run.Lines.includes("observe: stamped /repo/src/a.ts version 1 (fs/observed)")
      );
      assert.deepEqual(
        LedgerWith("stamped /repo/src/a.ts version 1 (fs/observed)"),
        LedgerLines().filter((Line) => Line.endsWith("stamped /repo/src/a.ts version 1 (fs/observed)"))
      );
      assert.equal(LedgerLines().filter((Line) => Line.endsWith("stamped /repo/src/a.ts version 1 (fs/observed)")).length, 1);
    });
    Check(Count, "W3: the ring is newest first through the service", () => {
      const Ring = Run.Context.workspaceObserve.stamps();
      assert.deepEqual(
        Ring.map((Stamp) => Stamp.sequence),
        [3, 2, 1]
      );
    });
    Check(Count, "W3: an absent observation records version absent, never a fabricated one", () => {
      Run.Listeners["fs/observed"](
        { displayPath: "/repo/src/gone.ts", targetKey: "/repo/src/gone.ts" },
        { kind: "absent" },
        { agent: { id: "agent-a" } }
      );
      assert.equal(Run.State.Latest.get("/repo/src/gone.ts").version, "absent");
      assert.equal(Run.State.Sequence, 4);
    });
  }
  {
    Check(Count, "W4: maxStamps below 1 fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxStamps: 0 })),
        /observe: maxStamps must be an integer >= 1/
      );
    });
    Check(Count, "W4: an empty domain fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
        /observe: domain must be a non-empty string/
      );
    });
  }
  {
    const Run = Setup();
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "2");
    const Service = Run.Context.workspaceObserve;
    Check(Count, "W5: the service is the apply-registered instance", () => {
      assert.equal(Service, Run.Provided["workspaceObserve"]);
      assert.equal(typeof Service.stamp, "function");
      assert.equal(typeof Service.stamps, "function");
      assert.equal(typeof Service.manual, "function");
      assert.equal(typeof Service.statistics, "function");
    });
    Check(Count, "W5: the statistics triple is exact", () => {
      assert.deepEqual(Service.statistics(), { paths: 2, stamps: 2, sequence: 2 });
    });
    Check(Count, "W5: stamp(path) returns the exact latest stamp", () => {
      assert.deepEqual(Service.stamp("/repo/src/a.ts"), {
        path: "/repo/src/a.ts",
        version: "1",
        origin: "fs/observed",
        sequence: 1
      });
      assert.equal(Service.stamp("/repo/src/none.ts"), void 0);
    });
  }
  return Finish(Count, "Wiring-And-Stamps");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Stamps`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
