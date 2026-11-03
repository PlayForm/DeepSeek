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
const Service = (Cwd) => ({ get: () => Cwd });
const Repo = Tree("convention-learn-note-repo-");
FileSystem.mkdirSync(Path.join(Repo, ".git"), { recursive: true });
for (const Relative of [
  "Documentation/INDEX.md",
  "package.json",
  "README.md",
  "SCHEME.md",
  "Source/Library.ts",
  "Source/Function/Apply.ts"
]) {
  Put(Repo, Relative);
}
const Call = (Id) => ({
  name: "write",
  arguments: { file_path: Path.join(Repo, "Source/Function/Apply.ts") },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
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
      `convention-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.75)`
    ]);
  });
  await CheckAsync(Count, "N2: the first judged call abstains no-history and writes no proposal", async () => {
    const Decision = { kind: "allow", additionalContexts: [] };
    const Out = await Post(Run, Call("a"), Decision);
    assert.equal(Out, Decision);
    assert.deepEqual(Out.additionalContexts, []);
    assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
    assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
    assert.match(
      DurableLine("abstained no-history"),
      Durable("abstained no-history  0.00")
    );
    assert.equal(Run.Lines.filter((Line) => Line.includes("learned proposal")).length, 0);
  });
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
