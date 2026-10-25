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
  rmStore,
  Setup,
  WriteStore
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Service = (Cwd) => ({ get: () => Cwd });
const Rec = (Probe, Files, Verify = "pnpm test") => ({
  intent: "Repeat",
  probe: Probe,
  files: Files,
  verify: Verify,
  at: 17e8
});
const Foreign = Tree("replay-suggester-foreign-");
const ForeignFile = Put(Foreign, "src/Core.ts");
const Ours = Tree("replay-suggester-ours-");
Put(Ours, "Documentation/ARCHIVE-STYLE.md");
const OursFile = Put(Ours, "README.md");
const Empty = Tree("replay-suggester-empty-");
Put(Empty, "Documentation/ARCHIVE-STYLE.md");
const EmptyFile = Put(Empty, "README.md");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G1: a foreign workspace produces NO note and the foreign-workspace line", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Call(Run, "read", { file_path: ForeignFile }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(Run.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
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
      const Out = await Call(Throwing, "read", { file_path: ForeignFile }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Throwing.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Throwing.Warns, []);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    const Run = Setup();
    await CheckAsync(Count, "G2: without the service the absolute foreign path still abstains", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", { file_path: ForeignFile }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"));
      assert.deepEqual(Run.Warns, []);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    WriteStore([Rec("README.md", ["README.md"])]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the recalled file that exists", async () => {
      const Out = await Call(Run, "read", { file_path: OursFile }, Agent);
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "replay-suggester",
        form: "notice",
        summary: "Repeat 0.77"
      });
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[replay-suggester] intent=Repeat confidence=0.77\ntargets (1):\n- README.md - touched last time (Repeat)\nnote: last time verified with pnpm test"
      );
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing file", async () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "replay-suggester: suggest Repeat 0.77 1 candidates call read"
      ]);
      assert.equal(LedgerWith("suggest Repeat 0.77 1 candidates call read").length, 1);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    WriteStore([Rec("README.md", ["src/Gone.ts"])]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: a recalled file absent from the workspace is still named (history record)", async () => {
      const Out = await Call(Run, "read", { file_path: EmptyFile }, Agent);
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[replay-suggester] intent=Repeat confidence=0.77\ntargets (1):\n- src/Gone.ts - touched last time (Repeat)\nnote: last time verified with pnpm test"
      );
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "replay-suggester: suggest Repeat 0.77 1 candidates call read"
      ]);
    });
    rmStore();
    WriteStore([Rec("README.md", [])]);
    const Emptied = Setup();
    Emptied.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: a record with an empty file set abstains no-companions", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Emptied, "read", { file_path: EmptyFile }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Emptied.Lines.includes("replay-suggester: abstained no-companions Repeat 0.77"));
      assert.equal(LedgerWith("abstained no-companions Repeat 0.77").length, 1);
      assert.equal(LinesWith(Emptied, "candidates call").length, 0);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    WriteStore([Rec("README.md", ["README.md"])]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Call(Run, "read", { file_path: ForeignFile }, Agent);
      Run.Context.workingDirectory = Service(Ours);
      const Out = await Call(Run, "read", { file_path: OursFile }, Agent);
      assert.equal(Out.additionalContexts[0].source.summary, "Repeat 0.77");
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
