import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
  AgentOf,
  CheckAsync,
  Durable,
  DurableLine,
  Finish,
  Knowledge,
  Ledger,
  LedgerWith,
  Make,
  MakeCounter,
  Pre,
  Post,
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
  arguments: { pattern: "1.2.3", path: "Site/package.json" },
  agent: AgentOf(Id)
});
const FollowEdit = (Id) => ({
  name: "edit",
  arguments: { file_path: "package.json" },
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
    await CheckAsync(Count, "E1: the Version note is prepended to the decision's additionalContexts", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, StrongVersion("a"), Decision);
      assert.notEqual(Out, Decision);
      assert.equal(Out.kind, "allow");
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "search-suggester",
        form: "notice",
        summary: "Version 0.92"
      });
      assert.equal(Out.additionalContexts[0].role, "user");
      assert.equal(typeof Out.additionalContexts[0].id, "string");
      assert.equal(Out.additionalContexts[1].id, "downstream");
      assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
    });
    await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
      const Out = await Post(Run, WeakVersion("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.84"));
    });
    await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest Version 0.92 7 candidates"));
      assert.match(
        DurableLine("suggest Version 0.92 7 candidates"),
        Durable("suggest Version 0.92 7 candidates")
      );
      assert.equal(LedgerWith("suggest Version 0.92 7 candidates").length, 1);
    });
    await CheckAsync(Count, "E1: the ring recorded the emit (cooldown, recent, pending, counter)", async () => {
      const Rings = Run.State.Rings.State(AgentOf("a"));
      assert.deepEqual([...Rings.cooled.keys()], ["Version"]);
      assert.deepEqual([...Rings.recent.keys()].slice(0, 3), ["package.json", "Site/package.json", "Classic/packages/*/package.json"]);
      assert.deepEqual(Rings.pending, { intent: "Version", since: 1 });
      assert.equal(Rings.notes, 1);
      assert.equal(Rings.calls, 2);
      assert.equal(Run.State.Knowledge.stats.emitted, 1);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, { name: "webfetch", arguments: { url: "https://example.com" }, agent: AgentOf("a") }, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: activated (bundle 0.1.0, intents 10, threshold 0.75)"]);
    });
    await CheckAsync(Count, "E2: a bash call is judged through its command text", async () => {
      const Out = await Post(Run, { name: "bash", arguments: { command: "npm version 1.2.3" }, agent: AgentOf("a") }, { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.80"));
    });
    await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
      let NextCalled = false;
      const Downstream = { kind: "allow", additionalContexts: [] };
      const Out = await Run.CtxListeners["tools/post-execute"](
        { name: "grep", arguments: { pattern: "1.2.3 version", path: "package.json" }, agent: AgentOf("z") },
        {},
        async () => {
          NextCalled = true;
          return Downstream;
        }
      );
      assert.equal(NextCalled, true);
      assert.notEqual(Out, Downstream);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E3: an unrelated call abstains no-signal with the empty-intent line", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, Unrelated("a", "one"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"));
      assert.match(DurableLine("abstained no-signal"), Durable("abstained no-signal  0.00"));
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E4: an edit of a candidate path records `followed` and saves the knowledge", async () => {
      await Post(Run, StrongVersion("a"));
      await Post(Run, FollowEdit("a"));
      assert.ok(Run.Lines.includes("hook-dsh-search-suggester: followed Version package.json"));
      assert.match(
        DurableLine("followed Version package.json"),
        Durable("followed Version package.json")
      );
      assert.equal(Run.State.Knowledge.stats.followed, 1);
      assert.equal(Run.State.Knowledge.stats.emitted, 1);
      assert.equal(Run.State.Rings.State(AgentOf("a")).pending, void 0);
      assert.equal(FileSystem.existsSync(Knowledge), true);
    });
    const Reload = Make(Validate({ logFile: Ledger, enabled: true }));
    await CheckAsync(Count, "E4: the knowledge reloads from the saved file", async () => {
      assert.deepEqual(Reload.State.Knowledge.stats, { emitted: 1, followed: 1, ignored: 0, dismissed: 0 });
    });
    rm();
    const Loop = Make(Validate({ logFile: Ledger, enabled: true }));
    await CheckAsync(Count, "E4: a window closed untouched records `ignored`", async () => {
      await Post(Loop, StrongVersion("a"));
      await Post(Loop, Unrelated("a", "one"));
      await Post(Loop, Unrelated("a", "two"));
      await Post(Loop, Unrelated("a", "three"));
      assert.ok(Loop.Lines.includes("hook-dsh-search-suggester: ignored Version"));
      assert.match(DurableLine("ignored Version"), Durable("ignored Version"));
      assert.equal(Loop.State.Knowledge.stats.ignored, 1);
      assert.equal(Loop.State.Rings.State(AgentOf("a")).pending, void 0);
    });
  }
  {
    rm();
    const NoCooldown = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
    await CheckAsync(Count, "E5: a zero cooldown window reaches the dedupe suppress", async () => {
      await Post(NoCooldown, StrongVersion("a"));
      const Out = await Post(NoCooldown, StrongVersion("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(NoCooldown.Lines.includes("hook-dsh-search-suggester: suppressed dedupe Version"));
    });
    rm();
    const Capped = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 1 }));
    await CheckAsync(Count, "E5: the per-turn cap suppresses the second intent", async () => {
      await Post(Capped, StrongVersion("a"));
      await Pre(Capped, { agent: AgentOf("a"), messages: [{ role: "user", content: "run the failing test suite" }] });
      const First = await Post(Capped, { name: "grep", arguments: { pattern: "assert suite", path: "" }, agent: AgentOf("a") }, { kind: "allow", additionalContexts: [] });
      assert.deepEqual(First.additionalContexts, []);
      assert.ok(Capped.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Test 0.72"));
      const Second = await Post(Capped, { name: "grep", arguments: { pattern: "assert suite", path: "" }, agent: AgentOf("a") }, { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Second.additionalContexts, []);
      const Out = await Post(Capped, { name: "grep", arguments: { pattern: "assert suite", path: "" }, agent: AgentOf("a") }, { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Capped.Lines.includes("hook-dsh-search-suggester: suppressed cap Test"));
    });
    await CheckAsync(Count, "E5: the agent/pre-step reset re-arms the same agent", async () => {
      await Post(Capped, StrongVersion("a"));
      await Pre(Capped, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
      const Rings = Capped.State.Rings.State(AgentOf("a"));
      assert.equal(Rings.notes, 0);
      assert.equal(Rings.calls, 0);
      assert.equal(Rings.cooled.size, 0);
      const Out = await Post(Capped, StrongVersion("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
    });
    await CheckAsync(Count, "E5: another agent's ring is independent and the reset returns downstream", async () => {
      const Out = await Post(Capped, StrongVersion("b"));
      assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
      const Down = await Pre(Capped, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
      assert.equal(Down, "down");
      assert.deepEqual(Capped.Warns, []);
    });
  }
  return Finish(Count, "Post-Execute-And-Learning");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Post-Execute-And-Learning`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
