import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  AgentOf,
  CheckAsync,
  Commit,
  Durable,
  DurableLine,
  Finish,
  MakeCounter,
  Post,
  Setup
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Service = (Cwd) => ({ get: () => Cwd });
const Write = (Path_, Id) => ({
  name: "write",
  arguments: { file_path: Path_ },
  agent: AgentOf(Id)
});
const HistoryText = [
  "[convention-suggester] intent=History confidence=0.70",
  "targets (2):",
  "- Source/Library.ts - touched 1 time(s) after this file",
  "- README.md - touched 1 time(s) after this file",
  "note: these files were touched right after this one in this workspace"
].join("\n");
const Seed = (Run, Id, Anchor) => {
  Commit(Run, Id, Anchor);
  Commit(Run, Id, "Source/Library.ts");
  Commit(Run, Id, "README.md");
};
const Foreign = Tree("convention-suggester-foreign-");
const ForeignApply = Put(Foreign, "Source/Function/Apply.ts");
const Rooted = Tree("convention-suggester-rooted-");
FileSystem.mkdirSync(Path.join(Rooted, ".git"));
const RootedAnchor = Put(Rooted, "Source/Function/Apply.ts");
Put(Rooted, "Source/Library.ts");
Put(Rooted, "README.md");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    delete Run.Context.workingDirectory;
    await CheckAsync(Count, "G1: a call with no .git/package.json root abstains foreign-workspace", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, Write(ForeignApply, "a"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"));
      assert.match(
        DurableLine("abstained foreign-workspace"),
        Durable("abstained foreign-workspace  0.00")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
    await CheckAsync(Count, "G1: the foreign call does not touch the per-agent memory", async () => {
      const Memory = Run.State.Agents.get(AgentOf("a"));
      assert.equal(Memory, void 0);
    });
    await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
      const Throwing = Setup();
      Throwing.Context.workingDirectory = {
        get: () => {
          throw new Error("the service getter throws");
        }
      };
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Throwing, Write(ForeignApply, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    await CheckAsync(Count, "G2: the History note names the companions of the temp root", async () => {
      await Run.Ready;
      Seed(Run, "b", RootedAnchor);
      const Out = await Post(Run, Write(RootedAnchor, "b"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "convention-suggester",
        form: "notice",
        summary: "History 0.70"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
    });
    await CheckAsync(Count, "G2: the suggest line counts the two candidates", async () => {
      assert.ok(
        Run.Lines.includes("convention-suggester: suggest History 0.70 2 candidates call write")
      );
      assert.match(
        DurableLine("suggest History 0.70 2 candidates call write"),
        Durable("suggest History 0.70 2 candidates call write")
      );
    });
    await CheckAsync(Count, "G2: the rooted workspace with no history abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write(RootedAnchor, "c"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
      assert.match(
        DurableLine("abstained no-history"),
        Durable("abstained no-history  0.00")
      );
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
