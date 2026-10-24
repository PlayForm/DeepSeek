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
const Service = (Cwd) => ({ get: () => Cwd });
const Suite = (Path_, Agent) => [
  "read",
  { file_path: Path_, hint: "Run-Smokes says PASS" },
  Agent
];
const Counts = (Agent) => [
  "grep",
  { pattern: "expected count", query: "badge" },
  Agent
];
const Foreign = Tree("test-suggester-foreign-");
const ForeignTest = Put(Foreign, "Source/Test/Foo/Test.ts");
const Ours = Tree("test-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursTest = Put(Ours, "Source/Test/Foo/Test.ts");
Put(Ours, "Maintain/Run-Smokes.mjs");
Put(Ours, "README.md");
const Empty = Tree("test-suggester-empty-");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Agent = { agent: { id: "agent-a" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const [Name, Args] = Suite(ForeignTest, Agent);
      const Out = await Call(Run, Name, Args, Agent, Decision);
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
      const [Name, Args] = Suite(ForeignTest, Agent);
      const Out = await Call(Throwing, Name, Args, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    const Run = Setup();
    delete Run.Context.workingDirectory;
    await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
      const Decision = { kind: "allow" };
      const [Name, Args] = Suite(ForeignTest, Agent);
      const Out = await Call(Run, Name, Args, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the companions that exist", async () => {
      const [Name, Args] = Suite(OursTest, Agent);
      const Out = await Call(Run, Name, Args, Agent);
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "test-suggester",
        form: "notice",
        summary: "Suite 0.65"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[test-suggester] intent=Suite confidence=0.65\ntargets (4):\n- Source/Test/<Suite>/Test.ts - the assertion body - the suite that proves it\n- Source/Test/<Suite>/README.md - the expected count and the coverage notes\n- Maintain/Run-Smokes.mjs - the aggregate runner - how the suites are invoked\n- README.md - the badge count, which must match the suite\nnote: one suite per folder: Test.ts asserts, README.md carries the count; Target/ is never edited."
      );
      assert.equal(Text.includes("Source/Test/<Suite>"), true);
    });
    await CheckAsync(Count, "G3: the suggest line counts the existing companions and the placeholders", async () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest Suite 0.65 4 candidates call read"
      ]);
      assert.equal(LedgerWith("suggest Suite 0.65 4 candidates call read").length, 1);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: an emptied intent abstains no-companions with the intent and kappa", async () => {
      const Decision = { kind: "allow" };
      const [Name, Args] = Counts(Agent);
      const Out = await Call(Run, Name, Args, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-companions Counts 0.55"));
      assert.equal(LedgerWith("abstained no-companions Counts 0.55").length, 1);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      const [ForeignName, ForeignArgs] = Suite(ForeignTest, Agent);
      await Call(Run, ForeignName, ForeignArgs, Agent);
      Run.Context.workingDirectory = Service(Ours);
      const [Name, Args] = Suite(OursTest, Agent);
      const Out = await Call(Run, Name, Args, Agent);
      assert.equal(Out.additionalContexts[0].source.summary, "Suite 0.65");
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
