import assert from "node:assert/strict";
import {
  Boot,
  Check,
  Finish,
  Fire,
  FireMalformed,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const Setup = async (Config = {}) => {
  rm();
  const Run = Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
  await Boot();
  return Run;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Loader = await import("../../../Target/Library.js");
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "W1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Loader.default.name, "hook-dsh-workspace-audit");
      assert.equal(Loader.default.apply, Loader.apply);
      assert.ok(Loader.default.Config !== void 0);
      assert.deepEqual(Loader.default.inject, ["pluginFactory"]);
    });
    Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Provided["workspaceAudit"] !== void 0);
    });
    Check(Count, "W1: a disabled mount registers NOTHING on the root context", () => {
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Run.Effects, []);
    });
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["audit: disabled (enabled=false)"]);
    });
    Check(Count, "W1: a cold-mount service still reads honestly from the empty state", () => {
      assert.deepEqual(Run.Context.workspaceAudit.statistics(), {
        operations: 0,
        lines: 0,
        sequence: 0
      });
      assert.deepEqual(Run.Context.workspaceAudit.chain("op1"), []);
      assert.deepEqual(Run.Context.workspaceAudit.lines(), []);
    });
  }
  {
    const Run = await Setup();
    Check(Count, "W2: fs/observed is registered on the ROOT context only", () => {
      assert.deepEqual(Run.RootNames, ["fs/observed"]);
      assert.equal(Run.CtxListeners["fs/observed"], void 0);
    });
    Check(Count, "W2: the root identity is a distinct context object", () => {
      assert.notEqual(Run.Root, Run.Context);
      assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
    });
    Check(Count, "W2: the activation line is byte-exact and the storage effect is armed", () => {
      assert.deepEqual(Run.Lines, [
        "audit: activated (domain=workspace_audit, maxLines=2000)"
      ]);
      assert.deepEqual(Run.Effects, ["audit-storage"]);
    });
  }
  {
    const Run = await Setup();
    Fire(Run, "/repo/src/a.ts");
    Fire(Run, "/repo/src/b.ts", "absent");
    const First = Run.State.Ring[0];
    const Second = Run.State.Ring[1];
    Check(Count, "W3: two events record sequences 1 and 2 - no wall clock", () => {
      assert.deepEqual(
        [First, Second].map((Line) => ({
          id: Line.id,
          operation: Line.operation,
          category: Line.category,
          path: Line.path,
          outcome: Line.outcome,
          sequence: Line.sequence
        })),
        [
          {
            id: "a1",
            operation: "/repo/src/a.ts",
            category: "outcome-evidence",
            path: "/repo/src/a.ts",
            outcome: "success",
            sequence: 1
          },
          {
            id: "a2",
            operation: "/repo/src/b.ts",
            category: "outcome-evidence",
            path: "/repo/src/b.ts",
            outcome: "failure",
            sequence: 2
          }
        ]
      );
    });
    Check(Count, "W3: the recorded ledger line is byte-exact", () => {
      assert.ok(
        Run.Lines.includes("audit: audit outcome-evidence /repo/src/a.ts (success) /repo/src/a.ts")
      );
      assert.ok(
        Run.Lines.includes("audit: audit outcome-evidence /repo/src/b.ts (failure) /repo/src/b.ts")
      );
      assert.deepEqual(
        LedgerWith("audit outcome-evidence /repo/src/a.ts (success) /repo/src/a.ts"),
        LedgerLines().filter(
          (Line) => Line.endsWith("audit outcome-evidence /repo/src/a.ts (success) /repo/src/a.ts")
        )
      );
    });
    Check(Count, "W3: a third event advances the sequence to exactly 3", () => {
      Fire(Run, "/repo/src/c.ts");
      assert.equal(Run.State.Sequence, 3);
      assert.equal(Run.State.Ring[2].sequence, 3);
    });
    Check(Count, "W3: the parent pointer carries the actor's tag when there is one", () => {
      Fire(Run, "/repo/src/d.ts", "present", { tag: "op9" });
      assert.equal(Run.State.Ring[3].parent, "op9");
      assert.equal(First.parent, "");
    });
  }
  {
    const Run = await Setup({ exclude: ["skipme"] });
    Fire(Run, "/repo/skipme/x.ts");
    Check(Count, "W4: an excluded segment is ignored with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "excluded"), [
        "audit: ignored /repo/skipme/x.ts (excluded)"
      ]);
    });
    Fire(Run, "/repo/a.ts", "present", Run.State.Self);
    Check(Count, "W4: the hook's OWN actor is ignored with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "own actor"), [
        "audit: ignored /repo/a.ts (own actor)"
      ]);
    });
    Check(Count, "W4: a malformed event never throws and is ledgered byte-exactly", () => {
      FireMalformed(Run);
      assert.deepEqual(LinesWith(Run, "failed"), [
        "audit: failed unknown (malformed event: displayPath is not a string)"
      ]);
    });
    Check(Count, "W4: the listener path touches ZERO file content (no reads, no writes)", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.reads.length, 0);
    });
  }
  {
    Check(Count, "W5: maxLines below 1 fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxLines: 0 })),
        /audit: maxLines must be an integer >= 1/
      );
    });
    Check(Count, "W5: an empty domain fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
        /audit: domain must be a non-empty string/
      );
    });
    Check(Count, "W5: a non-array exclude fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, exclude: "nope" })),
        /\.exclude expected array/
      );
    });
  }
  {
    const Run = await Setup();
    Fire(Run, "/repo/src/e.ts");
    Fire(Run, "/repo/src/e.ts");
    Check(Count, "W6: a repeat event with the same version is dropped silently", () => {
      assert.deepEqual(LinesWith(Run, "audit outcome-evidence /repo/src/e.ts"), [
        "audit: audit outcome-evidence /repo/src/e.ts (success) /repo/src/e.ts"
      ]);
      assert.equal(Run.State.Sequence, 1);
      assert.equal(Run.State.Ring.length, 1);
    });
    Check(Count, "W6: a different version is processed normally", () => {
      Fire(Run, "/repo/src/e.ts", "absent");
      assert.equal(Run.State.Sequence, 2);
      assert.equal(Run.State.Ring[1].outcome, "failure");
    });
    Check(Count, "W6: the same version outside the window is processed again", () => {
      const Base = Date.now();
      Run.State.Now = () => Base + 5e3;
      Fire(Run, "/repo/src/e.ts", "absent");
      assert.equal(Run.State.Sequence, 3);
    });
  }
  return Finish(Count, "Wiring-And-Lines");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Lines`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
