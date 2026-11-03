import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  Call,
  CheckAsync,
  Finish,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Setup
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Foreign = Tree("test-suggester-foreign-");
const ForeignTest = Put(Foreign, "Source/Test/Foo/Test.ts");
const Rooted = Tree("test-suggester-rooted-");
Put(Rooted, "package.json", "{}");
const RootedTest = Put(Rooted, "Source/Library.ts");
Put(Rooted, "README.md");
Put(Rooted, "SCHEME.md");
const Service = (Cwd) => ({ get: () => Cwd });
const Seed = (Run, Agent, Followers) => {
  Run.State.History.set(Agent, {
    Seq: Followers.length + 1,
    Touches: [RootedTest, ...Followers].map((Path_, Seq) => ({
      seq: Seq,
      path: Path_,
      tool: "read"
    }))
  });
};
const HistoryText = [
  "[test-suggester] intent=History confidence=0.87",
  "targets (2):",
  "- README.md - touched 1 time(s) after this file",
  "- SCHEME.md - touched 1 time(s) after this file",
  "note: these files were touched right after this one in this workspace"
].join("\n");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Agent = { agent: { id: "gate-a" } };
    const Run = Setup();
    delete Run.Context.workingDirectory;
    await CheckAsync(Count, "G1: a call with no root abstains foreign-workspace", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Call(Run, "read", { file_path: ForeignTest }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
      assert.equal(LedgerWith("abstained foreign-workspace  0.00").length, 1);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
    });
    await CheckAsync(Count, "G1: the foreign call does not touch the per-agent memory", async () => {
      assert.equal(Run.State.Agents.get(Agent), void 0);
    });
    await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
      const Throwing = Setup();
      Throwing.Context.workingDirectory = {
        get: () => {
          throw new Error("the service getter throws");
        }
      };
      const Decision = { kind: "allow" };
      const Out = await Call(Throwing, "read", { file_path: ForeignTest }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Agent = { agent: { id: "gate-b" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    Seed(Run, Agent, ["README.md", "SCHEME.md"]);
    await CheckAsync(Count, "G2: the call path's own root wins over the session cwd", async () => {
      const Out = await Call(Run, "read", { file_path: RootedTest }, Agent);
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
    });
  }
  {
    const Agent = { agent: { id: "gate-c" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent, ["README.md", "SCHEME.md"]);
    await CheckAsync(Count, "G3: the History note names the companions of the temp root", async () => {
      const Out = await Call(Run, "read", { file_path: RootedTest }, Agent);
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "test-suggester",
        form: "notice",
        summary: "History 0.87"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
    });
    await CheckAsync(Count, "G3: the suggest line counts the two companions", async () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest History 0.87 2 candidates call read"
      ]);
      assert.equal(LedgerWith("suggest History 0.87 2 candidates call read").length, 1);
    });
    await CheckAsync(Count, "G3: the rooted workspace with no history abstains no-history", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", { file_path: RootedTest }, { agent: { id: "gate-d" } }, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, void 0);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
      assert.equal(LedgerWith("abstained no-history  0.00").length, 1);
    });
  }
  {
    const Agent = { agent: { id: "gate-e" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent, ["GONE.md", "ALSO-GONE.md"]);
    await CheckAsync(Count, "G4: an emptied history abstains no-companions with the family and kappa", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", { file_path: RootedTest }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-companions History 0.87"));
      assert.equal(LedgerWith("abstained no-companions History 0.87").length, 1);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
    });
  }
  {
    const Agent = { agent: { id: "gate-f" } };
    const Run = Setup();
    delete Run.Context.workingDirectory;
    Seed(Run, Agent, ["README.md", "SCHEME.md"]);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      const Foreign_ = await Call(Run, "read", { file_path: ForeignTest }, Agent);
      assert.equal(Foreign_.kind, "allow");
      assert.equal(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"), true);
      Run.Context.workingDirectory = Service(Rooted);
      const Out = await Call(Run, "read", { file_path: RootedTest }, Agent);
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
    });
  }
  return Finish(Count, "Workspace-Gate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Workspace-Gate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
