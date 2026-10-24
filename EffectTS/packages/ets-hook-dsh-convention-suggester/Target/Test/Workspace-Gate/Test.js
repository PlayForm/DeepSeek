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
const Foreign = Tree("convention-suggester-foreign-");
const ForeignApply = Put(Foreign, "Source/Function/Apply.ts");
const Ours = Tree("convention-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursSource = Put(Ours, "Classic/packages/x/Source/Library.ts");
Put(Ours, "README.md");
const Empty = Tree("convention-suggester-empty-");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const EmptySource = Put(Empty, "Foo.ts");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
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
    delete Run.Context.workingDirectory;
    await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write(ForeignApply, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the companion that exists", async () => {
      const Out = await Post(Run, Write(OursSource, "a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "convention-suggester",
        form: "notice",
        summary: "Docs 0.95"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[convention-suggester] intent=Docs confidence=0.95\ntargets (1):\n- README.md - the package must ship its README\nnote: a package ships README + SCHEME; the config table must match the schema."
      );
      assert.equal(Text.includes("SCHEME.md"), false);
      assert.equal(Text.includes("cordis.patch.yml"), false);
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing companion", async () => {
      assert.ok(
        Run.Lines.includes("convention-suggester: suggest Docs 0.95 1 candidates call write")
      );
      assert.match(
        DurableLine("suggest Docs 0.95 1 candidates call write"),
        Durable("suggest Docs 0.95 1 candidates call write")
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: an emptied intent abstains no-companions with the intent and kappa", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write(EmptySource, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("convention-suggester: abstained no-companions Naming 0.80"));
      assert.match(
        DurableLine("abstained no-companions"),
        Durable("abstained no-companions Naming 0.80")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Post(Run, Write(ForeignApply, "a"));
      Run.Context.workingDirectory = Service(Ours);
      const Out = await Post(Run, Write(OursSource, "a"));
      assert.equal(Out.additionalContexts[0].source.summary, "Docs 0.95");
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
