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
const Home = Tree("convention-learn-install-home-");
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
const Service = (Cwd) => ({ get: () => Cwd });
const Repo = Tree("convention-learn-install-repo-");
FileSystem.mkdirSync(Path.join(Repo, ".git"), { recursive: true });
for (const Relative of [
  "Documentation/INDEX.md",
  "Documentation/Handoff/handoff.md",
  "Site/Source/Content/content.md",
  "Site/Source/pages/index.astro",
  "Site/Source/Component/Card.astro",
  "Site/Source/Library/Layout.ts",
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
  await CheckAsync(Count, "I1: the retired learner writes no proposal and no live pack", async () => {
    const Decision = { kind: "allow", additionalContexts: [] };
    const Out = await Post(Run, Call("a"), Decision);
    assert.equal(Out, Decision);
    assert.deepEqual(Out.additionalContexts, []);
    assert.equal(FileSystem.existsSync(Proposal(Repo)), false);
    assert.equal(FileSystem.existsSync(Live(Repo)), false);
    assert.equal(FileSystem.existsSync(Path.join(Repo, ".dsh/pack.yml")), false);
  });
  await CheckAsync(Count, "I2: the call abstains no-history instead of noting a learned pack", async () => {
    assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
    assert.match(
      DurableLine("abstained no-history"),
      Durable("abstained no-history  0.00")
    );
    assert.equal(Run.Lines.filter((Line) => Line.includes("learned proposal")).length, 0);
    assert.equal(Run.Lines.filter((Line) => Line.includes(": suggest ")).length, 0);
  });
  return Finish(Count, "Learn-Install");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Learn-Install`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
