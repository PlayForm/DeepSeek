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
const LedgerWrite = (Id) => ({
  name: "write",
  arguments: { file_path: "Source/Function/Apply.ts" },
  agent: AgentOf(Id)
});
const NamingWrite = (Id) => ({
  name: "write",
  arguments: { file_path: "Source/Foo.ts" },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    await CheckAsync(Count, "E1: the Ledger note is prepended to the decision's additionalContexts", async () => {
      const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
      const Out = await Post(Run, LedgerWrite("a"), Decision);
      assert.notEqual(Out, Decision);
      assert.equal(Out.kind, "allow");
      assert.deepEqual(Out.additionalContexts[0].source, {
        kind: "convention-suggester",
        form: "notice",
        summary: "Ledger 0.87"
      });
      assert.equal(Out.additionalContexts[0].role, "user");
      assert.equal(typeof Out.additionalContexts[0].id, "string");
      assert.equal(Out.additionalContexts[1].id, "downstream");
      assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
    });
    await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
      const Out = await Post(Run, NamingWrite("a"), { kind: "allow", additionalContexts: [] });
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        "[convention-suggester] intent=Naming confidence=0.80\ntargets (3):\n- Source/Function/*.ts - PascalCase, one word, action-oriented, present tense, singular\n- Source/Interface/*.ts - the type shapes, PascalCase full words (Config/State/Factory exempt)\n- Source/Variable/*.ts - the built-once constants (Config schema, defaults, packs)\nnote: full-word PascalCase names; no abbreviations; genuine acronyms stay."
      );
    });
    await CheckAsync(Count, "E1: the suggest ledger lines are byte-exact in both forms", async () => {
      assert.ok(Run.Lines.includes("convention-suggester: suggest Ledger 0.87 4 candidates call write"));
      assert.match(
        DurableLine("suggest Ledger 0.87 4 candidates call write"),
        Durable("suggest Ledger 0.87 4 candidates call write")
      );
      assert.equal(LedgerWith("suggest Ledger 0.87 4 candidates call write").length, 1);
      assert.ok(Run.Lines.includes("convention-suggester: suggest Naming 0.80 3 candidates call write"));
    });
    await CheckAsync(Count, "E1: the per-agent memory recorded the emits", async () => {
      const Memory = Run.State.Agents.get(AgentOf("a"));
      assert.equal(Memory.Calls, 2);
      assert.equal(Memory.TurnNotes, 2);
      assert.deepEqual([...Memory.Noted.keys()], ["Ledger", "Naming"]);
      assert.equal(Memory.Noted.get("Ledger"), 1);
      assert.equal(Memory.Ring.length, 2);
      assert.ok(Memory.Ring[0].includes("Source/Foo.ts"));
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, { name: "bash", arguments: { command: "ls" }, agent: AgentOf("a") }, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Run.Lines, ["convention-suggester: activated (bundle 0.3.0, intents 4, threshold 0.75)"]);
    });
    await CheckAsync(Count, "E2: a judged call with no matching intent stays silent (no ledger line)", async () => {
      const Decision = { kind: "allow", additionalContexts: [] };
      const Out = await Post(Run, { name: "write", arguments: { file_path: "random/path/file.txt" }, agent: AgentOf("a") }, Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Run.Lines, ["convention-suggester: activated (bundle 0.3.0, intents 4, threshold 0.75)"]);
    });
    await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
      let NextCalled = false;
      const Downstream = { kind: "allow", additionalContexts: [] };
      const Out = await Run.CtxListeners["tools/post-execute"](
        { name: "write", arguments: { file_path: "Source/Function/Apply.ts" }, agent: AgentOf("z") },
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
    rm();
    const Excluded = Make(Validate({ logFile: Ledger, enabled: true, exclude: ["README.md", "SCHEME.md", "cordis.patch.yml"] }));
    await CheckAsync(Count, "E3: a fully excluded candidate set abstains ambiguous", async () => {
      const Out = await Post(Excluded, { name: "write", arguments: { file_path: "Classic/packages/x/README.md" }, agent: AgentOf("a") }, { kind: "allow", additionalContexts: [] });
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Excluded.Lines.includes("convention-suggester: abstained ambiguous Docs 0.80"));
      assert.match(
        DurableLine("abstained ambiguous Docs 0.80"),
        Durable("abstained ambiguous Docs 0.80")
      );
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E4: the default cooldown suppresses an immediate same-intent repeat", async () => {
      await Post(Run, LedgerWrite("a"));
      const Out = await Post(Run, LedgerWrite("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Run.Lines.includes("convention-suggester: suppressed cooldown Ledger"));
      assert.match(
        DurableLine("suppressed cooldown Ledger"),
        Durable("suppressed cooldown Ledger")
      );
    });
    rm();
    const Capped = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 1 }));
    await CheckAsync(Count, "E4: the per-turn cap suppresses the second intent", async () => {
      await Post(Capped, LedgerWrite("a"));
      const Out = await Post(Capped, NamingWrite("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Capped.Lines.includes("convention-suggester: suppressed cap Naming"));
    });
    await CheckAsync(Count, "E4: the agent/pre-step reset releases the cap", async () => {
      await Pre(Capped, { agent: AgentOf("a"), messages: [{ role: "user" }] });
      const Out = await Post(Capped, NamingWrite("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "Naming 0.80");
      assert.ok(Capped.Lines.includes("convention-suggester: suggest Naming 0.80 3 candidates call write"));
    });
    await CheckAsync(Count, "E4: a pre-step whose last message is not a user message does not reset", async () => {
      await Pre(Capped, { agent: AgentOf("a"), messages: [{ role: "assistant" }] });
      const Out = await Post(Capped, LedgerWrite("a"));
      assert.deepEqual(Out.additionalContexts, []);
      assert.ok(Capped.Lines.includes("convention-suggester: suppressed cooldown Ledger"));
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "E5: a block decision keeps kind and feedback and gains the note", async () => {
      const Out = await Post(Run, LedgerWrite("b"), { kind: "block", feedback: "no", additionalContexts: [] });
      assert.equal(Out.kind, "block");
      assert.equal(Out.feedback, "no");
      assert.equal(Out.additionalContexts[0].source.summary, "Ledger 0.87");
    });
    await CheckAsync(Count, "E5: another agent's memory is independent", async () => {
      const Out = await Post(Run, LedgerWrite("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "Ledger 0.87");
    });
    await CheckAsync(Count, "E5: the ring buffer caps at eight probes", async () => {
      for (let Index = 0; Index < 9; Index++) {
        await Post(Run, { name: "write", arguments: { file_path: `random/path/file${Index}.txt` }, agent: AgentOf("c") });
      }
      const Memory = Run.State.Agents.get(AgentOf("c"));
      assert.equal(Memory.Ring.length, 8);
      assert.equal(Memory.Calls, 9);
      assert.ok(Memory.Ring[0].includes("file8.txt"));
    });
    await CheckAsync(Count, "E5: the reset listener is fail-open and returns the downstream decision", async () => {
      const Out = await Pre(Run, { agent: AgentOf("a"), messages: [{ role: "user" }] });
      assert.equal(Out, "down");
      assert.deepEqual(Run.Warns, []);
    });
  }
  return Finish(Count, "Post-Execute-And-Gate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Post-Execute-And-Gate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
