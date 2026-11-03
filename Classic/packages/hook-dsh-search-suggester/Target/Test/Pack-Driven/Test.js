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
  SeedHistory,
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
  "search/Version":
    id: Version
    priority: 1
    threshold: 0.5
    signals:
      - rule: R1 literal-shape
        pattern: '\\bversion\\b'
        weight: 2.5
    targets:
      - path: VERSIONS.md
        kind: doc
        prior: 1.0
        reason: the temp versions
`;
const Service = (Cwd) => ({ get: () => Cwd });
const Packed = Tree("search-suggester-packed-");
Put(Packed, "package.json", "{}");
Put(Packed, ".dsh/pack.yml", Pack);
Put(Packed, "docs/STYLE.md");
Put(Packed, "VERSIONS.md");
const PackedManifest = Path.join(Packed, "package.json");
const Bare = Tree("search-suggester-bare-");
Put(Bare, "package.json", "{}");
Put(Bare, "VERSIONS.md");
const Unsigned = Tree("search-suggester-unsigned-");
Put(Unsigned, "package.json", "{}");
Put(Unsigned, ".dsh/pack.yml", Pack);
const Grep = (Id, Pattern = "version") => ({
  name: "grep",
  arguments: { pattern: Pattern },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "P1: the temp pack's family drives the note", async () => {
      const Out = await Post(Run, Grep("pack-a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "search-suggester",
        form: "notice",
        summary: "Version 0.87"
      });
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[search-suggester] intent=Version confidence=0.87\ntargets (1):\n- VERSIONS.md - the temp versions\nnote: open these before more searches; Target/ is generated, never edit it."
      );
    });
    await CheckAsync(Count, "P1: the ledger counts the pack's one candidate", async () => {
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.87 1 candidates"));
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "P2: the same workspace without the pack abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("pack-b"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Unsigned);
    await CheckAsync(Count, "P3: a pack with an absent companion abstains no-companions", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("pack-c"), Decision);
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Version 0.87")
      );
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "P4: a monorepo read with no history abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: "package.json" }, agent: AgentOf("pack-d") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    SeedHistory(Run, "pack-e", PackedManifest, ["VERSIONS.md"]);
    await CheckAsync(Count, "P5: the History family outranks the explicit pack's row", async () => {
      const Out = await Post(Run, {
        name: "grep",
        arguments: { pattern: "version", path: PackedManifest },
        agent: AgentOf("pack-e")
      });
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
      assert.ok(
        Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 1 candidates")
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
