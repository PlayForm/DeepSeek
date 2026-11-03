import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  AgentOf,
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
const Manifest = (Root) => {
  FileSystem.writeFileSync(Path.join(Root, "package.json"), "{}", "utf8");
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
const Probe = (Root) => ({
  file_path: Path.join(Root, "Source/Test/Foo/Test.ts"),
  hint: "PASS"
});
const Packed = Tree("test-suggester-packed-");
Manifest(Packed);
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "SUITE.md");
const Bare = Tree("test-suggester-bare-");
Manifest(Bare);
Put(Bare, "SUITE.md");
const Unsigned = Tree("test-suggester-unsigned-");
Manifest(Unsigned);
Put(Unsigned, ".dsh/pack.yml", Pack);
const Monorepo = Tree("test-suggester-monorepo-");
Manifest(Monorepo);
Put(Monorepo, "Documentation/Plans/POC-LEDGER.md");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Agent = AgentOf("pack-a");
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "P1: the temp pack's family drives the note", async () => {
      const Out = await Call(Run, "read", Probe(Packed), Agent);
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
    const Agent = AgentOf("pack-b");
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P2: the same workspace without the pack abstains no-history", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", Probe(Bare), Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
      assert.equal(Run.Lines.filter((Line) => Line.includes("candidates call")).length, 0);
    });
  }
  {
    const Agent = AgentOf("pack-c");
    const Run = Setup();
    Run.Context.workingDirectory = Service(Unsigned);
    await CheckAsync(Count, "P3: a pack with an absent signature marker still governs the tree", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(Run, "read", Probe(Unsigned), Agent, Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-companions Suite 0.87"));
      assert.equal(Run.Lines.filter((Line) => Line.includes("candidates call")).length, 0);
    });
  }
  {
    const Agent = AgentOf("pack-d");
    const Run = Setup();
    Run.Context.workingDirectory = Service(Monorepo);
    await CheckAsync(Count, "P4: a monorepo test read with no history abstains no-history", async () => {
      const Decision = { kind: "allow" };
      const Out = await Call(
        Run,
        "read",
        { file_path: "Documentation/Plans/POC-LEDGER.md", hint: "Run-Smokes says PASS" },
        Agent,
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
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
