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
  Ledger,
  Make,
  MakeCounter,
  Post,
  rm,
  Setup,
  Validate
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Service = (Cwd) => ({ get: () => Cwd });
const Parent = Tree("search-suggester-abstention-");
const Branch = (Name) => {
  const Full = Path.join(Parent, Name);
  FileSystem.mkdirSync(Full, { recursive: true });
  return Full;
};
const Pack = `families:
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
const Packed = Branch("packed");
Put(Packed, "package.json", "{}");
Put(Packed, ".dsh/pack.yml", Pack);
const PackedRead = Put(Packed, "README.md");
Put(Packed, "VERSIONS.md");
const Empty = Branch("empty");
Put(Empty, "package.json", "{}");
Put(Empty, ".dsh/pack.yml", Pack);
const EmptyRead = Put(Empty, "README.md");
const Bare = Branch("bare");
Put(Bare, "package.json", "{}");
const BareRead = Put(Bare, "README.md");
const Foreign = Branch("foreign");
const ForeignRead = Put(Foreign, "README.md");
const Grep = (Pattern, Path_, Id) => ({
  name: "grep",
  arguments: { pattern: Pattern, path: Path_ },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "A1: an unrelated call abstains no-signal", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("unrelated query", PackedRead, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"));
      assert.match(
        DurableLine("abstained no-signal"),
        Durable("abstained no-signal  0.00")
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "A2: a weak match abstains low-confidence", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("version", PackedRead, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.87"));
      assert.match(
        DurableLine("abstained low-confidence"),
        Durable("abstained low-confidence Version 0.87")
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Empty);
    await CheckAsync(Count, "A3: an emptied family abstains no-companions", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("version", EmptyRead, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-companions Version 0.87"));
      assert.match(
        DurableLine("abstained no-companions"),
        Durable("abstained no-companions Version 0.87")
      );
    });
  }
  {
    rm();
    const Run = Make(
      Validate({ logFile: Ledger, enabled: true, exclude: ["VERSIONS.md"] })
    );
    Run.Context.workingDirectory = Service(Packed);
    await CheckAsync(Count, "A4: an excluded candidate set abstains ambiguous-target", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("version", PackedRead, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(
        Run.Lines.includes("hook-dsh-search-suggester: abstained ambiguous-target Version 0.87")
      );
      assert.match(
        DurableLine("abstained ambiguous-target"),
        Durable("abstained ambiguous-target Version 0.87")
      );
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "A5: a foreign workspace abstains foreign-workspace", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, Grep("version", ForeignRead, "a"), Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Out.additionalContexts, [{ id: "downstream" }]);
      assert.ok(
        Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00")
      );
      assert.match(
        DurableLine("abstained foreign-workspace"),
        Durable("abstained foreign-workspace  0.00")
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Bare);
    await CheckAsync(Count, "A6: a rooted workspace with no history abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Grep("version", BareRead, "a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
      assert.match(
        DurableLine("abstained no-history"),
        Durable("abstained no-history  0.00")
      );
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "A7: the abstention scenarios never emit a note", async () => {
      await Post(Run, Grep("unrelated query", ForeignRead, "a"));
      await Post(Run, Grep("version", BareRead, "b"));
      assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
      assert.equal(Run.Warns.length, 0);
    });
  }
  return Finish(Count, "Abstention");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Abstention`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
