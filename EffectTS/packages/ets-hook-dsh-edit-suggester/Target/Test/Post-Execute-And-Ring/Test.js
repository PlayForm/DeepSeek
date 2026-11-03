import assert from "node:assert/strict";
import {
  AgentOf,
  CheckAsync,
  Durable,
  DurableLine,
  Finish,
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
const Anchor = "Source/Variable/Config.ts";
const Companions = ["README.md", "SCHEME.md"];
const ConfigEdit = (Id) => ({
  name: "edit",
  arguments: { file_path: Anchor },
  agent: AgentOf(Id)
});
const Seed = (Run, Id) => {
  Run.State.History.set(AgentOf(Id), {
    Seq: 3,
    Touches: [Anchor, ...Companions].map((Path, Seq) => ({
      seq: Seq,
      path: Path,
      tool: "edit"
    }))
  });
};
const HistoryText = [
  "[edit-suggester] family=History confidence=0.87",
  "companions (2):",
  "- README.md - touched 1 time(s) after this file",
  "- SCHEME.md - touched 1 time(s) after this file",
  "note: this file rarely stands alone; check whether these need the same change."
].join("\n");
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Seed(Run, "a");
    await CheckAsync(Count, "E1: the History note is prepended to the decision's additionalContexts", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, ConfigEdit("a"), Decision);
      assert.notEqual(Out, Decision);
      assert.equal(Out.kind, "allow");
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "edit-suggester",
        form: "notice",
        summary: "History 0.87"
      });
      assert.equal(Out.additionalContexts[0].role, "user");
      assert.equal(typeof Out.additionalContexts[0].id, "string");
      assert.equal(Out.additionalContexts[1].id, "downstream");
      assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
    });
    await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
      Seed(Run, "t");
      const Out = await Post(Run, ConfigEdit("t"), { kind: "allow", additionalContexts: [] });
      assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
    });
    await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
      assert.ok(Run.Lines.includes(`hook-dsh-edit-suggester: suggest History 0.87 2 companions ${Anchor}`));
      assert.match(
        DurableLine(`suggest History 0.87 2 companions ${Anchor}`),
        Durable(`suggest History 0.87 2 companions ${Anchor}`)
      );
      assert.equal(LedgerWith(`suggest History 0.87 2 companions ${Anchor}`).length, 2);
    });
    await CheckAsync(Count, "E1: the ring recorded the emit (cooldown, dedupe, counter)", async () => {
      const Rings = Run.State.Rings.State(AgentOf("a"));
      assert.deepEqual([...Rings.cooled.keys()], ["History"]);
      assert.equal(Rings.notes, 1);
      assert.ok(Rings.cooledNoted.has("History:README.md|SCHEME.md"));
      assert.ok(Rings.touched.has(Anchor));
      assert.equal(Rings.calls, 1);
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, { name: "bash", arguments: { command: "ls" }, agent: AgentOf("a") }, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Run.Lines, [`hook-dsh-edit-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.75)`]);
    });
    await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
      Seed(Run, "z");
      let NextCalled = false;
      const Downstream = { kind: "allow", additionalContexts: [] };
      const Out = await Run.CtxListeners["tools/post-execute"](
        ConfigEdit("z"),
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
    await CheckAsync(Count, "E3: a judged call with no history and no pack abstains no-history", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, ConfigEdit("a"), Decision);
      assert.equal(Out, Decision);
      assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained no-history  0.00"));
      assert.match(DurableLine("abstained no-history"), Durable("abstained no-history  0.00"));
    });
    rm();
    const Raised = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
    Seed(Raised, "a");
    await CheckAsync(Count, "E3: a raised config threshold abstains low-confidence", async () => {
      const Out = await Post(Raised, ConfigEdit("a"), { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Raised.Lines.includes("hook-dsh-edit-suggester: abstained low-confidence History 0.87"));
      assert.ok(Raised.Lines.includes(`hook-dsh-edit-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.9)`));
    });
  }
  {
    rm();
    const NoCooldown = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
    Seed(NoCooldown, "a");
    await CheckAsync(Count, "E4: a zero cooldown window reaches the dedupe suppress", async () => {
      await Post(NoCooldown, ConfigEdit("a"));
      const Out = await Post(NoCooldown, ConfigEdit("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(NoCooldown.Lines.includes("hook-dsh-edit-suggester: suppressed dedupe History"));
    });
    rm();
    const Capped = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 0 }));
    Seed(Capped, "a");
    await CheckAsync(Count, "E4: the per-turn cap suppresses the would-be note", async () => {
      const Out = await Post(Capped, ConfigEdit("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Capped.Lines.includes("hook-dsh-edit-suggester: suppressed cap History"));
    });
    const Run = Setup();
    Seed(Run, "a");
    await CheckAsync(Count, "E4: the default cooldown suppresses an immediate same-family repeat", async () => {
      await Post(Run, ConfigEdit("a"));
      const Out = await Post(Run, ConfigEdit("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suppressed cooldown History"));
    });
  }
  {
    const Run = Setup();
    Seed(Run, "b");
    await CheckAsync(Count, "E5: a block decision keeps kind and feedback and gains the note", async () => {
      const Out = await Post(Run, ConfigEdit("b"), { kind: "block", feedback: "no", additionalContexts: [] });
      assert.equal(Out.kind, "block");
      assert.equal(Out.feedback, "no");
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
    });
    Seed(Run, "a");
    await CheckAsync(Count, "E5: another agent's ring is independent", async () => {
      const Out = await Post(Run, ConfigEdit("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
    });
    await CheckAsync(Count, "E5: the agent/pre-step reset re-arms the same agent", async () => {
      await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
      const Rings = Run.State.Rings.State(AgentOf("a"));
      assert.equal(Rings.notes, 0);
      assert.equal(Rings.calls, 0);
      assert.equal(Rings.cooled.size, 0);
      const Out = await Post(Run, ConfigEdit("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
    });
    await CheckAsync(Count, "E5: a pre-step without a user message does not reset", async () => {
      const Out = await Post(Run, ConfigEdit("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suppressed cooldown History"));
      await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "assistant" } }] });
      const Out2 = await Post(Run, ConfigEdit("a"));
      assert.deepEqual(Out2.additionalContexts, []);
    });
    await CheckAsync(Count, "E5: the reset listener is fail-open and returns the downstream decision", async () => {
      const Out = await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
      assert.equal(Out, "down");
      assert.deepEqual(Run.Warns, []);
    });
  }
  return Finish(Count, "Post-Execute-And-Ring");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Post-Execute-And-Ring`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
