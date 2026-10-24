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
const Version = (Path_, Id) => ({
  name: "grep",
  arguments: { pattern: "1.2.3 version", path: Path_ },
  agent: AgentOf(Id)
});
const Parent = Tree("search-suggester-workspaces-");
const Branch = (Name) => {
  const Full = Path.join(Parent, Name);
  FileSystem.mkdirSync(Full, { recursive: true });
  return Full;
};
const Foreign = Branch("foreign");
const ForeignManifest = Put(Foreign, "package.json");
const Ours = Branch("ours");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursManifest = Put(Ours, "package.json");
Put(Ours, "CHANGELOG.md");
Put(Ours, "README.md");
Put(Ours, "CONTRIBUTING.md");
Put(Ours, "SCHEME.md");
const Empty = Branch("empty");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, Version(ForeignManifest, "a"), Decision);
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
      const Out = await Post(Throwing, Version(ForeignManifest, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Version(ForeignManifest, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the candidates that exist", async () => {
      const Out = await Post(Run, Version(OursManifest, "a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "search-suggester",
        form: "notice",
        summary: "Version 0.92"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[search-suggester] intent=Version confidence=0.92\ntargets (5):\n- package.json - the monorepo manifest\n- CHANGELOG.md - the new section\n- **/README.md - the long tail\n- **/CONTRIBUTING.md - the long tail\n- **/SCHEME.md - the long tail\nnote: open these before more searches; Target/ is generated, never edit it."
      );
      assert.equal(Text.includes("Site/Source/Library/Content.ts"), false);
      assert.equal(Text.includes("Documentation/Plugins/PLUGIN-FAMILY.md"), false);
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing candidates", async () => {
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.92 5 candidates"));
      assert.match(
        DurableLine("suggest Version 0.92 5 candidates"),
        Durable("suggest Version 0.92 5 candidates")
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
        {
          name: "grep",
          arguments: { pattern: "CONTRIBUTING", path: "" },
          agent: AgentOf("a")
        },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Owner 0.66")
      );
      assert.match(
        DurableLine("abstained no-companions"),
        Durable("abstained no-companions Owner 0.66")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Post(Run, Version(ForeignManifest, "a"));
      Run.Context.workingDirectory = Service(Ours);
      const Out = await Post(Run, Version(OursManifest, "a"));
      assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
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
