import assert from "node:assert/strict";
import {
  Check,
  Finish,
  JournalLines,
  Ledger,
  Make,
  MakeCounter,
  rm,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    const Record = Run.Service.Outcome(
      "session-child",
      "agent-a",
      "p1",
      "applied",
      "applied 1, conflicts 0, recovery 0"
    );
    Check(Count, "O1: the outcome is appended to the session's ring", () => {
      assert.deepEqual(Record, {
        proposal: "p1",
        outcome: "applied",
        detail: "applied 1, conflicts 0, recovery 0",
        at: Record.at
      });
      assert.equal(Run.State.Outcomes.get("session-child").length, 1);
    });
    Check(Count, "O1: the journal line is byte-exact (its own event shape)", () => {
      const Lines = JournalLines();
      assert.equal(Lines.length, 1);
      assert.deepEqual(Lines[0], {
        at: Lines[0].at,
        event: "batch",
        session: "session-child",
        agentId: "agent-a",
        proposal: "p1",
        outcome: "applied",
        detail: "applied 1, conflicts 0, recovery 0"
      });
    });
    Check(Count, "O1: the summary carries the outcome beside the blocks", () => {
      const Summary = Run.Service.Summary("session-child");
      assert.deepEqual(
        Summary.outcomes.map((One) => [One.proposal, One.outcome]),
        [["p1", "applied"]]
      );
      assert.equal(Summary.blocks, 0);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, maxOutcomes: 2 }));
    for (const Proposal of ["p1", "p2", "p3"]) {
      Run.Service.Outcome("session-child", "agent-a", Proposal, "rejected", "denied");
    }
    Check(Count, "O2: the ring keeps the newest maxOutcomes outcomes", () => {
      assert.deepEqual(
        Run.State.Outcomes.get("session-child").map((One) => One.proposal),
        ["p2", "p3"]
      );
      assert.equal(JournalLines().length, 3);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Outcome("session-a", "agent-a", "p1", "applied", "applied 1");
    Run.Service.Outcome("session-b", "agent-b", "p2", "expired", "expired");
    Check(Count, "O3: each session's summary carries only its own outcomes", () => {
      assert.deepEqual(
        Run.Service.Summary("session-a").outcomes.map((One) => One.proposal),
        ["p1"]
      );
      assert.deepEqual(
        Run.Service.Summary("session-b").outcomes.map((One) => One.proposal),
        ["p2"]
      );
      assert.deepEqual(Run.Service.Summary("session-unknown").outcomes, []);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "O4: a proposal-less report records nothing, never invents a batch", () => {
      assert.equal(Run.Service.Outcome("session-child", "agent-a", "", "applied", "x"), null);
      assert.equal(Run.State.Outcomes.size, 0);
      assert.equal(JournalLines().length, 0);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "O5: a disabled service records no outcome and journals nothing", () => {
      assert.equal(Run.Service.Outcome("session-child", "agent-a", "p1", "applied", "x"), null);
      assert.equal(Run.State.Outcomes.size, 0);
      assert.equal(JournalLines().length, 0);
    });
  }
  return Finish(Count, "Batch-Outcome");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Batch-Outcome`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
