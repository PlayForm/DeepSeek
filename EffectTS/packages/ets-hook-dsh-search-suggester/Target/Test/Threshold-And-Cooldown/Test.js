import assert from "node:assert/strict";
import {
  AgentOf,
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Post,
  Pre,
  rm,
  Setup,
  Validate
} from "../Harness.js";
const StrongVersion = (Id) => ({
  name: "grep",
  arguments: { pattern: "1.2.3 version", path: "package.json" },
  agent: AgentOf(Id)
});
const WeakVersion = (Id) => ({
  name: "grep",
  arguments: { pattern: "1.2.3", path: "package.json" },
  agent: AgentOf(Id)
});
const Unrelated = (Id, N) => ({
  name: "grep",
  arguments: { pattern: `unrelated query ${N}`, path: "" },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    await CheckAsync(Count, "T1: the weak call abstains under the pack's 0.85 gate", async () => {
      const Out = await Post(Run, WeakVersion("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.84"));
    });
    await CheckAsync(Count, "T1: the strong call crosses the gate and emits", async () => {
      const Out = await Post(Run, StrongVersion("b"));
      assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.92 7 candidates"));
    });
  }
  {
    rm();
    const Run = Setup();
    await CheckAsync(Count, "T2: a second note within the cooldown is suppressed", async () => {
      await Post(Run, StrongVersion("a"));
      const Out = await Post(Run, StrongVersion("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed cooldown Version"));
    });
    await CheckAsync(Count, "T2: after the cooldown expires the dedupe holds the same note", async () => {
      for (let Index = 0; Index < 6; Index += 1) {
        await Post(Run, Unrelated("a", String(Index)), {
          kind: "allow",
          additionalContexts: []
        });
      }
      const Out = await Post(Run, StrongVersion("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dedupe Version"));
      assert.equal(
        Run.Lines.filter((Line) => Line.includes(": suggest ")).length,
        1
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
    await CheckAsync(Count, "T3: a zero cooldown window reaches the dedupe suppress", async () => {
      await Post(Run, StrongVersion("a"));
      const Out = await Post(Run, StrongVersion("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed dedupe Version"));
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 1 }));
    await CheckAsync(Count, "T4: the second intent's note is capped", async () => {
      await Post(Run, StrongVersion("a"));
      await Pre(Run, {
        agent: AgentOf("a"),
        messages: [{ role: "user", content: "run the failing test suite" }]
      });
      for (let Index = 0; Index < 2; Index += 1) {
        await Post(
          Run,
          { name: "grep", arguments: { pattern: "assert suite", path: "" }, agent: AgentOf("a") },
          { kind: "allow", additionalContexts: [] }
        );
      }
      const Out = await Post(
        Run,
        { name: "grep", arguments: { pattern: "assert suite", path: "" }, agent: AgentOf("a") },
        { kind: "allow", additionalContexts: [] }
      );
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suppressed cap Test"));
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.6 }));
    await CheckAsync(Count, "T5: the destructive intent keeps its 0.85 gate over the config", async () => {
      const Out = await Post(Run, WeakVersion("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.84"));
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
