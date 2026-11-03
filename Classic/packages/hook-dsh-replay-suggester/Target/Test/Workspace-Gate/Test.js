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
const Manifest = (Root) => {
  FileSystem.writeFileSync(Path.join(Root, "package.json"), "{}", "utf8");
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
Manifest(Ours);
const OursFile = Put(Ours, "README.md");
Put(Ours, "src/Core.ts");
const Empty = Tree("replay-suggester-empty-");
Manifest(Empty);
const EmptyFile = Put(Empty, "README.md");
Put(Empty, "src/Core.ts");
Put(Empty, "src/Nested/File.ts");
const Release = Tree("replay-suggester-release-");
Manifest(Release);
const Peer = Put(Release, "Classic/src/Peer.ts");
const Other = Put(Release, "EffectTS/src/Other.ts");
const Anchor = Path.join(Release, "Classic/src/Anchor.ts");
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
    WriteStore([Rec("README.md", ["src/Core.ts"])]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Ours);
    await CheckAsync(Count, "G3: the note names only the recalled file that exists", async () => {
      const Out = await Call(Run, "read", { file_path: OursFile }, Agent);
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "replay-suggester",
        form: "notice",
        summary: "Repeat 0.87"
      });
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- src/Core.ts - touched last time (Repeat)\nnote: last time verified with pnpm test"
      );
    });
    await CheckAsync(Count, "G3: the suggest line counts only the existing file", async () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "replay-suggester: suggest Repeat 0.87 1 candidates call read"
      ]);
      assert.equal(LedgerWith("suggest Repeat 0.87 1 candidates call read").length, 1);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    WriteStore([Rec("README.md", ["src/Gone.ts", "src/Core.ts"])]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: a recalled path the tree no longer has is dropped", async () => {
      const Out = await Call(Run, "read", { file_path: EmptyFile }, Agent);
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- src/Core.ts - touched last time (Repeat)\nnote: last time verified with pnpm test"
      );
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "replay-suggester: suggest Repeat 0.87 1 candidates call read"
      ]);
    });
    rmStore();
    WriteStore([Rec("README.md", ["src/Nested", "src/Core.ts"])]);
    const Directory = Setup();
    Directory.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: a recalled directory is dropped", async () => {
      const Out = await Call(Directory, "read", { file_path: EmptyFile }, Agent);
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- src/Core.ts - touched last time (Repeat)\nnote: last time verified with pnpm test"
      );
      assert.equal(Out.additionalContexts[0].content[0].text.includes("src/Nested"), false);
    });
    rmStore();
    WriteStore([Rec("README.md", ["src/Gone.ts", "src/AlsoGone.ts"])]);
    const Vanished = Setup();
    Vanished.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: a record whose files all vanish abstains no-companions", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Vanished, "read", { file_path: EmptyFile }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Vanished.Lines.includes("replay-suggester: abstained no-companions Repeat 0.87"));
      assert.equal(LedgerWith("abstained no-companions Repeat 0.87").length, 1);
      assert.equal(LinesWith(Vanished, "candidates call").length, 0);
    });
    rmStore();
    WriteStore([Rec("README.md", [])]);
    const Emptied = Setup();
    Emptied.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "G4: a record with an empty file set abstains no-companions", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Emptied, "read", { file_path: EmptyFile }, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Emptied.Lines.includes("replay-suggester: abstained no-companions Repeat 0.87"));
      assert.equal(LedgerWith("abstained no-companions Repeat 0.87").length, 1);
      assert.equal(LinesWith(Emptied, "candidates call").length, 0);
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    WriteStore([Rec("README.md", ["src/Core.ts"])]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Foreign);
    await CheckAsync(Count, "G5: a foreign call never poisons the next in-workspace call", async () => {
      await Call(Run, "read", { file_path: ForeignFile }, Agent);
      Run.Context.workingDirectory = Service(Ours);
      const Out = await Call(Run, "read", { file_path: OursFile }, Agent);
      assert.equal(Out.additionalContexts[0].source.summary, "Repeat 0.87");
    });
  }
  {
    const Agent = { agent: { id: "agent-a" } };
    rmStore();
    WriteStore([Rec("Anchor.ts", [Other, Peer])]);
    const Run = Setup();
    await CheckAsync(Count, "G6: a same-tree recalled path ranks ahead of the other tree's", async () => {
      const Out = await Call(Run, "read", { file_path: Anchor }, Agent);
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        `[replay-suggester] intent=Repeat confidence=0.87
targets (2):
- ${Peer} - touched last time (Repeat)
- ${Other} - touched last time (Repeat)
note: last time verified with pnpm test`
      );
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "replay-suggester: suggest Repeat 0.87 2 candidates call read"
      ]);
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
