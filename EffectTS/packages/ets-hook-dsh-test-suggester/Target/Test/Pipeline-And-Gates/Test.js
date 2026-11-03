import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  Call,
  Check,
  CheckAsync,
  Finish,
  LedgerWith,
  LinesWith,
  MakeCounter,
  PreStep,
  Flip,
  Setup,
  Volatile
} from "../Harness.js";
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Counted = (Count) => `# Suite

## Expected count

${Count} PASS.
`;
const Rooted = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-pipeline-"));
Put(Rooted, "package.json", "{}");
const Anchor = Put(Rooted, "Source/Test/Foo/Test.ts");
Put(Rooted, "Source/Test/Foo/README.md", Counted(4));
Put(Rooted, "Target/Test/Foo/Test.js");
Put(Rooted, "README.md");
Put(Rooted, "SCHEME.md");
const Bare = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-no-history-"));
Put(Bare, "package.json", "{}");
const BareAnchor = Put(Bare, "Notes.md");
const Service = (Cwd) => ({ get: () => Cwd });
const Read = (Path_, Agent) => ({
  name: "read",
  arguments: { file_path: Path_ },
  agent: Agent
});
const Seed = (Run, Agent) => {
  Run.State.History.set(Agent, {
    Seq: 3,
    Touches: [Anchor, "README.md", "SCHEME.md"].map((Path_, Seq) => ({
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
    const Agent = { agent: { id: "pipeline-a" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    const Result = await Call(Run, "read", { file_path: Anchor }, Agent);
    Check(Count, "P1: the suggest line is byte-exact (logger and durable ledger)", () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest History 0.87 2 candidates call read"
      ]);
      assert.equal(LedgerWith("suggest History 0.87 2 candidates call read").length, 1);
    });
    await CheckAsync(Count, "P1: the note is one labeled frozen notice naming the history companions", async () => {
      const Note = Result.additionalContexts[0];
      assert.deepEqual(Note.source, {
        kind: "test-suggester",
        form: "notice",
        summary: "History 0.87"
      });
      assert.equal(Note.role, "user");
      assert.equal(typeof Note.id, "string");
      assert.equal(Note.content[0].text, HistoryText);
      assert.equal(Object.isFrozen(Note), true);
    });
    Check(Count, "P1: the consistent smoke tree logs its clear line once and never preempts the note", () => {
      assert.deepEqual(LinesWith(Run, "reconciliation"), [
        `test-suggester: reconciliation clear ${Path.basename(Rooted)} (4 expected, 4 actual)`
      ]);
    });
  }
  {
    const Agent = { agent: { id: "pipeline-b" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P2: a rooted tree with no history and no pack abstains no-history", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", { file_path: BareAnchor }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
      assert.equal(LedgerWith("abstained no-history  0.00").length, 1);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
    });
  }
  {
    const Agent = { agent: { id: "pipeline-c" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    await Call(Run, "read", { file_path: Anchor }, Agent);
    await Call(Run, "read", { file_path: Anchor }, Agent);
    Check(Count, "P3: a repeat within the cooldown is suppressed with the byte-exact line", () => {
      assert.deepEqual(LinesWith(Run, "suppressed"), [
        "test-suggester: suppressed cooldown History"
      ]);
      assert.equal(LinesWith(Run, "candidates call").length, 1);
    });
    const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 });
    Capped.Context.workingDirectory = Service(Rooted);
    Seed(Capped, Agent);
    await Call(Capped, "read", { file_path: Anchor }, Agent);
    await Call(Capped, "read", { file_path: Anchor }, Agent);
    Check(Count, "P3: a note beyond the per-turn cap is suppressed", () => {
      assert.deepEqual(LinesWith(Capped, "suppressed"), [
        "test-suggester: suppressed cap History"
      ]);
    });
    await PreStep(Capped, Agent);
    await Call(Capped, "read", { file_path: Anchor }, Agent);
    Check(Count, "P3: a user turn resets the per-turn counter and the note emits again", () => {
      assert.equal(LinesWith(Capped, "candidates call").length, 2);
    });
  }
  {
    const Agent = { agent: { id: "pipeline-d" } };
    const Run = Setup({ exclude: ["README.md"] });
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    await Call(Run, "read", { file_path: Anchor }, Agent);
    Check(Count, "P4: an excluded companion is filtered, the rest suggest", () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "test-suggester: suggest History 0.87 1 candidates call read"
      ]);
    });
    const All = Setup({ exclude: ["README.md", "SCHEME.md"] });
    All.Context.workingDirectory = Service(Rooted);
    Seed(All, Agent);
    await Call(All, "read", { file_path: Anchor }, Agent);
    Check(Count, "P4: a fully excluded candidate set abstains as ambiguous", () => {
      assert.deepEqual(LinesWith(All, "abstained"), [
        "test-suggester: abstained ambiguous History 0.87"
      ]);
    });
  }
  {
    const Agent = { agent: { id: "pipeline-e" } };
    const Run = Setup({ maxNoteChars: 60 });
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    const Result = await Call(Run, "read", { file_path: Anchor }, Agent);
    Check(Count, "P5: a note longer than maxNoteChars is truncated with an ellipsis", () => {
      const Text = Result.additionalContexts[0].content[0].text;
      assert.equal(Text.endsWith("..."), true);
      assert.equal(Text.length, 62);
    });
  }
  {
    const Agent = { agent: { id: "pipeline-f" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    const Downstream = { kind: "block", feedback: "no", additionalContexts: [{ marker: "x" }] };
    const Result = await Call(Run, "read", { file_path: Anchor }, Agent, Downstream);
    Check(Count, "P6: a block decision keeps its feedback and prepends the note", () => {
      assert.equal(Result.kind, "block");
      assert.equal(Result.feedback, "no");
      assert.equal(Result.additionalContexts.length, 2);
      assert.equal(Result.additionalContexts[0].source.kind, "test-suggester");
      assert.equal(Result.additionalContexts[1], Downstream.additionalContexts[0]);
    });
  }
  {
    const Agent = { agent: { id: "pipeline-g" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    Flip(Volatile(Run, "enabled"), false);
    Run.CtxListeners["loader/volatile-update"]([["enabled"]]);
    const Result = await Call(Run, "read", { file_path: Anchor }, Agent);
    Check(Count, "P7: after the flip every call passes through unchanged", () => {
      assert.equal(Run.State.On, false);
      assert.equal(LinesWith(Run, "candidates call").length, 0);
      assert.equal(Result.kind, "allow");
    });
  }
  {
    const Agent = { agent: { id: "pipeline-h" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Rooted);
    Seed(Run, Agent);
    await Call(Run, "read", { file_path: Anchor }, Agent);
    await Call(Run, "grep", { pattern: "expected count", query: "badge" }, Agent);
    Check(Count, "P8: the full scenario performs ZERO fs operations", () => {
      assert.equal(Run.Fs.reads.length, 0);
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.resolved.length, 0);
      assert.equal(Run.Fs.stats.length, 0);
    });
  }
  return Finish(Count, "Pipeline-And-Gates");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Pipeline-And-Gates`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
