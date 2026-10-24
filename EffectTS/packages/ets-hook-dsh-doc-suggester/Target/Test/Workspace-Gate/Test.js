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
const Foreign = Tree("doc-suggester-foreign-");
const ForeignIndex = Put(Foreign, "Documentation/INDEX.md");
const Ours = Tree("doc-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursIndex = Put(Ours, "Documentation/INDEX.md");
const OursReadme = Put(Ours, "README.md");
const Service = (Cwd) => ({ get: () => Cwd });
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(Run.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00"));
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
      const Out = await Post(
        Throwing,
        { name: "read", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the companions that exist", async () => {
      const Out = await Post(Run, {
        name: "read",
        arguments: { file_path: OursIndex },
        agent: AgentOf("a")
      });
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "doc-suggester",
        form: "notice",
        summary: "Index 0.87"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[doc-suggester] family=Index confidence=0.87\ncompanions (1):\n- Documentation/ARCHIVE-STYLE.md - the row format\nnote: a documentation task rarely touches one file; keep the doc graph coherent."
      );
      assert.equal(Text.includes("Documentation/Handoff"), false);
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing companions", async () => {
      assert.ok(
        Run.Lines.includes(
          `hook-dsh-doc-suggester: suggest Index 0.87 1 companions ${OursIndex}`
        )
      );
      assert.match(
        DurableLine(`suggest Index 0.87 1 companions ${OursIndex}`),
        Durable(`suggest Index 0.87 1 companions ${OursIndex}`)
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes("Documentation/Handoff")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G4: an emptied family abstains no-companions with the family and kappa", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: OursReadme }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-doc-suggester: abstained no-companions PackageProse 0.87")
      );
      assert.match(
        DurableLine("abstained no-companions"),
        Durable("abstained no-companions PackageProse 0.87")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Post(Run, { name: "read", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") });
      Run.Context.workingDirectory = Service(Ours);
      const Out = await Post(Run, {
        name: "read",
        arguments: { file_path: OursIndex },
        agent: AgentOf("a")
      });
      assert.equal(Out.additionalContexts[0].source.summary, "Index 0.87");
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
