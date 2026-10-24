import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  AgentOf,
  CheckAsync,
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
const Pack = `signature:
  - docs/STYLE.md
families:
  "doc/Index":
    id: Index
    priority: 1
    threshold: 0.75
    signals:
      - rule: index
        pattern: '(^|/)Documentation/INDEX\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 1.0
        reason: the temp style
`;
const Service = (Cwd) => ({ get: () => Cwd });
const Packed = Tree("doc-suggester-packed-");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
const PackedIndex = Put(Packed, "Documentation/INDEX.md");
const Bare = Tree("doc-suggester-bare-");
const BareIndex = Put(Bare, "Documentation/INDEX.md");
const Unsigned = Tree("doc-suggester-unsigned-");
Put(Unsigned, ".dsh/pack.yml", Pack);
const UnsignedIndex = Put(Unsigned, "Documentation/INDEX.md");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "P1: the temp pack's family drives the note", async () => {
      const Out = await Post(Run, {
        name: "read",
        arguments: { file_path: PackedIndex },
        agent: AgentOf("pack-a")
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
        "[doc-suggester] family=Index confidence=0.87\ncompanions (1):\n- docs/STYLE.md - the temp style\nnote: a documentation task rarely touches one file; keep the doc graph coherent."
      );
      assert.equal(Text.includes("Documentation/ARCHIVE-STYLE.md"), false);
    });
    await CheckAsync(Count, "P1: the ledger counts the pack's one companion", async () => {
      assert.ok(
        Run.Lines.includes(
          `hook-dsh-doc-suggester: suggest Index 0.87 1 companions ${PackedIndex}`
        )
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P2: the same workspace without the pack stays silent", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: BareIndex }, agent: AgentOf("pack-b") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Unsigned);
    await CheckAsync(Count, "P3: a pack whose signature marker is absent stays silent", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: UnsignedIndex }, agent: AgentOf("pack-c") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-doc-suggester: abstained foreign-workspace  0.00")
      );
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "P4: the built-in pack still drives the monorepo path", async () => {
      const Out = await Post(Run, {
        name: "read",
        arguments: { file_path: "Documentation/Plans/POC-LEDGER.md" },
        agent: AgentOf("pack-d")
      });
      assert.equal(Out.additionalContexts[0].source.summary, "Plan 0.87");
      const Text = Out.additionalContexts[0].content[0].text;
      assert.equal(Text.includes("- Documentation/INDEX.md - the index row"), true);
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
