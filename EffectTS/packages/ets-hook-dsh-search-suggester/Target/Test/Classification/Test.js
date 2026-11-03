import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  AgentOf,
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Post,
  rm,
  SeedHistory,
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
      - path: package.json
        kind: manifest
        prior: 1.0
        reason: the temp manifest
  "search/Doc":
    id: Doc
    priority: 8
    threshold: 0.5
    signals:
      - rule: R7 heading
        pattern: 'README'
        weight: 2.0
      - rule: R7 heading
        pattern: '##'
        weight: 2.0
      - rule: R7 frontmatter
        pattern: 'title'
        weight: 2.0
    targets:
      - path: README.md
        kind: doc
        prior: 1.0
        reason: the temp readme
  "search/Usage":
    id: Usage
    priority: 9
    threshold: 0.5
    signals:
      - rule: R9 caller
        pattern: 'hook-dsh-'
        weight: 2.0
    targets:
      - path: Source/Library.ts
        kind: symbol
        prior: 1.0
        reason: the temp entry
`;
const Packed = Tree("search-suggester-classification-");
Put(Packed, "package.json", "{}");
Put(Packed, ".dsh/pack.yml", Pack);
const PackedRead = Put(Packed, "README.md");
Put(Packed, "Source/Library.ts");
const Bare = Tree("search-suggester-classification-bare-");
Put(Bare, "package.json", "{}");
const BareRead = Put(Bare, "README.md");
const Grep = (Run, Id, Pattern, Path_) => Post(Run, { name: "grep", arguments: { pattern: Pattern, path: Path_ }, agent: AgentOf(Id) });
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  const Run = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
  await CheckAsync(Count, "C: the Version family wins its own literal", async () => {
    await Grep(Run, "c1", "version", PackedRead);
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.87")
    );
  });
  await CheckAsync(Count, "C: the Doc family wins its own literal", async () => {
    await Grep(Run, "c2", "README", PackedRead);
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.80")
    );
  });
  await CheckAsync(Count, "C: the Usage family wins its own literal", async () => {
    await Grep(Run, "c3", "hook-dsh-caller", PackedRead);
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Usage 0.80")
    );
  });
  await CheckAsync(Count, "C: equal evidence is broken by the pack priority", async () => {
    const Before = Run.Lines.filter((Line) => Line.includes("Usage")).length;
    await Grep(Run, "c4", "README hook-dsh-", PackedRead);
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.80")
    );
    assert.equal(Run.Lines.filter((Line) => Line.includes("Usage")).length, Before);
  });
  await CheckAsync(Count, "C: the higher evidence total beats the priority", async () => {
    await Grep(Run, "c5", "version README ## title", PackedRead);
    assert.ok(
      Run.Lines.includes("hook-dsh-search-suggester: suggest Doc 1.00 1 candidates")
    );
  });
  await CheckAsync(Count, "C: the same call classifies identically twice", async () => {
    const Before = Run.Lines.filter(
      (Line) => Line.includes("low-confidence Version 0.87")
    ).length;
    await Grep(Run, "c6", "version", PackedRead);
    await Grep(Run, "c7", "version", PackedRead);
    const After = Run.Lines.filter(
      (Line) => Line.includes("low-confidence Version 0.87")
    ).length;
    assert.equal(After - Before, 2);
  });
  await CheckAsync(Count, "C: a call the pack does not match abstains no-signal", async () => {
    await Grep(Run, "c8", "unrelated query", PackedRead);
    assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"));
  });
  await CheckAsync(Count, "C: a workspace with no pack and no history abstains no-history", async () => {
    await Grep(Run, "c9", "version", BareRead);
    assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
  });
  {
    const Fresh = Setup();
    SeedHistory(Fresh, "c10", PackedRead, ["README.md"]);
    await CheckAsync(Count, "C: the History family outranks the explicit pack", async () => {
      const Out = await Grep(Fresh, "c10", "version", PackedRead);
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
      assert.ok(
        Fresh.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates")
      );
    });
  }
  return Finish(Count, "Classification");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Classification`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
