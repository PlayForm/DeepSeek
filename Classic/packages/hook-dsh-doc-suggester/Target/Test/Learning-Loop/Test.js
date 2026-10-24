import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
  AgentOf,
  CheckAsync,
  FakeStorage,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Pattern,
  Post,
  Pre,
  rm,
  Setup,
  Validate
} from "../Harness.js";
const Neutral = 1 / 3;
const AcceptBonus = 0.1;
const RejectPenalty = 0.2;
const Tree = (Prefix) => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Put = (Root, Relative, Body = "x") => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Body, "utf8");
  return Full;
};
const Pack = `signature:
  - docs/STYLE.md
families:
  "doc/Index":
    id: Index
    priority: 1
    threshold: 0.75
    signals:
      - rule: index
        pattern: '(^|/)Documentation/INDEX\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 0.6
        reason: the style
      - path: docs/REFERENCE.md
        kind: doc
        prior: 0.6
        reason: the reference
`;
const Workspace = Tree("doc-suggester-learning-");
Put(Workspace, ".dsh/pack.yml", Pack);
Put(Workspace, "docs/STYLE.md");
const Reference = Put(Workspace, "docs/REFERENCE.md");
const Index = Put(Workspace, "Documentation/INDEX.md");
const Service = (Cwd) => ({ get: () => Cwd });
const NoteOrder = (Head) => `[doc-suggester] family=Index confidence=0.87
companions (2):
- ${Head} - ${Head === "docs/STYLE.md" ? "the style" : "the reference"}
- ${Head === "docs/STYLE.md" ? "docs/REFERENCE.md - the reference" : "docs/STYLE.md - the style"}
note: a documentation task rarely touches one file; keep the doc graph coherent.`;
const Emit = (Id) => ({
  name: "read",
  arguments: { file_path: Index },
  agent: AgentOf(Id)
});
const Touch = (Id) => ({
  name: "read",
  arguments: { file_path: Reference },
  agent: AgentOf(Id)
});
const Age = (Id) => ({
  name: "read",
  arguments: { file_path: "unrelated/deep/file.go" },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Workspace);
    await CheckAsync(Count, "L1: the note is byte-exact and records a pending decision", async () => {
      const Out = await Post(Run, Emit("learn-a"));
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        NoteOrder("docs/STYLE.md")
      );
      const Last = Run.State.Last;
      assert.equal(Last.family, "Index");
      assert.equal(Last.outcome, "pending");
      assert.equal(Last.store, "memory");
      assert.equal(Last.companions.length, 2);
      assert.equal(Last.companions[0].path, "docs/STYLE.md");
      assert.ok(Math.abs(Last.companions[0].heuristics.history - Neutral) < 1e-9);
      assert.ok(Math.abs(Last.companions[0].score - 0.675) < 1e-9);
      assert.deepEqual(Last.enabled, [
        "scope",
        "graph",
        "prior",
        "literal",
        "history",
        "accept"
      ]);
      assert.ok(
        Run.Lines.includes(
          "hook-dsh-doc-suggester: decided Index 0.87 2 companions docs/STYLE.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.25,literal=0.25,history=0.15,accept=0.00 store=memory"
        )
      );
    });
    await CheckAsync(Count, "L1: touching a companion records the accept for it and its family", async () => {
      await Post(Run, Touch("learn-a"));
      assert.ok(
        Run.Lines.includes("hook-dsh-doc-suggester: accepted Index docs/REFERENCE.md")
      );
      assert.ok(
        Math.abs(
          Run.State.Learning.Rate("Index", "docs/REFERENCE.md").Companion - (Neutral + AcceptBonus)
        ) < 1e-9
      );
      assert.ok(
        Math.abs(Run.State.Learning.Rate("Index", "").Family - (Neutral + AcceptBonus)) < 1e-9
      );
      assert.equal(Run.State.Last.outcome, "accepted");
    });
    await CheckAsync(Count, "L1: the next call ranks the accepted companion first and its score rises", async () => {
      await Pre(Run, { agent: AgentOf("learn-a"), messages: [{ source: { kind: "user" } }] });
      const Out = await Post(Run, Emit("learn-a"));
      assert.equal(
        Out.additionalContexts[0].content[0].text,
        NoteOrder("docs/REFERENCE.md")
      );
      assert.equal(Run.State.Last.companions[0].path, "docs/REFERENCE.md");
      assert.ok(Run.State.Last.companions[0].score > 0.675);
      assert.ok(
        Math.abs(Run.State.Last.companions[0].heuristics.history - (Neutral + AcceptBonus)) < 1e-9
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Workspace);
    await CheckAsync(Count, "L2: a window that closes untouched records the soft reject", async () => {
      await Post(Run, Emit("learn-b"));
      const First = Run.State.Last.companions[0].score;
      await Post(Run, Age("learn-b"));
      await Post(Run, Age("learn-b"));
      assert.equal(
        Run.Lines.includes("hook-dsh-doc-suggester: rejected Index 2 companions"),
        false
      );
      await Post(Run, Age("learn-b"));
      assert.ok(
        Run.Lines.includes("hook-dsh-doc-suggester: rejected Index 2 companions")
      );
      assert.ok(
        Math.abs(
          Run.State.Learning.Rate("Index", "docs/STYLE.md").Companion - (Neutral - RejectPenalty)
        ) < 1e-9
      );
      assert.equal(Run.State.Last.outcome, "rejected");
      assert.ok(Math.abs(First - 0.675) < 1e-9);
    });
    await CheckAsync(Count, "L2: the rejected companions' rate falls and the next note's score drops", async () => {
      await Pre(Run, { agent: AgentOf("learn-b"), messages: [{ source: { kind: "user" } }] });
      const Out = await Post(Run, Emit("learn-b"));
      assert.equal(Out.additionalContexts.length, 1);
      assert.ok(Run.State.Last.companions[0].score < 0.675);
      assert.ok(
        Math.abs(Run.State.Last.companions[0].heuristics.history - (Neutral - RejectPenalty)) < 1e-9
      );
    });
  }
  {
    rm();
    const Disabled = Make(
      Validate({
        logFile: Ledger,
        enabled: true,
        heuristics: ["scope", "graph", "prior", "history", "accept"]
      })
    );
    Disabled.Context.workingDirectory = Service(Workspace);
    await CheckAsync(Count, "L3: disabling a heuristic drops it from the enabled list and the score", async () => {
      await Post(Disabled, Emit("learn-c"));
      const Last = Disabled.State.Last;
      assert.equal(Last.enabled.includes("literal"), false);
      assert.equal(Last.weights.literal, 0);
      assert.ok(Math.abs(Last.companions[0].score - 0.55) < 1e-9);
      assert.ok(
        Disabled.Lines.includes(
          "hook-dsh-doc-suggester: decided Index 0.87 2 companions docs/STYLE.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.25,literal=0.00,history=0.15,accept=0.00 store=memory"
        )
      );
    });
    rm();
    const Raised = Make(
      Validate({
        logFile: Ledger,
        enabled: true,
        weights: { scope: 0.35, prior: 0.5, literal: 0.25, history: 0.15 }
      })
    );
    Raised.Context.workingDirectory = Service(Workspace);
    await CheckAsync(Count, "L3: a raised weight raises the score and the ledger carries the table", async () => {
      await Post(Raised, Emit("learn-d"));
      const Last = Raised.State.Last;
      assert.equal(Last.weights.prior, 0.5);
      assert.ok(Math.abs(Last.companions[0].score - 0.825) < 1e-9);
      assert.ok(
        Raised.Lines.includes(
          "hook-dsh-doc-suggester: decided Index 0.87 2 companions docs/STYLE.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.50,literal=0.25,history=0.15,accept=0.00 store=memory"
        )
      );
    });
  }
  {
    const Run = Setup();
    Run.Context.workingDirectory = Service(Workspace);
    await CheckAsync(Count, "L4: without a store the memory fallback answers the neutral 1/3", async () => {
      assert.equal(Run.State.Learning.Store(), "memory");
      await Post(Run, Emit("learn-e"));
      assert.equal(Run.State.Last.store, "memory");
      assert.ok(Math.abs(Run.State.Last.companions[0].heuristics.history - Neutral) < 1e-9);
      assert.ok(Math.abs(Run.State.Last.companions[0].score - 0.675) < 1e-9);
    });
    await CheckAsync(Count, "L4: the memory fallback keeps the decision record in its ring", async () => {
      assert.equal(Run.State.Learning.Recent().length, 1);
      const Record = Run.State.Learning.Recent()[0];
      assert.equal(Record.family, "Index");
      assert.deepEqual(
        Record.companions.map((Companion) => Companion.path),
        ["docs/STYLE.md", "docs/REFERENCE.md"]
      );
    });
  }
  {
    const Store = FakeStorage();
    const First = Pattern(Store);
    await First.Flush();
    rm();
    const Run = Make(
      Validate({
        logFile: Ledger,
        enabled: true,
        weights: { scope: 0.35, prior: 0.4, literal: 0.25, history: 0.15 }
      })
    );
    Run.Context.pattern = First;
    Run.Context.workingDirectory = Service(Workspace);
    await CheckAsync(Count, "L5: the decision record is stored with the weights and the pending outcome", async () => {
      await Post(Run, Emit("learn-f"));
      assert.equal(Run.State.Learning.Store(), "pattern");
      assert.equal(Run.State.Last.store, "pattern");
      const Stored = First.List().filter(
        (Record) => Record.id.startsWith("hook-dsh-doc-suggester:decision:")
      );
      assert.equal(Stored.length, 1);
      assert.deepEqual(Stored[0].targets, ["docs/STYLE.md", "docs/REFERENCE.md"]);
      assert.equal(Stored[0].arbiter, "pending");
      assert.equal(Stored[0].intent, "Index");
      assert.equal(
        Stored[0].transform[0],
        "weights scope=0.35,graph=0.00,prior=0.40,literal=0.25,history=0.15,accept=0.00"
      );
      assert.equal(
        Stored[0].transform[1],
        "enabled scope,graph,prior,literal,history,accept"
      );
      assert.equal(Stored[0].transform[2], "outcome pending");
      assert.ok(Stored[0].transform[3].startsWith("docs/STYLE.md scope=1.00,graph=0.50"));
    });
    await CheckAsync(Count, "L5: the accept fills the outcome and moves the rate records", async () => {
      await Post(Run, Touch("learn-f"));
      assert.ok(
        Math.abs(
          First.Get("hook-dsh-doc-suggester:companion:docs/REFERENCE.md").confidence - (Neutral + AcceptBonus)
        ) < 1e-9
      );
      const Stored = First.List().filter(
        (Record) => Record.id.startsWith("hook-dsh-doc-suggester:decision:")
      );
      assert.equal(Stored[0].arbiter, "accepted");
      assert.equal(Stored[0].transform[2], "outcome accepted");
    });
    await CheckAsync(Count, "L5: a reopen through the KV store reads the rate back and keeps the weights", async () => {
      await First.Save();
      const Second = Pattern(Store);
      await Second.Flush();
      assert.ok(
        Math.abs(
          Second.Get("hook-dsh-doc-suggester:companion:docs/REFERENCE.md").confidence - (Neutral + AcceptBonus)
        ) < 1e-9
      );
      const Stored = Second.List().filter(
        (Record) => Record.id.startsWith("hook-dsh-doc-suggester:decision:")
      );
      assert.equal(Stored.length, 1);
      assert.equal(Stored[0].arbiter, "accepted");
      assert.equal(
        Stored[0].transform[0],
        "weights scope=0.35,graph=0.00,prior=0.40,literal=0.25,history=0.15,accept=0.00"
      );
      rm();
      const Reopen = Make(
        Validate({
          logFile: Ledger,
          enabled: true,
          weights: { scope: 0.35, prior: 0.4, literal: 0.25, history: 0.15 }
        })
      );
      Reopen.Context.pattern = Second;
      Reopen.Context.workingDirectory = Service(Workspace);
      const Out = await Post(Reopen, Emit("learn-g"));
      assert.equal(Out.additionalContexts[0].source.summary, "Index 0.87");
      assert.equal(Reopen.State.Last.companions[0].path, "docs/REFERENCE.md");
      assert.equal(Reopen.State.Last.weights.prior, 0.4);
      assert.ok(
        Math.abs(
          Reopen.State.Last.companions[0].heuristics.history - (Neutral + AcceptBonus)
        ) < 1e-9
      );
    });
  }
  return Finish(Count, "Learning-Loop");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Learning-Loop`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
