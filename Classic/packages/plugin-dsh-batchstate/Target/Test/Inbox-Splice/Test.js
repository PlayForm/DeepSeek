import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
  Check,
  Finish,
  Ledger,
  LedgerWith,
  Make,
  MakeCounter,
  rm,
  StateFile,
  Validate
} from "../Harness.js";
const Proposal = (Overrides = {}) => ({
  id: "prop-1",
  intent: "version-bump",
  targets: [{ path: "/tmp/pkg.json", version: "v1", why: "version 1.0.0 -> 2.0.0" }],
  operations: [
    {
      kind: "replace",
      path: "/tmp/pkg.json",
      find: '"version": "1.0.0"',
      replace: '"version": "2.0.0"',
      why: "version 1.0.0 -> 2.0.0"
    }
  ],
  preview: { entries: [], changes: 1, skipped: [] },
  digest: "digest-1",
  revision: 1,
  expiresAt: 4e12,
  confidence: 0.9,
  origin: "agent-a",
  ...Overrides
});
const Decision = (Overrides = {}) => ({
  proposal: "prop-1",
  outcome: "approved",
  by: "user",
  at: 1e6,
  ...Overrides
});
const ProposalBlock = (Value) => `[BATCH PROPOSAL - ${Value.id}]
${JSON.stringify(Value)}`;
const DecisionBlock = (Value) => `[BATCH DECISION - ${Value.proposal}]
${JSON.stringify(Value)}`;
const Message = (Id, Text) => ({
  id: Id,
  role: "user",
  content: [{ type: "text", text: Text }],
  source: { kind: "user" }
});
const Splice = (Run, Text, Id = "msg-1", Session = "agent-a") => {
  Run.CtxListeners["session/event"](
    { id: Session },
    {
      type: "agent/inbox/spliced",
      data: { target: "next-step", start: 0, inserted: [Message(Id, Text)] }
    }
  );
};
const Inserted = (Run, Text, Id = "msg-1", Agent = "agent-a") => {
  Run.CtxListeners["agent/inbox/inserted"]({
    agent: { id: Agent },
    message: Message(Id, Text)
  });
};
const Setup = (Config = {}) => {
  rm();
  try {
    FileSystem.rmSync(StateFile);
  } catch {
  }
  return Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile, ...Config }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    Splice(Run, ProposalBlock(Proposal()));
    Check(Count, "I1: the spliced proposal lands on the board with the byte-exact line", () => {
      assert.ok(
        Run.Lines.includes(
          "batchstate: proposal prop-1 spliced (intent version-bump, targets 1, rev 1, origin agent-a)"
        )
      );
      const Entry = Run.State.Proposals.get("prop-1");
      assert.equal(Entry.status, "proposed");
      assert.equal(Entry.proposal.intent, "version-bump");
      assert.equal(Entry.proposal.targets.length, 1);
      assert.equal(Entry.proposal.origin, "agent-a");
    });
    Check(Count, "I1: the splice emits the proposal state-change event", () => {
      assert.deepEqual(Run.Events, [{ batch: "default", id: "prop-1", kind: "proposal" }]);
    });
    Check(Count, "I1: the service reads the proposal back", () => {
      assert.equal(Run.Context.batchstate.getProposals().length, 1);
      assert.equal(Run.Context.batchstate.getState().proposals[0].proposal.id, "prop-1");
    });
    Check(Count, "I1: the delivering session is the return address, not the payload's origin", () => {
      Splice(
        Run,
        ProposalBlock(Proposal({ id: "prop-2", origin: "agent-z" })),
        "msg-2",
        "session-parent"
      );
      assert.ok(
        Run.Lines.includes(
          "batchstate: proposal prop-2 spliced (intent version-bump, targets 1, rev 1, origin session-parent)"
        )
      );
    });
  }
  {
    const Run = Setup();
    Splice(Run, ProposalBlock(Proposal()), "msg-1");
    Inserted(Run, ProposalBlock(Proposal()), "msg-1");
    Check(Count, "I2: the live emit and the durable splice of one message project once", () => {
      assert.equal(LedgerWith("proposal prop-1 spliced").length, 1);
      assert.equal(Run.State.Proposals.size, 1);
    });
    Inserted(Run, ProposalBlock(Proposal()), "msg-2");
    Check(Count, "I2: a re-delivery of the same revision is ignored with the byte-exact line", () => {
      assert.ok(Run.Lines.includes("batchstate: proposal prop-1 skipped (revision not newer)"));
      assert.equal(Run.State.Proposals.get("prop-1").proposal.revision, 1);
    });
    Inserted(Run, ProposalBlock(Proposal({ revision: 2 })), "msg-3");
    Check(Count, "I2: a revision bump replaces the proposal in place", () => {
      assert.equal(Run.State.Proposals.get("prop-1").proposal.revision, 2);
      assert.ok(
        Run.Lines.includes(
          "batchstate: proposal prop-1 spliced (intent version-bump, targets 1, rev 2, origin agent-a)"
        )
      );
    });
  }
  {
    const Run = Setup();
    Splice(Run, "[BATCH PROPOSAL - prop-broken]\n{not json", "msg-b");
    Check(Count, "I3: a marker with an unparseable body is refused, never guessed", () => {
      assert.ok(Run.Lines.includes("batchstate: proposal prop-broken rejected (malformed payload)"));
      assert.equal(Run.State.Proposals.size, 0);
    });
    Splice(Run, '[BATCH PROPOSAL - prop-noid]\n{"intent":"x"}', "msg-c");
    Check(Count, "I3: a payload without an id is refused", () => {
      assert.ok(Run.Lines.includes("batchstate: proposal rejected (malformed payload)"));
      assert.equal(Run.State.Proposals.size, 0);
    });
    const Before = Run.Lines.length;
    Splice(Run, "an ordinary message with no batch block", "msg-d");
    Splice(Run, "", "msg-e");
    Check(Count, "I3: an ordinary message is silence - no line, no state", () => {
      assert.equal(Run.Lines.length, Before);
      assert.equal(Run.State.Proposals.size, 0);
    });
  }
  {
    const Run = Setup();
    Splice(Run, ProposalBlock(Proposal()), "msg-1");
    Splice(Run, DecisionBlock(Decision()), "msg-2");
    Check(Count, "I4: the decision moves the proposal's status with the byte-exact line", () => {
      assert.ok(Run.Lines.includes("batchstate: proposal prop-1 decided approved (by user)"));
      assert.equal(Run.State.Proposals.get("prop-1").status, "approved");
      assert.deepEqual(Run.Events[Run.Events.length - 1], {
        batch: "default",
        id: "prop-1",
        kind: "decision"
      });
    });
    Splice(Run, DecisionBlock(Decision({ proposal: "prop-ghost" })), "msg-3");
    Check(Count, "I4: a decision for an unknown proposal is refused with its own line", () => {
      assert.ok(Run.Lines.includes("batchstate: decision prop-ghost ignored (unknown proposal)"));
    });
    Splice(Run, '[BATCH DECISION - prop-1]\n{"outcome":"maybe"}', "msg-4");
    Check(Count, "I4: a decision outside the closed outcome vocabulary is refused", () => {
      assert.ok(Run.Lines.includes("batchstate: decision rejected (malformed payload)"));
      assert.equal(Run.State.Proposals.get("prop-1").status, "approved");
    });
  }
  {
    const Run = Setup();
    Run.Context.batchstate.setGate("build", "green");
    Run.Context.batchstate.setGate("smokes", "red", "coder-a");
    Check(Count, "G1: the gate lines are byte-exact (with and without an owner)", () => {
      assert.ok(Run.Lines.includes("batchstate: gate build: green"));
      assert.ok(Run.Lines.includes("batchstate: gate smokes: red (owner coder-a)"));
      assert.deepEqual(
        Run.Context.batchstate.getGates().map((One) => [One.name, One.state, One.owner]),
        [
          ["build", "green", ""],
          ["smokes", "red", "coder-a"]
        ]
      );
    });
    Check(Count, "G1: the compiled block renders the gates sorted, with the owner", () => {
      const Block = Run.Context.batchstate.getContext("a");
      assert.ok(Block.includes("GATES: build green, smokes red (owner coder-a)"));
    });
    Check(Count, "G1: a gate outside the closed vocabulary throws at the call site", () => {
      assert.throws(
        () => Run.Context.batchstate.setGate("build", "yellow"),
        /batchstate: gate state must be green \| red \| unknown/
      );
      assert.throws(
        () => Run.Context.batchstate.setGate("", "green"),
        /batchstate: gate name must be a non-empty string/
      );
    });
  }
  {
    const Run = Setup();
    Check(Count, "Q1: without a queue service the projection is none and the block is silent", () => {
      assert.equal(Run.Context.batchstate.getQueue(), "QUEUE: none");
      assert.equal(Run.Context.batchstate.getContext("a").includes("QUEUE:"), false);
    });
    const Line = "QUEUE: 2 pending - next: queue-3 - running: 1/10 (main seats 1)";
    Run.Context.dshQueue = { Board: () => Line };
    Check(Count, "Q1: with the queue service the projection is its own line, verbatim", () => {
      assert.equal(Run.Context.batchstate.getQueue(), Line);
      assert.ok(Run.Context.batchstate.getContext("a").includes(Line));
    });
    Run.Context.dshQueue = {
      Board: () => {
        throw new Error("broken queue");
      }
    };
    Check(Count, "Q1: a broken queue never breaks the compile", () => {
      assert.equal(Run.Context.batchstate.getQueue(), "QUEUE: none");
      assert.equal(Run.Context.batchstate.getContext("a").includes("QUEUE:"), false);
    });
  }
  {
    Check(Count, "X1: a maxProposals below 1 fails loud at load", () => {
      assert.throws(
        () => Setup({ maxProposals: 0 }),
        /batchstate: maxProposals must be an integer >= 1/
      );
    });
  }
  {
    const First = Setup();
    Splice(First, ProposalBlock(Proposal()), "msg-1");
    First.Context.batchstate.setGate("build", "green");
    const Second = Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile }));
    Check(Count, "R1: the board survives a restart - the proposals and the gates return", () => {
      assert.equal(Second.State.Proposals.get("prop-1")?.proposal.intent, "version-bump");
      assert.equal(Second.State.Gates.get("build")?.state, "green");
      assert.ok(Second.Lines.includes("batchstate: recovered (0 members, queue 0)"));
    });
    Check(Count, "R1: the recovered proposal is still the live read", () => {
      assert.equal(Second.Context.batchstate.getProposals().length, 1);
      assert.ok(Second.Context.batchstate.getContext("a").includes("GATES: build green"));
    });
  }
  return Finish(Count, "Inbox-Splice");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Inbox-Splice`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
