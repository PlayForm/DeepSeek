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
  Validate
} from "../Harness.js";
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Home = Tree("convention-learn-note-home-");
process.env["HOME"] = Home;
const Proposal = (Root) => Path.join(
  Home,
  ".dsh/playform/proposals",
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
const MakeRepo = (Prefix) => {
  const Root = Tree(Prefix);
  for (const Relative of [
    "Documentation/INDEX.md",
    "package.json",
    "README.md",
    "SCHEME.md",
    "Source/Library.ts",
    "Source/Function/Apply.ts"
  ]) {
    Put(Root, Relative);
  }
  return Root;
};
const Repo = MakeRepo("convention-learn-note-repo-");
const Other = MakeRepo("convention-learn-note-other-");
const Silent = Tree("convention-learn-note-silent-");
Put(Silent, "Documentation/INDEX.md");
Put(Silent, "package.json");
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Repo);
    await CheckAsync(Count, "N1: a non-judged call writes nothing and notes nothing", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(
        Run,
        { name: "bash", arguments: { command: "ls" }, agent: AgentOf("a") },
        Decision
      );
      assert.equal(Out, Decision);
      assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
      assert.deepEqual(Run.Lines, [
        "convention-suggester: activated (bundle 0.3.0, intents 4, threshold 0.75)"
      ]);
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Repo);
    await CheckAsync(Count, "N2: the first judged call emits the note", async () => {
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "a"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "convention-suggester",
        form: "notice",
        summary: "learned pack 4 families"
      });
      assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Repo, 4));
    });
    await CheckAsync(Count, "N2: the ledger line is byte-exact in both forms", async () => {
      const Line = `learned proposal ${Path.basename(Repo).toLowerCase()} 4 families ${Proposal(Repo)}`;
      assert.ok(Run.Lines.includes(`convention-suggester: ${Line}`));
      assert.match(DurableLine("learned proposal"), Durable(Line));
    });
    await CheckAsync(Count, "N2: the proposal file exists", async () => {
      assert.equal(FileSystem.existsSync(Proposal(Repo)), true);
    });
  }
  {
    FileSystem.rmSync(Proposal(Repo));
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, learning: true }));
    Run.Context.workingDirectory = Service(Repo);
    await CheckAsync(Count, "N3: a second mount of the same root neither notes nor recreates the file", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "b"), Decision);
      assert.equal(Out, Decision);
      assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
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
    Run.Context.workingDirectory = Service(Other);
    await CheckAsync(Count, "N4: a different workspace gets its own proposal and note", async () => {
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "c"));
      assert.equal(Out.additionalContexts[0].source.summary, "learned pack 4 families");
      assert.equal(Out.additionalContexts[0].content[0].text, NoteText(Other, 4));
      assert.equal(FileSystem.existsSync(Proposal(Other)), true);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    Run.Context.workingDirectory = Service(Silent);
    await CheckAsync(Count, "N5: learning off emits no note and writes no file", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Write("Source/Function/Apply.ts", "d"), Decision);
      assert.equal(Out, Decision);
      assert.equal(FileSystem.existsSync(Proposal(Silent)), false);
      assert.ok(
        Run.Lines.includes("convention-suggester: abstained foreign-workspace  0.00")
      );
    });
  }
  return Finish(Count, "Learn-Note");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Learn-Note`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
