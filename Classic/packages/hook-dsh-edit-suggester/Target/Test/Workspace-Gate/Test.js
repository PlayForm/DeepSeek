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
const Foreign = Tree("edit-suggester-foreign-");
const ForeignConfig = Put(Foreign, "Source/Variable/Config.ts");
const Rooted = Tree("edit-suggester-rooted-");
Put(Rooted, "package.json", "{}");
const RootedConfig = Put(Rooted, "Source/Variable/Config.ts");
Put(Rooted, "README.md");
Put(Rooted, "SCHEME.md");
const Service = (Cwd) => ({ get: () => Cwd });
const Edit = (Path_, Id) => ({
  name: "edit",
  arguments: { file_path: Path_ },
  agent: AgentOf(Id)
});
const HistoryText = [
  "[edit-suggester] family=History confidence=0.87",
  "companions (2):",
  "- README.md - touched 1 time(s) after this file",
  "- SCHEME.md - touched 1 time(s) after this file",
  "note: this file rarely stands alone; check whether these need the same change."
].join("\n");
const Seed = (Run, Id, Anchor) => {
  Commit(Run, Id, Anchor);
  Commit(Run, Id, "README.md");
  Commit(Run, Id, "SCHEME.md");
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    delete Run.Context.workingDirectory;
    await CheckAsync(Count, "G1: a call with no root abstains foreign-workspace", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, Edit(ForeignConfig, "a"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
      assert.match(
        DurableLine("abstained foreign-workspace"),
        Durable("abstained foreign-workspace  0.00")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
    await CheckAsync(Count, "G1: the foreign call does not touch the ring", async () => {
      const Rings = Run.State.Rings.State(AgentOf("a"));
      assert.equal(Rings.calls, 0);
      assert.equal(Rings.touched.size, 0);
      assert.equal(Rings.notes, 0);
    });
    await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
      const Throwing = Setup();
      Throwing.Context.workingDirectory = {
        get: () => {
          throw new Error("the service getter throws");
        }
      };
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Throwing, Edit(ForeignConfig, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    await CheckAsync(Count, "G2: the History note names the companions of the temp root", async () => {
      await Run.Ready;
      Seed(Run, "b", RootedConfig);
      const Out = await Post(Run, Edit(RootedConfig, "b"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "edit-suggester",
        form: "notice",
        summary: "History 0.87"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
    });
    await CheckAsync(Count, "G2: the suggest line counts the two companions", async () => {
      assert.ok(
        Run.Lines.includes(
          `hook-dsh-edit-suggester: suggest History 0.87 2 companions ${RootedConfig}`
        )
      );
      assert.match(
        DurableLine(`suggest History 0.87 2 companions ${RootedConfig}`),
        Durable(`suggest History 0.87 2 companions ${RootedConfig}`)
      );
    });
    await CheckAsync(Count, "G2: the rooted workspace with no history abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Edit(RootedConfig, "c"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained no-history  0.00"));
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
