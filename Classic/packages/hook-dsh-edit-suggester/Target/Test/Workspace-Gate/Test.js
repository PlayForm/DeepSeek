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
const Foreign = Tree("edit-suggester-foreign-");
const ForeignIndex = Put(Foreign, "Documentation/INDEX.md");
const Ours = Tree("edit-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursConfig = Put(Ours, "Source/Variable/Config.ts");
Put(Ours, "README.md");
Put(Ours, "Site/Source/Component/Configurator.astro");
const Empty = Tree("edit-suggester-empty-");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const EmptyWorkflow = Put(Empty, ".github/workflows/NPM.yml");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(
        Run,
        { name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
        Decision
      );
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
      const Out = await Post(
        Throwing,
        { name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Run = Setup();
    delete Run.Context.workingDirectory;
    await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the companions that exist", async () => {
      const Out = await Post(Run, {
        name: "edit",
        arguments: { file_path: OursConfig },
        agent: AgentOf("a")
      });
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "edit-suggester",
        form: "notice",
        summary: "Config 0.87"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[edit-suggester] family=Config confidence=0.87\ncompanions (2):\n- README.md - the Config section\n- Site/Source/Component/Configurator.astro - the site surface\nnote: this file rarely stands alone; check whether these need the same change."
      );
      assert.equal(Text.includes("SCHEME.md"), false);
      assert.equal(Text.includes("cordis.patch.yml"), false);
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing companions", async () => {
      assert.ok(
        Run.Lines.includes(
          `hook-dsh-edit-suggester: suggest Config 0.87 2 companions ${OursConfig}`
        )
      );
      assert.match(
        DurableLine(`suggest Config 0.87 2 companions ${OursConfig}`),
        Durable(`suggest Config 0.87 2 companions ${OursConfig}`)
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: an emptied family abstains no-companions with the family and kappa", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "edit", arguments: { file_path: EmptyWorkflow }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-edit-suggester: abstained no-companions Workflow 0.87")
      );
      assert.match(
        DurableLine("abstained no-companions"),
        Durable("abstained no-companions Workflow 0.87")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Post(Run, { name: "edit", arguments: { file_path: ForeignIndex }, agent: AgentOf("a") });
      Run.Context.workingDirectory = Service(Ours);
      const Out = await Post(Run, {
        name: "edit",
        arguments: { file_path: OursConfig },
        agent: AgentOf("a")
      });
      assert.equal(Out.additionalContexts[0].source.summary, "Config 0.87");
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
