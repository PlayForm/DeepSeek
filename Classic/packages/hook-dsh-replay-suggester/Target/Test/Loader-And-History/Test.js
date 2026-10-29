import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  Plugin,
  rm,
  rmStore,
  Store,
  Validate,
  WriteStore
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "replay-suggester");
      assert.equal(typeof Plugin.apply, "function");
      assert.ok(Plugin.Config !== void 0);
      assert.deepEqual(Plugin.inject, ["pluginFactory"]);
    });
  }
  {
    rm();
    rmStore();
    const Run = Make(Validate({ logFile: Ledger, historyPath: Store, enabled: false }));
    Check(Count, "L2: apply returns NOTHING and the state probe exists", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.On, false);
    });
    Check(Count, "L2: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(LinesWith(Run, "disabled (enabled=false)"), [
        "replay-suggester: disabled (enabled=false)"
      ]);
    });
    Check(Count, "L2: the disabled line is in the durable ledger exactly once", () => {
      assert.equal(LedgerWith("disabled (enabled=false)").length, 1);
      assert.ok(LedgerWith("disabled (enabled=false)")[0]?.endsWith("] disabled (enabled=false)"));
    });
    Check(Count, "L2: a disabled mount still wires both listeners on the plugin ctx", () => {
      assert.ok(Run.CtxListeners["tools/post-execute"] instanceof Function);
      assert.ok(Run.CtxListeners["agent/pre-step"] instanceof Function);
    });
  }
  {
    rm();
    rmStore();
    const Run = Setup_Missing();
    Check(Count, "L3: the activation line is byte-exact", () => {
      assert.ok(
        Run.Lines.includes(
          `replay-suggester: activated (bundle ${"0.2.1"}, intents 1, threshold 0.75, history 0)`
        )
      );
    });
    Check(Count, "L3: a missing store degrades to silence with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "history missing"), [
        "replay-suggester: history missing (starting empty)"
      ]);
      assert.equal(LedgerWith("history missing (starting empty)").length, 1);
    });
    Check(Count, "L3: the records stay empty and the listeners are wired", () => {
      assert.equal(Run.State.Records.length, 0);
      assert.ok(Run.CtxListeners["tools/post-execute"] instanceof Function);
    });
  }
  {
    rm();
    WriteStore([
      { intent: "Repeat", probe: '{"file_path":"src/A.ts"}', files: ["src/A.ts"], verify: "pnpm test", at: 17e8 },
      { intent: "Repeat", probe: "src/B.ts", files: ["src/B.ts"], verify: "", at: 1700000001 },
      { intent: "Repeat", probe: "", files: ["src/C.ts"], verify: "", at: 1700000002 },
      { intent: "Repeat", files: ["src/D.ts"], verify: "", at: 1700000003 }
    ]);
    const Run = Setup_Missing();
    Check(Count, "L4: the loaded outcome is the byte-exact records line", () => {
      assert.deepEqual(LinesWith(Run, "history loaded"), [
        "replay-suggester: history loaded 2 records"
      ]);
      assert.equal(LedgerWith("history loaded 2 records").length, 1);
    });
    Check(Count, "L4: invalid records are filtered, valid ones are kept", () => {
      assert.equal(Run.State.Records.length, 2);
      assert.deepEqual(Run.State.Records[0].files, ["src/A.ts"]);
    });
    await CheckAsync(Count, "L4: a record with an empty verification falls back to the pack note", async () => {
      const Decision = { kind: "allow" };
      await Run.CtxListeners["tools/post-execute"](
        {
          name: "read",
          arguments: { file_path: "src/B.ts", pattern: "export function", glob: "**/*.ts" },
          agent: { agent: { id: "a" } }
        },
        void 0,
        async () => Decision
      );
      assert.ok(
        Run.Lines.some((L) => L.includes("suggest Repeat 0.77 1 candidates call read"))
      );
    });
  }
  {
    rm();
    WriteStore("this is not json");
    const Run = Setup_Missing();
    Check(Count, "L5: unparseable JSON degrades with the corrupt line and a reason", () => {
      assert.equal(LinesWith(Run, "history corrupt").length, 1);
      assert.ok(LinesWith(Run, "history corrupt")[0]?.startsWith("replay-suggester: history corrupt (starting empty)"));
      assert.equal(Run.State.Records.length, 0);
    });
    rm();
    WriteStore({ schema: 2, records: [] });
    const WrongSchema = Setup_Missing();
    Check(Count, "L5: a wrong schema version degrades with the corrupt line", () => {
      assert.deepEqual(LinesWith(WrongSchema, "history corrupt"), [
        "replay-suggester: history corrupt (starting empty)"
      ]);
    });
    rm();
    WriteStore("null");
    const NullStore = Setup_Missing();
    Check(Count, "L5: a null store degrades with the corrupt line", () => {
      assert.deepEqual(LinesWith(NullStore, "history corrupt"), [
        "replay-suggester: history corrupt (starting empty)"
      ]);
    });
  }
  {
    Check(Count, "L6: a non-numeric threshold fails loud at load", () => {
      assert.throws(() => Validate({ threshold: "high" }));
    });
    Check(Count, "L6: a non-boolean enabled fails loud at load", () => {
      assert.throws(() => Validate({ enabled: "yes" }));
    });
  }
  {
    rm();
    rmStore();
    const Run = Make(Validate({ logFile: Ledger, historyPath: Store, enabled: true }));
    Check(Count, "L7: the listeners register on the plugin ctx in order", () => {
      assert.deepEqual(Object.keys(Run.CtxListeners), [
        "loader/volatile-update",
        "tools/post-execute",
        "agent/pre-step"
      ]);
    });
    Check(Count, "L7: the root is a distinct context object", () => {
      assert.notEqual(Run.Root, Run.Context);
    });
  }
  return Finish(Count, "Loader-And-History");
};
const Setup_Missing = () => {
  rm();
  return Make(Validate({ logFile: Ledger, historyPath: Store, enabled: true }));
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Loader-And-History`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
