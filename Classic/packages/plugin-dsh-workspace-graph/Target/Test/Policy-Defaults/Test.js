import assert from "node:assert/strict";
import { Decide } from "../../../../plugin-dsh-factory/Target/Library.js";
import {
  Check,
  CheckAsync,
  Finish,
  GraphClass,
  LinesWith,
  MakeCounter,
  MakeGraph
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
    Check(Count, "P1: the graph's schema fills the D6 policy defaults", () => {
      const Config = GraphClass.Config({ enabled: true });
      assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
    });
    Check(Count, "P1: the built State carries the block on Allow", () => {
      const Run = MakeGraph({ files: {} });
      assert.deepEqual(Run.State.Allow, Defaults, "the constructor maps policy -> Allow");
    });
    Check(Count, "P1: a policy override lands on the built State", () => {
      const Run = MakeGraph({ files: {}, policy: { index: "approve" } });
      assert.deepEqual(
        Run.State.Allow,
        { ...Defaults, index: "approve" },
        "the override replaces index and keeps the rest"
      );
    });
  }
  {
    const Run = MakeGraph({ files: {} });
    Check(Count, "P2: the graph's action classes all decide auto", () => {
      assert.equal(Decide(Run.State.Allow, "index"), "auto", "index is automatic");
      assert.equal(Decide(Run.State.Allow, "read"), "auto", "read is automatic");
      assert.equal(Decide(Run.State.Allow, "record"), "auto", "record is automatic");
      assert.equal(LinesWith(Run, "policy").length, 0, "no policy line");
      assert.equal(LinesWith(Run, "held").length, 0, "no held line");
    });
  }
  {
    const Path = "/proj/src/policy.ts";
    const Run = MakeGraph({ enabled: true, files: { [Path]: "export const value = 1;\n" } });
    await CheckAsync(
      Count,
      "P3: indexFile still proceeds under the shipped defaults and writes no file",
      async () => {
        const Outcome = await Run.Graph.indexFile(Path);
        assert.equal(Outcome.status, "indexed", "the record is produced");
        assert.equal(Run.Graph.statistics().files, 1, "the graph holds the file");
        assert.equal(LinesWith(Run, "disabled").length, 0, "no refusal line");
        assert.equal(Run.writes.length, 0, "zero file writes");
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
