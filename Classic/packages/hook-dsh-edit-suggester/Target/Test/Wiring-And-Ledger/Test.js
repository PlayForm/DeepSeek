import assert from "node:assert/strict";
import {
  AgentOf,
  Check,
  CheckAsync,
  Durable,
  Exports,
  Finish,
  FirstLine,
  Ledger,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Plugin,
  Post,
  rm,
  Setup,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "W1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "hook-dsh-edit-suggester");
      assert.equal(Plugin.apply, Exports.apply);
      assert.equal(Plugin.Config, Exports.Config);
      assert.deepEqual(Plugin.inject, ["pluginFactory"]);
      assert.equal(Exports.name, "hook-dsh-edit-suggester");
      assert.equal(typeof Plugin.apply, "function");
      assert.equal(typeof Plugin.Config, "function");
    });
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Check(Count, "W1: apply returns NOTHING (a returned value kills delivery)", () => {
      assert.equal(Run.Returned, void 0);
    });
  }
  {
    const Run = Setup();
    Check(Count, "W2: the two listeners register on the plugin context only", () => {
      assert.deepEqual(Object.keys(Run.CtxListeners), [
        "loader/volatile-update",
        "tools/post-execute",
        "agent/pre-step"
      ]);
      assert.deepEqual(Run.RootNames, []);
      assert.notEqual(Run.Root, Run.Context);
      assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
    });
    Check(Count, "W2: the activation line is byte-exact in the logger form", () => {
      assert.deepEqual(Run.Lines, ["hook-dsh-edit-suggester: activated (bundle 0.1.0, families 7, threshold 0.75)"]);
      assert.deepEqual(Run.Effects, []);
    });
    Check(Count, "W2: the activation line is byte-exact in the durable form", () => {
      assert.equal(LedgerLines().length, 1);
      assert.match(FirstLine(), Durable("activated (bundle 0.1.0, families 7, threshold 0.75)"));
      assert.deepEqual(LedgerWith("activated (bundle 0.1.0, families 7, threshold 0.75)").length, 1);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "W3: the disabled line is byte-exact in both forms", () => {
      assert.deepEqual(Run.Lines, ["hook-dsh-edit-suggester: disabled (enabled=false)"]);
      assert.equal(LedgerLines().length, 1);
      assert.match(FirstLine(), Durable("disabled (enabled=false)"));
    });
    await CheckAsync(Count, "W3: a disabled mount passes every call through with zero new lines", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, { name: "edit", arguments: { file_path: "package.json" }, agent: AgentOf("a") }, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Run.Lines, ["hook-dsh-edit-suggester: disabled (enabled=false)"]);
      assert.equal(LedgerLines().length, 1);
    });
  }
  {
    Check(Count, "W4: a string enabled fails loud at load", () => {
      assert.throws(() => Validate({ enabled: "yes" }), /expected boolean but got yes/);
    });
    Check(Count, "W4: a string maxNoteChars fails loud at load", () => {
      assert.throws(() => Validate({ maxNoteChars: "long" }), /expected number but got long/);
    });
    const Run = Setup();
    Check(Count, "W4: the schema defaults land on the built State", () => {
      assert.equal(Run.State.On, true);
      assert.equal(Run.State.Threshold, 0.75);
      assert.deepEqual(Run.State.Tools, ["write", "edit", "raw-write"]);
      assert.equal(Run.State.MaxCompanions, 7);
      assert.equal(Run.State.MaxNoteChars, 1200);
      assert.equal(Run.State.CooldownCalls, 6);
      assert.equal(Run.State.MaxNotesPerTurn, 3);
      assert.deepEqual(Run.State.Exclude, ["node_modules", "Target", ".git", "dist"]);
      assert.equal(Run.State.Pack.length, 7);
      assert.equal(Run.State.Factory, Run.Context.pluginFactory);
    });
  }
  {
    const Run = Setup();
    await Post(Run, { name: "edit", arguments: { file_path: "package.json" }, agent: AgentOf("a") });
    await Post(Run, { name: "edit", arguments: { file_path: "unrelated/deep/file.go" }, agent: AgentOf("a") });
    Check(Count, "W5: zero ctx.fs calls across emit and abstain", () => {
      assert.equal(Run.Fs.reads, 0);
      assert.equal(Run.Fs.writes, 0);
    });
    Check(Count, "W5: no logger warnings (the fail-open path never fired)", () => {
      assert.deepEqual(Run.Warns, []);
    });
  }
  return Finish(Count, "Wiring-And-Ledger");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Ledger`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
