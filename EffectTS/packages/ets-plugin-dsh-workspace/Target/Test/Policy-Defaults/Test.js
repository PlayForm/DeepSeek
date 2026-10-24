import assert from "node:assert/strict";
import { Decide } from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  rm,
  StandardGraph,
  Tool,
  Validate
} from "../Harness.js";
const Defaults = {
  read: "auto",
  index: "auto",
  record: "auto",
  suggest: "auto",
  write: "approve",
  commit: "approve",
  spawn: "approve",
  message: "auto"
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the workspace's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger, enabled: true });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Make(
        Validate({ logFile: Ledger, enabled: true, policy: { read: "approve" } }),
        StandardGraph()
      );
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, read: "approve" },
        "the override replaces read and keeps the rest"
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
    Check(Count, "P2: the workspace's action classes all decide auto", () => {
      assert.equal(Decide(Run.State.Allow, "read"), "auto", "read is automatic");
      assert.equal(Decide(Run.State.Allow, "index"), "auto", "index is automatic");
      assert.equal(Decide(Run.State.Allow, "record"), "auto", "record is automatic");
      assert.equal(
        Run.Lines.some((Line) => Line.includes("policy") || Line.includes("held")),
        false,
        "no policy or held line on the mount"
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
    const Map = Tool(Run, "workspace_map");
    await CheckAsync(
      Count,
      "P3: workspace_map still proceeds under the shipped defaults and writes no file",
      async () => {
        const Result = await Map.execute({}, {});
        assert.equal(Result.indexRevision, "rev-1", "the reply is produced");
        assert.equal(Result.files, 2, "the map answers from the graph");
        assert.equal(Result.modules.length, 2, "the modules are rendered");
        assert.equal(
          Run.Lines.some((Line) => Line.includes("disabled")),
          false,
          "no refusal line"
        );
        assert.equal(Run.Fs.writes.length, 0, "zero file writes");
      }
    );
  }
  return Finish(Count, "Policy-Defaults");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Policy-Defaults`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
