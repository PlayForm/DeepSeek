import assert from "node:assert/strict";
import * as OS from "node:os";
import {
  Check,
  Finish,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Plugin,
  Seed,
  rm
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Check(Count, "C1: the default export is a class with the static Config and inject", () => {
    assert.equal(typeof Plugin, "function");
    assert.deepEqual(Plugin.inject, []);
    assert.equal(typeof Plugin.Config, "function");
  });
  {
    rm();
    const Run = Make({});
    Check(Count, "C2: the constructor registers the instance as passOn", () => {
      assert.equal(Run.Provided.passOn, Run.Instance);
      assert.equal(Run.Instance.name, "passOn");
      assert.equal(Run.Context.passOn, Run.Instance);
    });
  }
  {
    rm();
    const Run = Make({});
    Check(Count, "C3: Get returns null for an unknown id, never a throw", () => {
      assert.equal(Run.Instance.Get("nonexistent"), null);
    });
  }
  {
    rm();
    const Full = Seed("disabled/pkg.json", '{"name":"d","version":"1.0.0"}');
    const Run = Make({ enabled: false });
    const Proposal = Run.Instance.Prepare({
      kind: "version-bump",
      targets: [Full],
      params: { version: "2.0.0" }
    });
    Check(Count, "C4: a disabled service prepares nothing", () => {
      assert.equal(Proposal, null);
      assert.equal(Run.State.Proposals.size, 0);
    });
    Check(Count, "C4: the disabled refusal is journaled with the kind", () => {
      assert.equal(LedgerWith('"note":"rejected version-bump"').length, 1);
    });
  }
  {
    rm();
    const Run = Make({ maxTargets: 7, expiresSeconds: 30 });
    Check(Count, "C5: the validated config lands on the state verbatim", () => {
      assert.equal(Run.State.Config.maxTargets, 7);
      assert.equal(Run.State.Config.expiresSeconds, 30);
      assert.equal(Run.State.Module, "plugin-dsh-pass-on");
      assert.equal(Run.State.Enabled, true);
      assert.equal(Run.State.Ledger, Run.Config.logFile);
      assert.ok(Run.State.Proposals instanceof Map);
    });
  }
  {
    rm();
    const Run = Make({ logFile: void 0 });
    Check(Count, "C6: the tilde default expands to the home directory", () => {
      assert.equal(
        Run.State.Ledger,
        `${OS.homedir()}/.dsh/pass-on/pass-on.log`
      );
    });
  }
  {
    rm();
    const Full = Seed("silent/pkg.json", '{"name":"s","version":"1.0.0"}');
    const Run = Make({});
    Run.Instance.Prepare({
      kind: "version-bump",
      targets: [Full],
      params: { version: "2.0.0" }
    });
    Run.Instance.Get("anything");
    Check(Count, "C7: the plugin never logs - the journal file is its only voice", () => {
      assert.equal(Run.Lines.length, 0);
      assert.equal(LedgerLines().length >= 1, true);
    });
  }
  return Finish(Count, "Service-And-Contract");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Service-And-Contract`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
