import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  Call,
  CheckAsync,
  Finish,
  MakeCounter,
  Setup,
  WriteStore,
  rmStore
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
const Pack = `signature:
  - docs/STYLE.md
families:
  "replay/Rerun":
    id: Rerun
    priority: 1
    threshold: 0.75
    note: the temp recall is the answer
    signals:
      - rule: temp-shape
        pattern: 'grep'
        weight: 3.0
    targets: []
`;
const Record = {
  intent: "Repeat",
  probe: 'grep {"pattern":"version"}',
  files: ["Source/Version.ts"],
  verify: ""
};
const Service = (Cwd) => ({ get: () => Cwd });
const Packed = Tree("replay-suggester-packed-");
Manifest(Packed);
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "Source/Version.ts");
const Bare = Tree("replay-suggester-bare-");
Manifest(Bare);
const runTest = async () => {
  const Count = MakeCounter();
  {
    WriteStore([Record]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "P1: the temp pack's intent and caveat drive the note", async () => {
      const Out = await Call(Run, "grep", { pattern: "version" });
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "replay-suggester",
        form: "notice",
        summary: "Rerun 0.92"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[replay-suggester] intent=Rerun confidence=0.92\ntargets (1):\n- Source/Version.ts - touched last time (Repeat)\nnote: the temp recall is the answer"
      );
      assert.equal(Text.includes("docs/STYLE.md"), false);
    });
    await CheckAsync(Count, "P1: the ledger counts the recalled companion", async () => {
      assert.ok(
        Run.Lines.includes("replay-suggester: suggest Rerun 0.92 1 candidates call grep")
      );
    });
  }
  {
    WriteStore([Record]);
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P2: without a pack the recall still produces the note", async () => {
      const Out = await Call(Run, "grep", { pattern: "version" });
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "replay-suggester",
        form: "notice",
        summary: "Repeat 0.87"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[replay-suggester] intent=Repeat confidence=0.87\ntargets (1):\n- Source/Version.ts - touched last time (Repeat)\nnote: the last time this call was made, these files were touched"
      );
      assert.ok(
        Run.Lines.includes("replay-suggester: suggest Repeat 0.87 1 candidates call grep")
      );
    });
  }
  {
    rmStore();
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "P3: a pack family with no record abstains no-memory", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "grep", { pattern: "version" }, void 0, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("replay-suggester: abstained no-memory Rerun 0.92"));
      assert.equal(Run.Lines.filter((Line) => Line.includes("candidates call")).length, 0);
    });
  }
  {
    rmStore();
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P4: a workspace with no pack and no record abstains no-history", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "grep", { pattern: "version" }, void 0, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("replay-suggester: abstained no-history  0.00"));
      assert.equal(Run.Lines.filter((Line) => Line.includes("candidates call")).length, 0);
    });
  }
  return Finish(Count, "Pack-Driven");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Pack-Driven`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
