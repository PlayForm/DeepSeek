import assert from "node:assert/strict";
import { Decide } from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import {
  Check,
  CheckAsync,
  FakeGraph,
  FileNode,
  Finish,
  Ledger,
  LinesWith,
  Make,
  MakeCounter,
  rm,
  SymbolNode,
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
const Graph = () => FakeGraph([
  SymbolNode("Alpha", "/repo/src/a.ts", "sym-alpha"),
  FileNode("/repo/src/a.ts", "file-a")
]);
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "P1: the hook's schema fills the D6 policy defaults", () => {
      const Config = Validate({ logFile: Ledger, enabled: true });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = Make(Validate({ logFile: Ledger, enabled: true }));
      assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = Make(
        Validate({ logFile: Ledger, enabled: true, policy: { read: "approve" } })
      );
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, read: "approve" },
        "the override replaces read and keeps the rest"
      );
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Check(Count, "P2: the hook has no gated action (suggest is automatic)", () => {
      assert.equal(Decide(Run.State.Allow, "suggest"), "auto", "the suggest class is automatic");
      assert.equal(LinesWith(Run, "policy").length, 0, "no policy line");
      assert.equal(LinesWith(Run, "held").length, 0, "no held line");
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), Graph());
    await CheckAsync(Count, "P3: the suggestion proceeds under the defaults and writes no file", async () => {
      const Outcome = await Run.Context.workspaceOperate.proposeRename({
        path: "/repo/src/a.ts",
        name: "Alpha",
        to: "Beta",
        version: "v1"
      });
      assert.equal(Outcome.status, "proposed", "the proposal is recorded");
      assert.equal(Outcome.proposal.id, "rename-1", "the suggestion is produced");
      assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line");
      assert.equal(Run.Fs.writes.length, 0, "zero file writes");
    });
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
