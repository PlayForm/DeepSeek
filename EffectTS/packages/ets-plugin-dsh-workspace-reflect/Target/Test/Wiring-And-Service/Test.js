import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LedgerLines,
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
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Provided["workspaceReflect"] !== void 0);
    });
    Check(Count, "W1: a disabled mount wires NOTHING - no listener, no effect, no state probe", () => {
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Run.Effects, []);
      assert.equal(Run.State, void 0);
    });
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["reflect: disabled (enabled=false)"]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "W2: the activation line is byte-exact and nothing is wired even when enabled", () => {
      assert.deepEqual(Run.Lines, ["reflect: activated (propagate=block)"]);
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Run.Effects, []);
    });
    Check(Count, "W2: the activation line is durable too", () => {
      assert.equal(LedgerLines().filter((L) => L.endsWith("activated (propagate=block)")).length, 1);
    });
    Check(Count, "W2: the state probe is attached and carries the config-derived fields", () => {
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.On, true);
      assert.equal(Run.State.Propagate, "block");
      assert.equal(Run.State.Module, "reflect");
    });
  }
  {
    rm();
    Check(Count, "W3: a bad propagate fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, propagate: "both" })),
        /propagate/
      );
    });
    Check(Count, "W3: maxFileBytes below 1 fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxFileBytes: 0 })),
        /reflect: maxFileBytes must be an integer >= 1/
      );
    });
    Check(Count, "W3: a non-integer maxBlockLines fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxBlockLines: 1.5 })),
        /reflect: maxBlockLines must be an integer >= 1/
      );
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceReflect;
    Check(Count, "W4: the service exposes rename/connect/replace/act", () => {
      assert.equal(typeof Service.rename, "function");
      assert.equal(typeof Service.connect, "function");
      assert.equal(typeof Service.replace, "function");
      assert.equal(typeof Service.act, "function");
    });
    await CheckAsync(Count, "W4: act dispatches a rename op through the rename path", async () => {
      const Reply = await Service.act({
        kind: "rename",
        path: "/repo/none.ts",
        startLine: 1,
        endLine: 2,
        oldName: "a",
        newName: "b"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "not an observed file");
    });
    await CheckAsync(Count, "W4: act dispatches a replace op through the replace path", async () => {
      const Reply = await Service.act({
        kind: "replace",
        path: "/repo/none.ts",
        startLine: 0,
        endLine: 1,
        text: ""
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "not an observed file");
    });
    await CheckAsync(Count, "W4: act dispatches a connect op through the connect path", async () => {
      const Reply = await Service.act({
        kind: "connect",
        fromPath: "/repo/none.ts",
        toPath: "/repo/other.ts"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "not an observed file");
    });
  }
  return Finish(Count, "Wiring-And-Service");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Service`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
