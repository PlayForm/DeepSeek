import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Normalize, Parse } from "../../../../ets-lib-dsh-pack/Target/Library.js";
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
  Validate
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Home = Tree("convention-learn-home-");
process.env["HOME"] = Home;
const Proposal = (Root) => Path.join(
  Home,
  ".dsh/playform/proposals",
  `${Path.basename(Root).toLowerCase()}.yml`
);
const Live = (Root) => Path.join(
  Home,
  ".dsh/playform/workspaces",
  `${Path.basename(Root).toLowerCase()}.yml`
);
const NoteText = (Root, Families) => {
  const Slug = Path.basename(Root).toLowerCase();
  return [
    `[convention-suggester] learned pack proposal for ${Slug}`,
    `proposal: ${Proposal(Root)}`,
    `families: ${Families}`,
    `install: copy the proposal to ~/.dsh/playform/workspaces/${Slug}.yml`
  ].join("\n");
};
const Service = (Cwd) => ({ get: () => Cwd });
const Write = (Path_, Id) => ({
  name: "write",
  arguments: { file_path: Path_ },
  agent: AgentOf(Id)
});
const Repo = Tree("convention-learn-repo-");
for (const Relative of [
  "Documentation/INDEX.md",
  "Documentation/ARCHIVE-STYLE.md",
  "Documentation/Plans/plan.md",
  "Documentation/Guides/guide.md",
  "Documentation/Skill/skill.md",
  "Documentation/Handoff/handoff.md",
  "Site/Source/Content/content.md",
  "Site/Source/pages/index.astro",
  "Site/Source/Component/Card.astro",
  "Site/Source/Library/Content.ts",
  "package.json",
  "README.md",
  "SCHEME.md",
  "cordis.patch.yml",
  "Source/Library.ts",
  "Source/Function/Apply.ts",
  "Source/Variable/Config.ts",
  "Source/Interface/Config.ts",
  "Source/Test/Suite/Test.ts"
]) {
  Put(Repo, Relative);
}
const Indexed = Tree("convention-learn-index-");
Put(Indexed, "Documentation/INDEX.md");
Put(Indexed, "package.json");
const Packaged = Tree("convention-learn-package-");
Put(Packaged, "package.json");
const Silent = Tree("convention-learn-silent-");
Put(Silent, "Documentation/INDEX.md");
Put(Silent, "package.json");
const Installed = Tree("convention-learn-installed-");
Put(
  Installed,
  ".dsh/pack.yml",
  `signature:
    - docs/STYLE.md
families:
    "convention/Layout":
        id: Layout
        priority: 1
        threshold: 0.75
        note: ""
        signals:
            - rule: never
              pattern: "NEVER/.*"
              weight: 2.5
        targets:
            - path: docs/STYLE.md
              kind: ""
              prior: 1
              reason: the temp style
`
);
Put(Installed, "docs/STYLE.md");
Put(Installed, "Documentation/INDEX.md");
Put(Installed, "Source/Function/Apply.ts");
const Opted = Tree("convention-learn-opted-");
Put(Opted, ".dsh/pack.yml", "learning:\n    propose: true\n");
Put(Opted, "Documentation/INDEX.md");
Put(Opted, "package.json");
const Declined = Tree("convention-learn-declined-");
Put(Declined, ".dsh/pack.yml", "learning:\n    propose: false\n");
Put(Declined, "Documentation/INDEX.md");
Put(Declined, "package.json");
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Repo);
    await CheckAsync(Count, "L1: the learning note is prepended with the path and the count", async () => {
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "convention-suggester",
        form: "notice",
        summary: "learned pack 9 families"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Repo, 9));
    });
    await CheckAsync(Count, "L1: the learning ledger line is byte-exact in both forms", async () => {
      const Line = `learned proposal ${Path.basename(Repo).toLowerCase()} 9 families ${Proposal(Repo)}`;
      assert.ok(Run.Lines.includes(`convention-suggester: ${Line}`));
      assert.match(DurableLine("learned proposal"), Durable(Line));
    });
    await CheckAsync(Count, "L1: the proposal exists and the live pack does not", async () => {
      assert.equal(FileSystem.existsSync(Proposal(Repo)), true);
      assert.equal(FileSystem.existsSync(Live(Repo)), false);
      assert.equal(FileSystem.existsSync(Path.join(Repo, ".dsh/pack.yml")), false);
    });
    await CheckAsync(Count, "L1: the proposal parses back through the library", async () => {
      const Text = FileSystem.readFileSync(Proposal(Repo), "utf8");
      const Parsed = Normalize(Parse(Text));
      assert.equal(Parsed.slug, Path.basename(Repo).toLowerCase());
      assert.deepEqual(Parsed.signature, ["Documentation/ARCHIVE-STYLE.md"]);
      assert.deepEqual(Object.keys(Parsed.families ?? {}), [
        "doc/Plan",
        "doc/Guide",
        "doc/Skill",
        "doc/Index",
        "doc/Site",
        "doc/PackageProse",
        "convention/Layout",
        "convention/Naming",
        "convention/Docs"
      ]);
      assert.equal(Object.keys(Parsed.families ?? {}).length, 9);
    });
    await CheckAsync(Count, "L1: every proposed companion exists under the repo root", async () => {
      const Text = FileSystem.readFileSync(Proposal(Repo), "utf8");
      const Parsed = Normalize(Parse(Text));
      for (const Family of Object.values(Parsed.families ?? {})) {
        for (const Target of Family.targets) {
          assert.equal(
            FileSystem.existsSync(Path.join(Repo, Target.path)),
            true,
            `absent companion: ${Target.path}`
          );
          assert.equal(Target.path.includes("*"), false);
          assert.equal(Target.path.includes("<"), false);
        }
      }
    });
  }
  {
    rm();
    const IndexRun = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    IndexRun.Context.workingDirectory = Service(Indexed);
    await CheckAsync(Count, "L2: without a style guide the signature falls back to INDEX.md", async () => {
      await Post(IndexRun, Write("Source/Function/Apply.ts", "a"));
      const Parsed = Normalize(
        Parse(FileSystem.readFileSync(Proposal(Indexed), "utf8"))
      );
      assert.deepEqual(Parsed.signature, ["Documentation/INDEX.md"]);
    });
    const PackageRun = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    PackageRun.Context.workingDirectory = Service(Packaged);
    await CheckAsync(Count, "L2: without a doc graph the signature falls back to package.json", async () => {
      await Post(PackageRun, Write("Source/Function/Apply.ts", "b"));
      const Parsed = Normalize(
        Parse(FileSystem.readFileSync(Proposal(Packaged), "utf8"))
      );
      assert.deepEqual(Parsed.signature, ["package.json"]);
      assert.deepEqual(Object.keys(Parsed.families ?? {}), ["convention/Docs"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Run.Context.workingDirectory = Service(Silent);
    await CheckAsync(Count, "L3: learning off writes no proposal and emits no note", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"), Decision);
      assert.equal(Out, Decision);
      assert.equal(FileSystem.existsSync(Proposal(Silent)), false);
      assert.ok(
        Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00")
      );
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("learned proposal")).length,
        0
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Installed);
    await CheckAsync(Count, "L4: an installed pack (families) produces no proposal and no note", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write("Documentation/INDEX.md", "a"), Decision);
      assert.equal(Out, Decision);
      assert.equal(FileSystem.existsSync(Proposal(Installed)), false);
      assert.deepEqual(Run.Lines, [
        "convention-suggester: activated (bundle 0.2.1, intents 4, threshold 0.75)"
      ]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Run.Context.workingDirectory = Service(Opted);
    await CheckAsync(Count, "L5: a learning-only pack opts in with the config off", async () => {
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"));
      assert.equal(
        Out.additionalContexts[0].source.summary,
        "learned pack 1 families"
      );
      assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Opted, 1));
      assert.equal(FileSystem.existsSync(Proposal(Opted)), true);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Declined);
    await CheckAsync(Count, "L6: the config wins over a pack that sets propose false", async () => {
      await Post(Run, Write("Source/Function/Apply.ts", "a"));
      assert.equal(FileSystem.existsSync(Proposal(Declined)), true);
    });
  }
  return Finish(Count, "Learn-Proposal");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Learn-Proposal`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
