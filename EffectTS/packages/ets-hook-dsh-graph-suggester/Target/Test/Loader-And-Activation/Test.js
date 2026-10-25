import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LedgerLines,
  LedgerWith,
  MakeCounter,
  Make,
  Plugin,
  rm,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "graph-suggester");
      assert.equal(typeof Plugin.apply, "function");
      assert.ok(Plugin.Config !== void 0);
      assert.deepEqual(Plugin.inject, ["pluginFactory", "workspaceGraph"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "L2: apply returns NOTHING and the state probe exists", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.On, false);
    });
    Check(Count, "L2: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["graph-suggester: disabled (enabled=false)"]);
    });
    Check(Count, "L2: the disabled line is in the durable ledger exactly once", () => {
      assert.equal(LedgerWith("disabled (enabled=false)").length, 1);
      assert.ok(LedgerLines()[0]?.endsWith("] disabled (enabled=false)"));
    });
    Check(Count, "L2: a disabled mount still wires both listeners on the plugin ctx", () => {
      assert.ok(Run.CtxListeners["tools/post-execute"] instanceof Function);
      assert.ok(Run.CtxListeners["agent/pre-step"] instanceof Function);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Check(Count, "L3: the activation line is byte-exact", () => {
      assert.ok(
        Run.Lines.includes("graph-suggester: activated (bundle 0.2.0, intents 2, threshold 0.75)")
      );
    });
    Check(Count, "L3: the activation line is in the durable ledger exactly once", () => {
      assert.equal(
        LedgerWith("activated (bundle 0.2.0, intents 2, threshold 0.75)").length,
        1
      );
    });
    Check(Count, "L3: the listeners register on the plugin ctx in order", () => {
      assert.deepEqual(Object.keys(Run.CtxListeners), [
        "loader/volatile-update",
        "tools/post-execute",
        "agent/pre-step"
      ]);
    });
    Check(Count, "L3: the root is a distinct context object", () => {
      assert.notEqual(Run.Root, Run.Context);
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    const Decision = { kind: "allow" };
    await CheckAsync(Count, "L4: a non-judged tool passes the decision through unchanged", async () => {
      const Result = await Run.CtxListeners["tools/post-execute"](
        { name: "write", arguments: { file_path: "x.md" }, agent: { agent: { id: "a" } } },
        void 0,
        async () => Decision
      );
      assert.equal(Result, Decision);
      assert.deepEqual(Run.Lines.filter((L) => L.includes("candidates call")), []);
    });
    Check(Count, "L4: an intents filter removes the pack intent from the compiled rules", () => {
      const Filtered = Make(Validate({ logFile: Ledger, enabled: true, intents: ["Sibling"] }));
      assert.equal(Filtered.State.Rules.length, 1);
      assert.equal(Filtered.State.Rules[0].id, "Sibling");
      assert.ok(
        Filtered.Lines.includes("graph-suggester: activated (bundle 0.2.0, intents 1, threshold 0.75)")
      );
    });
  }
  {
    Check(Count, "L5: a non-numeric threshold fails loud at load", () => {
      assert.throws(() => Validate({ threshold: "high" }));
    });
    Check(Count, "L5: a non-boolean enabled fails loud at load", () => {
      assert.throws(() => Validate({ enabled: "yes" }));
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Check(Count, "L6: the mount performs ZERO fs operations (read-only by design)", () => {
      assert.equal(Run.Fs.reads.length, 0);
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.resolved.length, 0);
      assert.equal(Run.Fs.stats.length, 0);
    });
    Check(Count, "L6: the state probe carries the factory's module identity", () => {
      assert.equal(Run.State.Module, "graph-suggester");
      assert.equal(Run.State.Rules.length, 2);
      assert.equal(Run.State.Threshold, 0.75);
    });
  }
  return Finish(Count, "Loader-And-Activation");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Loader-And-Activation`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
