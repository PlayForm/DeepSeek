import assert from "node:assert/strict";
import { createHash as Hash } from "node:crypto";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import BatchState from "../../../../ets-plugin-dsh-batchstate/Target/Library.js";
import FactoryClass from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import Feedback from "../../../../ets-plugin-dsh-feedback/Target/Library.js";
import Ingester from "../../../../ets-plugin-dsh-ingester/Target/Library.js";
import PassOn from "../../../../ets-plugin-dsh-pass-on/Target/Library.js";
import Plugin from "../../../Target/Library.js";
const Sha = (Content) => Hash("sha256").update(Content).digest("hex");
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batch-chain-"));
const Files = {
  board: Path.join(Root, "batchstate.log"),
  hook: Path.join(Root, "batch-decision.log"),
  passOn: Path.join(Root, "pass-on.log"),
  ingester: Path.join(Root, "ingester.log"),
  feedback: Path.join(Root, "feedback.log"),
  state: Path.join(Root, "state.json"),
  target: Path.join(Root, "repo", "pkg.json")
};
const Lines = (File) => {
  try {
    return FileSystem.readFileSync(File, "utf8").split("\n").filter(Boolean).map((Line) => JSON.parse(Line));
  } catch {
    return [];
  }
};
const FakeFs = (Content) => {
  const Files_ = { [Files.target]: Content };
  const Fs = {
    files: Files_,
    edits: [],
    resolve: async (P) => ({ targetKey: P, displayPath: P }),
    stat: async (Target) => {
      const Text = Files_[Target.displayPath];
      return Text === void 0 ? void 0 : { version: Sha(Text), type: "file" };
    },
    readText: async (Target) => Files_[Target.displayPath],
    editText: async (Target, Edit, Guard) => {
      Fs.edits.push([Target.displayPath, Edit.oldString]);
      const Text = Files_[Target.displayPath];
      if (Text === void 0 || !Text.includes(Edit.oldString) || Sha(Text) !== Guard.version) {
        throw new Error("FS_STALE_VERSION");
      }
      const Next = Text.replace(Edit.oldString, Edit.newString);
      Files_[Target.displayPath] = Next;
      return { operation: "update", version: Sha(Next) };
    }
  };
  return Fs;
};
const runTest = async () => {
  const Count = { N: 0, F: 0 };
  const Check = (Label, Assertions) => {
    Count.N++;
    try {
      Assertions();
      console.log(`PASS - ${Label}`);
    } catch (_Error) {
      Count.F++;
      console.log(`FAIL - ${Label}`);
      console.log(_Error instanceof Error ? _Error.message : String(_Error));
    }
  };
  const Content = '{"name": "c", "version": "1.0.0"}';
  FileSystem.mkdirSync(Path.dirname(Files.target), { recursive: true });
  FileSystem.writeFileSync(Files.target, Content, "utf8");
  const Fs = FakeFs(Content);
  const Listeners = {};
  const Lines_ = [];
  const Provided = {};
  const Services = {};
  const Registered = [];
  let Context;
  const On = (Name, Listener) => {
    Listeners[Name] = [...Listeners[Name] ?? [], Listener];
  };
  const Emit = (Name, ...Args) => {
    for (const Listener of Listeners[Name] ?? []) {
      try {
        Listener(...Args);
      } catch {
      }
    }
  };
  const Injected = [];
  const Agents = {
    get: (Id) => Id === "agent-a" ? {
      id: "agent-a",
      inject: (Message) => {
        Injected.push(Message);
        Emit("session/event", { id: "agent-a" }, {
          type: "agent/inbox/spliced",
          data: { target: "next-step", start: 0, inserted: [Message] }
        });
        Emit("agent/inbox/inserted", { agent: { id: "agent-a" }, message: Message });
      }
    } : void 0,
    list: () => [],
    currentInitiator: () => void 0
  };
  Context = {
    pluginFactory: new FactoryClass({ reflect: { provide: () => void 0 } }),
    logger: {
      info: (M) => Lines_.push(M),
      warn: (M) => Lines_.push(`WARN: ${M}`),
      error: (M) => Lines_.push(`ERROR: ${M}`)
    },
    on: On,
    emit: Emit,
    get: (Name) => Services[Name],
    tools: {
      register: (Definition) => {
        Registered.push(Definition);
        return () => true;
      }
    },
    fs: Fs,
    root: { on: On, emit: Emit },
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value ?? true;
        Services[Name] = Value;
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  Services["agents"] = Agents;
  BatchState.apply(
    Context,
    BatchState.Config({
      logFile: Files.board,
      enabled: true,
      stateFile: Files.state
    })
  );
  const Board = Context.batchstate;
  const Pass = new PassOn(
    Context,
    PassOn.Config({ logFile: Files.passOn, root: Root, enabled: true })
  );
  const Ingest = new Ingester(
    Context,
    Ingester.Config({ logFile: Files.ingester, enabled: true })
  );
  const Council = new Feedback(
    Context,
    Feedback.Config({ logFile: Files.feedback, enabled: true })
  );
  Services["passOn"] = Pass;
  Services["ingester"] = Ingest;
  Services["feedback"] = Council;
  Plugin.apply(
    Context,
    Plugin.Config({
      logFile: Files.hook,
      enabled: true,
      autoApprove: "off",
      allowlist: [],
      maxAutoTargets: 5,
      minConfidence: 0.8,
      pendingTtlMs: 36e5
    })
  );
  const Hook = Context.__hookDshBatchDecisionState;
  const Tool = Registered.find((One) => One.name === "batch_decision");
  const Prepared = Pass.Prepare(
    { kind: "version-bump", targets: [Files.target], params: { version: "2.0.0" } },
    "agent-a"
  );
  Check("C1: the pass-on prepared the batch and delivered it into the inbox", () => {
    assert.equal(Prepared.targets.length, 1);
    assert.equal(Injected.length, 1);
    assert.ok(Injected[0].content[0].text.startsWith(`[BATCH PROPOSAL - ${Prepared.id}]`));
  });
  Check("C2: the board spliced the proposal with the byte-exact line", () => {
    const Entry = Board.getProposals()[0];
    assert.equal(Entry.proposal.id, Prepared.id);
    assert.equal(Entry.status, "proposed");
    assert.ok(
      Lines_.includes(
        `batchstate: proposal ${Prepared.id} spliced (intent version-bump, targets 1, rev 1, origin agent-a)`
      )
    );
  });
  Check("C3: the decision hook recorded the proposal and the ingester holds it", () => {
    assert.equal(Hook.Pending.get(Prepared.id).proposal.targets.length, 1);
    assert.ok(
      Lines_.includes(
        `hook-dsh-batch-decision: proposal ${Prepared.id} recorded (intent version-bump, targets 1, rev 1)`
      )
    );
    assert.equal(Ingest.Proposals().length, 1);
  });
  const Decided = await Tool.execute({ id: Prepared.id, approve: true }, {});
  await Ingest.WhenIdle();
  Check("C4: the approval applied the change through the content fence", () => {
    assert.equal(Decided.kind, "approved");
    assert.equal(Fs.files[Files.target], '{"name": "c", "version": "2.0.0"}');
    const Applied = Lines(Files.ingester).filter((Line) => Line.event === "applied");
    assert.equal(Applied.length, 1);
    assert.equal(Applied[0].path, Files.target);
  });
  Check("C5: the decision reached the board through the inbox", () => {
    assert.equal(Board.getProposals()[0].status, "approved");
    assert.ok(
      Lines_.includes(`batchstate: proposal ${Prepared.id} decided approved (by user)`)
    );
    assert.ok(
      Lines_.includes(`hook-dsh-batch-decision: inbox ${Prepared.id}: delivered to agent-a`)
    );
  });
  Check("C6: the hook logged the decision and the ingester handoff byte-exactly", () => {
    assert.ok(
      Lines_.includes(`hook-dsh-batch-decision: decision approved ${Prepared.id} (by user)`)
    );
    assert.ok(
      Lines_.includes(
        `hook-dsh-batch-decision: handoff ${Prepared.id}: applied 1, conflicts 0, recovery 0`
      )
    );
  });
  Check("C7: the batch outcome fed the feedback journal and summary", () => {
    const Outcome = Lines(Files.feedback).find((Line) => Line.event === "batch");
    assert.deepEqual(
      [Outcome.session, Outcome.agentId, Outcome.proposal, Outcome.outcome, Outcome.detail],
      ["agent-a", "agent-a", Prepared.id, "applied", "applied 1, conflicts 0, recovery 0"]
    );
    const Summary = Council.Summary("agent-a");
    assert.deepEqual(
      Summary.outcomes.map((One) => [One.proposal, One.outcome]),
      [[Prepared.id, "applied"]]
    );
  });
  Check("C8: the same decision was applied exactly once (the claim held)", () => {
    assert.equal(Fs.edits.length, 1);
    assert.equal(Lines(Files.ingester).filter((Line) => Line.event === "applied").length, 1);
  });
  Check("C9: the delivery journaled the inbox handoff byte-exactly", () => {
    const Delivered = Lines(Files.passOn).filter((Line) => Line.event === "delivered");
    assert.equal(Delivered.length, 1);
    assert.equal(Delivered[0].note, "inbox agent-a");
    assert.equal(Delivered[0].proposal, Prepared.id);
  });
  if (Count.F !== 0) {
    throw new Error(`Batch-Chain: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Batch-Chain`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
