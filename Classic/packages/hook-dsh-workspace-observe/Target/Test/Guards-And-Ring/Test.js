import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Fire,
  FireMalformed,
  Flip,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
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
    const Run = Setup();
    Fire(Run, "/repo/Target/out/x.ts", "1");
    Check(Count, "G1: an excluded path is ignored with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "ignored"), [
        "observe: ignored /repo/Target/out/x.ts (excluded)"
      ]);
      const Durable = LedgerWith("ignored /repo/Target/out/x.ts (excluded)");
      assert.equal(Durable.length, 1);
      assert.ok((Durable[0] ?? "").endsWith(" ignored /repo/Target/out/x.ts (excluded)"));
    });
    Check(Count, "G1: the excluded event records nothing and moves no counter", () => {
      assert.equal(Run.State.Latest.size, 0);
      assert.equal(Run.State.Sequence, 0);
    });
    Check(Count, "G1: the segment form excludes too (plain name, no glob)", () => {
      Fire(Run, "/repo/node_modules/pkg/index.js", "1");
      assert.ok(LinesWith(Run, "(excluded)").length === 2);
    });
  }
  {
    const Run = Setup();
    Fire(Run, "/repo/src/a.ts", "1", Run.State.Self);
    Check(Count, "G2: an own-actor event is ignored with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "ignored"), [
        "observe: ignored /repo/src/a.ts (own actor)"
      ]);
      assert.equal(Run.State.Latest.size, 0);
      assert.equal(Run.State.Sequence, 0);
    });
  }
  {
    const Run = Setup({ include: ["**/*.ts"] });
    Fire(Run, "/repo/src/readme.md", "1");
    Check(Count, "G3: a non-matching path under a non-empty include is ignored", () => {
      assert.deepEqual(LinesWith(Run, "ignored"), [
        "observe: ignored /repo/src/readme.md (not included)"
      ]);
      assert.equal(Run.State.Latest.size, 0);
    });
    Check(Count, "G3: a matching path under the same include records normally", () => {
      Fire(Run, "/repo/src/a.ts", "1");
      assert.equal(Run.State.Latest.get("/repo/src/a.ts").version, "1");
      assert.equal(Run.State.Sequence, 1);
    });
  }
  {
    const Run = Setup({ maxStamps: 3 });
    for (const Name of ["a", "b", "c", "d", "e"]) {
      Fire(Run, `/repo/src/${Name}.ts`, "1");
    }
    Check(Count, "G4: the ring caps at maxStamps, oldest dropped", () => {
      assert.equal(Run.State.Ring.length, 3);
      assert.deepEqual(
        Run.State.Ring.map((Stamp) => Stamp.path),
        ["/repo/src/c.ts", "/repo/src/d.ts", "/repo/src/e.ts"]
      );
    });
    Check(Count, "G4: each drop is ledgered byte-exactly with its own path", () => {
      assert.ok(LinesWith(Run, "capped").includes("observe: capped /repo/src/a.ts (maxStamps 3)"));
      assert.ok(LinesWith(Run, "capped").includes("observe: capped /repo/src/b.ts (maxStamps 3)"));
      assert.equal(LinesWith(Run, "capped").length, 2);
    });
    Check(Count, "G4: the latest map keeps every path and the counter keeps running", () => {
      assert.equal(Run.State.Latest.size, 5);
      assert.equal(Run.State.Sequence, 5);
    });
  }
  {
    const Run = Setup();
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/a.ts", "2");
    Check(Count, "G5: the latest stamp per path overwrites", () => {
      assert.deepEqual(Run.Context.workspaceObserve.stamp("/repo/src/a.ts"), {
        path: "/repo/src/a.ts",
        version: "2",
        origin: "fs/observed",
        sequence: 2
      });
    });
    Check(Count, "G5: both stamps stay in the ring, newest first", () => {
      assert.deepEqual(
        Run.Context.workspaceObserve.stamps().map((Stamp) => Stamp.version),
        ["2", "1"]
      );
    });
  }
  {
    const Run = Setup();
    FireMalformed(Run);
    Check(Count, "G6: a malformed event never throws and is ledgered as failed", () => {
      assert.deepEqual(LinesWith(Run, "failed"), [
        "observe: failed unknown (malformed event: displayPath is not a string)"
      ]);
      assert.equal(Run.State.Latest.size, 0);
    });
    Check(Count, "G6: the listener keeps working after the failure", () => {
      Fire(Run, "/repo/src/a.ts", "1");
      assert.equal(Run.State.Sequence, 1);
    });
  }
  {
    const Run = Setup({ maxStamps: 4 });
    Fire(Run, "/repo/src/a.ts", "1");
    Fire(Run, "/repo/src/b.ts", "1");
    Flip(runVolatile(Run, "maxStamps"), 2);
    Run.CtxListeners["loader/volatile-update"](["maxStamps"]);
    Check(Count, "G7: the volatile flip refreshes the ring bound in place", () => {
      assert.equal(Run.State.MaxStamps, 2);
    });
    Fire(Run, "/repo/src/c.ts", "1");
    Fire(Run, "/repo/src/d.ts", "1");
    Fire(Run, "/repo/src/e.ts", "1");
    Check(Count, "G7: the new bound applies on the next events with the capped line", () => {
      assert.equal(Run.State.Ring.length, 2);
      assert.ok(
        LinesWith(Run, "capped").includes("observe: capped /repo/src/a.ts (maxStamps 2)")
      );
    });
  }
  return Finish(Count, "Guards-And-Ring");
};
const runVolatile = (Run, Key) => Run.Raw[Key];
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Guards-And-Ring`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
