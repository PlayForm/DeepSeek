import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  Call,
  CheckAsync,
  Finish,
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
const Pack = `signature:
  - docs/STYLE.md
families:
  "test/Suite":
    id: Suite
    priority: 1
    threshold: 0.5
    note: the temp test caveat
    signals:
      - rule: test-shape
        pattern: 'PASS'
        weight: 2.5
    targets:
      - path: SUITE.md
        kind: ''
        prior: 1.0
        reason: the temp suite
`;
const Service = (Cwd) => ({ get: () => Cwd });
const Packed = Tree("test-suggester-packed-");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "SUITE.md");
const Bare = Tree("test-suggester-bare-");
Put(Bare, "SUITE.md");
const Unsigned = Tree("test-suggester-unsigned-");
Put(Unsigned, ".dsh/pack.yml", Pack);
const Probe = { file_path: "Source/Test/Foo/Test.ts", hint: "PASS" };
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Agent = { agent: { id: "pack-a" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "P1: the temp pack's intent drives the note", async () => {
      const Out = await Call(Run, "read", Probe, Agent);
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "test-suggester",
        form: "notice",
        summary: "Suite 0.87"
      });
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text,
        "[test-suggester] intent=Suite confidence=0.87\ntargets (1):\n- SUITE.md - the temp suite\nnote: the temp test caveat"
      );
      assert.equal(Text.includes("the assertion body"), false);
    });
    await CheckAsync(Count, "P1: the ledger counts the pack's one candidate", async () => {
      assert.ok(
        Run.Lines.includes("test-suggester: suggest Suite 0.87 1 candidates call read")
      );
    });
  }
  {
    const Agent = { agent: { id: "pack-b" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P2: the same workspace without the pack stays silent", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", Probe, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
      assert.equal(Run.Lines.filter((Line) => Line.includes("candidates call")).length, 0);
    });
  }
  {
    const Agent = { agent: { id: "pack-c" } };
    const Run = Setup();
    Run.Context.workingDirectory = Service(Unsigned);
    await CheckAsync(Count, "P3: a pack whose signature marker is absent stays silent", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", Probe, Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
    });
  }
  {
    const Agent = { agent: { id: "pack-d" } };
    const Run = Setup();
    await CheckAsync(Count, "P4: the built-in pack still drives the monorepo path", async () => {
      const Out = await Call(Run, "read", {
        file_path: "Source/Test/Foo/Test.ts",
        hint: "Run-Smokes says PASS"
      }, Agent);
      assert.equal(Out.additionalContexts[0].source.summary, "Suite 0.65");
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(
        Text.includes("- Source/Test/<Suite>/Test.ts - the assertion body - the suite that proves it"),
        true
      );
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
