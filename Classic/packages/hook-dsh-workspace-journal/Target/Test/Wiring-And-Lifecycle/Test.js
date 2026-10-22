import assert from "node:assert/strict";
import {
  Boot,
  Check,
  Finish,
  Fire,
  FireMalformed,
  Ledger,
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
      assert.equal(Loader.default.name, "hook-dsh-workspace-journal");
      assert.equal(Loader.default.apply, Loader.apply);
      assert.ok(Loader.default.Config !== void 0);
      assert.deepEqual(Loader.default.inject, ["pluginFactory", "fs"]);
    });
    Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Provided["workspaceJournal"] !== void 0);
    });
    Check(Count, "W1: a disabled mount registers NOTHING on the root context", () => {
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Run.Effects, []);
    });
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["journal: disabled (enabled=false)"]);
    });
    Check(Count, "W1: a cold-mount service still reads honestly from the empty state", () => {
      assert.deepEqual(Run.Context.workspaceJournal.statistics(), {
        batches: 0,
        entries: 0,
        applying: 0
      });
      assert.equal(Run.Context.workspaceJournal.batch("b1"), void 0);
      assert.deepEqual(Run.Context.workspaceJournal.batches(), []);
      assert.deepEqual(Run.Context.workspaceJournal.entries("b1"), []);
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
        "journal: activated (domain=workspace_journal, maxBatches=200)"
      ]);
      assert.deepEqual(Run.Effects, ["journal-storage"]);
    });
    Check(Count, "W2: the volatile-update listener is registered on the plugin ctx", () => {
      assert.ok(Run.CtxListeners["loader/volatile-update"] !== void 0);
    });
  }
  {
    const Run = await Setup({ exclude: ["skipme"] });
    Fire(Run, "/repo/skipme/x.ts");
    Check(Count, "W3: an excluded segment is ignored with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "excluded"), [
        "journal: ignored /repo/skipme/x.ts (excluded)"
      ]);
    });
    Fire(Run, "/repo/a.ts", Run.State.Self);
    Check(Count, "W3: the hook's OWN actor is ignored with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "own actor"), [
        "journal: ignored /repo/a.ts (own actor)"
      ]);
    });
    Check(Count, "W3: a foreign event outside any batch records nothing", () => {
      Fire(Run, "/repo/b.ts");
      assert.deepEqual(LinesWith(Run, "observed "), []);
      assert.equal(Run.State.Batches.size, 0);
    });
    Check(Count, "W3: a malformed event never throws and is ledgered byte-exactly", () => {
      FireMalformed(Run);
      assert.deepEqual(LinesWith(Run, "failed"), [
        "journal: failed unknown (malformed event: displayPath is not a string)"
      ]);
    });
    Check(Count, "W3: the listener path touches ZERO file content (no reads, no writes)", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.reads.length, 0);
    });
  }
  {
    Check(Count, "W4: maxBatches below 1 fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxBatches: 0 })),
        /journal: maxBatches must be an integer >= 1/
      );
    });
    Check(Count, "W4: maxEntryBytes below 1 fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxEntryBytes: 0 })),
        /journal: maxEntryBytes must be an integer >= 1/
      );
    });
    Check(Count, "W4: an empty domain fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
        /journal: domain must be a non-empty string/
      );
    });
    Check(Count, "W4: a non-array exclude fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, exclude: "nope" })),
        /\.exclude expected array/
      );
    });
  }
  {
    const Run = await Setup();
    Fire(Run, "/repo/a.ts");
    Fire(Run, "/repo/b.ts");
    Check(Count, "W5: the service is the apply-registered instance", () => {
      assert.equal(Run.Context.workspaceJournal, Run.Provided["workspaceJournal"]);
      assert.equal(typeof Run.Context.workspaceJournal.open, "function");
      assert.equal(typeof Run.Context.workspaceJournal.seal, "function");
      assert.equal(typeof Run.Context.workspaceJournal.revert, "function");
      assert.equal(typeof Run.Context.workspaceJournal.recover, "function");
      assert.equal(typeof Run.Context.workspaceJournal.statistics, "function");
    });
    Check(Count, "W5: with no open batch the counter does not move (no wall clock)", () => {
      assert.equal(Run.State.Batches.size, 0);
      assert.equal(Run.State.Ring.length, 0);
      assert.deepEqual(LinesWith(Run, "observed "), []);
    });
  }
  return Finish(Count, "Wiring-And-Lifecycle");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Lifecycle`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
