import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  LinesWith,
  Make,
  MakeCounter,
  MakeRoot,
  Plugin,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
    Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "client-dsh-panel-family-host");
      assert.equal(typeof Plugin.apply, "function");
      assert.ok(Plugin.Config);
      assert.deepEqual(Plugin.inject, ["webServer"]);
    });
    Check(Count, "L1: apply returns NOTHING and the service is provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Service !== void 0);
      assert.equal(typeof Run.Service.tail, "function");
      assert.equal(typeof Run.Service.stats, "function");
    });
  }
  {
    const Run = Make(Validate({ logRoot: MakeRoot() }));
    Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
      assert.deepEqual(Run.Lines, ["host: activated (enabled=false)"]);
    });
    await CheckAsync(Count, "W1: a disabled endpoint answers with the refusal, never reads", async () => {
      assert.deepEqual(await Run.Service.tail("hook-dsh-workspace-observe", 5), {
        ok: false,
        code: "rejected",
        message: "the panel-family host is disabled (enabled=false)"
      });
      assert.deepEqual(await Run.Service.stats(), {
        ok: false,
        code: "rejected",
        message: "the panel-family host is disabled (enabled=false)"
      });
    });
  }
  {
    const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
    Check(Count, "W2: the activation line is byte-exact", () => {
      assert.deepEqual(Run.Lines, ["host: activated (enabled=true)"]);
    });
  }
  {
    Check(Count, "X1: maxLines below 1 fails loud at load", () => {
      assert.throws(() => Validate({ maxLines: 0 }), /expected number >= 1/);
    });
    Check(Count, "X1: maxLines above 2000 fails loud at load", () => {
      assert.throws(() => Validate({ maxLines: 2001 }), /expected number <= 2000/);
    });
  }
  {
    const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
    Check(Count, "W3: nothing is logged on apply beyond the activation line", () => {
      assert.deepEqual(LinesWith(Run, "host:"), Run.Lines);
      assert.equal(Run.Lines.length, 1);
    });
  }
  return Finish(Count, "Wiring-And-Endpoints");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Endpoints`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
