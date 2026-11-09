import assert from "node:assert/strict";
import {
  AgentOf,
  CheckAsync,
  Commit,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Post,
  rm,
  SeedHistory,
  Service,
  Setup,
  Validate,
  Workspace
} from "../Harness.js";
const Anchor = "README.md";
const Companions = ["CHANGELOG.md", "SCHEME.md"];
const Space = Workspace([Anchor, ...Companions]);
const Read = (Id) => ({
  name: "read",
  arguments: { file_path: Space.At(Anchor) },
  agent: AgentOf(Id)
});
const Elsewhere = (Id, N) => ({
  name: "grep",
  arguments: { pattern: `unrelated query ${N}`, path: Space.At("package.json") },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Space.Root);
    SeedHistory(Run, "b", Space.At(Anchor), Companions);
    await CheckAsync(Count, "T1: the default gate crosses and emits", async () => {
      const Out = await Post(Run, Read("b"));
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"));
    });
    rm();
    const Raised = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
    Raised.Context.workingDirectory = Service(Space.Root);
    SeedHistory(Raised, "b", Space.At(Anchor), Companions);
    await CheckAsync(Count, "T1: a raised config threshold abstains low-confidence", async () => {
      const Out = await Post(Raised, Read("b"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(
        Raised.Lines.includes("hook-dsh-search-suggester: abstained low-confidence History 0.87")
      );
    });
  }
  {
    rm();
    const Run = Setup();
    Run.Context.workingDirectory = Service(Space.Root);
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "T2: a second note within the cooldown is suppressed", async () => {
      await Post(Run, Read("a"));
      const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed cooldown History"));
    });
    await CheckAsync(Count, "T2: after the cooldown expires the dedupe holds the same note", async () => {
      for (let Index = 0; Index < 6; Index += 1) {
        await Post(Run, Elsewhere("a", String(Index)), {
          kind: "allow",
          additionalContexts: []
        });
      }
      const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dedupe History"));
      assert.equal(
        Run.Lines.filter((Line) => Line.includes(": suggest ")).length,
        1
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
    Run.Context.workingDirectory = Service(Space.Root);
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "T3: a zero cooldown window reaches the dedupe suppress", async () => {
      await Post(Run, Read("a"));
      const Out = await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dedupe History"));
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0, maxNotesPerTurn: 1 }));
    Run.Context.workingDirectory = Service(Space.Root);
    Commit(Run, "a", Space.At(Anchor));
    Commit(Run, "a", "CHANGELOG.md");
    Commit(Run, "a", Space.At("package.json"));
    Commit(Run, "a", "SCHEME.md");
    await CheckAsync(Count, "T4: the second note is capped", async () => {
      await Post(Run, Read("a"));
      const Out = await Post(
        Run,
        { name: "read", arguments: { file_path: Space.At("package.json") }, agent: AgentOf("a") },
        { kind: "allow", additionalContexts: [] }
      );
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed cap History"));
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.88 }));
    Run.Context.workingDirectory = Service(Space.Root);
    SeedHistory(Run, "a", Space.At(Anchor), Companions);
    await CheckAsync(Count, "T5: the R13 loop bonus lifts the third call over the floor", async () => {
      for (let Index = 0; Index < 2; Index += 1) {
        await Post(Run, Read("a"), { kind: "allow", additionalContexts: [] });
      }
      assert.equal(
        Run.Lines.filter((Line) => Line.includes("abstained low-confidence History 0.87")).length,
        2
      );
      const Out = await Post(Run, Read("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.89");
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.89 2 candidates"));
    });
  }
  return Finish(Count, "Threshold-And-Cooldown");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Threshold-And-Cooldown`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
