import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  AgentOf,
  CheckAsync,
  Durable,
  DurableLine,
  Finish,
  MakeCounter,
  Post,
  SeedHistory,
  Setup
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Parent = Tree("search-suggester-workspaces-");
const Branch = (Name) => {
  const Full = Path.join(Parent, Name);
  FileSystem.mkdirSync(Full, { recursive: true });
  return Full;
};
const Foreign = Branch("foreign");
const ForeignIndex = Put(Foreign, "Documentation/INDEX.md");
const Rooted = Branch("rooted");
Put(Rooted, "package.json", "{}");
const RootedAnchor = Put(Rooted, "README.md");
Put(Rooted, "CHANGELOG.md");
Put(Rooted, "SCHEME.md");
const Service = (Cwd) => ({ get: () => Cwd });
const Read = (Path_, Id) => ({
  name: "read",
  arguments: { file_path: Path_ },
  agent: AgentOf(Id)
});
const HistoryText = [
  "[search-suggester] intent=History confidence=0.87",
  "targets (1):",
  "- CHANGELOG.md - touched 1 time(s) after a similar call",
  "note: open these before more searches; Target/ is generated, never edit it."
].join("\n");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    await CheckAsync(Count, "G1: a call with no root abstains foreign-workspace", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, Read(ForeignIndex, "a"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
      assert.match(
        DurableLine("abstained foreign-workspace"),
        Durable("abstained foreign-workspace  0.00")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
    await CheckAsync(Count, "G1: the foreign call does not touch the ring", async () => {
      const Rings = Run.State.Rings.State(AgentOf("a"));
      assert.equal(Rings.calls, 0);
      assert.equal(Rings.notes, 0);
      assert.equal(Rings.pending, void 0);
    });
    await CheckAsync(Count, "G1: the cwd probe never throws (a throwing getter still abstains)", async () => {
      const Throwing = Setup();
      Throwing.Context.workingDirectory = {
        get: () => {
          throw new Error("the service getter throws");
        }
      };
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Throwing, Read(ForeignIndex, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "G2: a rooted tree with no history abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Read(RootedAnchor, "b"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
      assert.match(DurableLine("abstained no-history"), Durable("abstained no-history  0.00"));
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    SeedHistory(Run, "c", RootedAnchor, ["CHANGELOG.md", "MISSING.md"]);
    await CheckAsync(Count, "G3: the note names only the companions that exist", async () => {
      const Out = await Post(Run, Read(RootedAnchor, "c"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "search-suggester",
        form: "notice",
        summary: "History 0.87"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
      assert.equal(Out.additionalContexts[0].content[0].text.includes("MISSING.md"), false);
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing companion", async () => {
      assert.ok(
        Run.Lines.includes(`hook-dsh-search-suggester: suggest History 0.87 1 candidates`)
      );
      assert.match(
        DurableLine("suggest History 0.87 1 candidates"),
        Durable("suggest History 0.87 1 candidates")
      );
    });
  }
  {
    const Run = Setup();
    SeedHistory(Run, "d", RootedAnchor, ["MISSING.md", "GONE.md"]);
    await CheckAsync(Count, "G4: an emptied history abstains no-companions", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Read(RootedAnchor, "d"), Decision);
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions History 0.87")
      );
      assert.match(
        DurableLine("abstained no-companions"),
        Durable("abstained no-companions History 0.87")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    SeedHistory(Run, "e", RootedAnchor, ["CHANGELOG.md"]);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Post(Run, Read(ForeignIndex, "e"));
      const Out = await Post(Run, Read(RootedAnchor, "e"));
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
      assert.equal(Out.additionalContexts[0].content[0].text.includes("- CHANGELOG.md"), true);
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
