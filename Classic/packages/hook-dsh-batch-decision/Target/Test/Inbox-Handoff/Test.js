import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  Proposal,
  Tool,
  rm,
  Validate
} from "../Harness.js";
const Setup = () => {
  rm();
  return Make(
    Validate({
      logFile: Ledger,
      enabled: true,
      autoApprove: "on",
      allowlist: ["version-bump"],
      maxAutoTargets: 5,
      minConfidence: 0.8,
      pendingTtlMs: 36e5
    })
  );
};
const Agents = (Run, Id = "agent-a") => {
  const Injected = [];
  const Registry = {
    Injected,
    Initiator: void 0,
    First: void 0,
    get: (Target) => Target === Id ? {
      id: Id,
      inject: (Message) => {
        Injected.push(Message);
      }
    } : void 0,
    currentInitiator: () => Registry.Initiator,
    list: () => Registry.First === void 0 ? [] : [Registry.First]
  };
  Run.Services["agents"] = Registry;
  return Registry;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Registry = Agents(Run);
    Run.CtxListeners["batch/proposed"](Proposal({ origin: "agent-a" }));
    await Tool(Run).execute({ id: "prop-1", approve: true }, {});
    Check(Count, "H1: the decision is injected into the origin agent's inbox once", () => {
      assert.equal(Registry.Injected.length, 1);
      const Message = Registry.Injected[0];
      assert.equal(Message.role, "user");
      assert.equal(typeof Message.id, "string");
      assert.deepEqual(Message.source, { kind: "user" });
    });
    Check(Count, "H1: the injected text is the byte-exact decision envelope", () => {
      const Decision = Run.State.Pending.get("prop-1").decided;
      assert.equal(
        Registry.Injected[0].content[0].text,
        `[BATCH DECISION - prop-1]
${JSON.stringify(Decision)}`
      );
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: inbox prop-1: delivered to agent-a"));
    });
  }
  {
    const Run = Setup();
    const Registry = Agents(Run);
    Registry.Initiator = { id: "agent-initiator", inject: (Message) => Registry.Injected.push(Message) };
    Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-2" }));
    await Tool(Run).execute({ id: "prop-2", approve: true }, {});
    Check(Count, "H2: without an origin the harness initiator receives the decision", () => {
      assert.ok(
        Run.Lines.includes("hook-dsh-batch-decision: inbox prop-2: delivered to agent-initiator")
      );
    });
    Registry.Initiator = void 0;
    Registry.First = { id: "agent-first", inject: (Message) => Registry.Injected.push(Message) };
    Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-3", intent: "rename" }));
    await Tool(Run).execute({ id: "prop-3", approve: false }, {});
    Check(Count, "H2: without an initiator the first live agent receives the decision", () => {
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: inbox prop-3: delivered to agent-first"));
    });
  }
  {
    const Run = Setup();
    Run.CtxListeners["batch/proposed"](Proposal({ origin: "agent-a" }));
    await Tool(Run).execute({ id: "prop-1", approve: true }, {});
    Check(Count, "H3: without an agent registry the handoff is an honest ledger line", () => {
      assert.ok(Run.Lines.includes("hook-dsh-batch-decision: inbox prop-1: no live agent"));
    });
  }
  {
    const Run = Setup();
    const Received = [];
    Run.Services["ingester"] = {
      Apply: async (Proposal_, Decision_) => {
        Received.push([Proposal_, Decision_]);
        return {
          proposal: Decision_.proposal,
          perTarget: [],
          applied: 1,
          conflicts: 0,
          recovery: 0
        };
      }
    };
    Run.CtxListeners["batch/proposed"](Proposal({}));
    await CheckAsync(Count, "H4: the live `ingester` service receives the proposal AND the decision", async () => {
      const Result = await Tool(Run).execute({ id: "prop-1", approve: true }, {});
      assert.equal(Received.length, 1);
      assert.equal(Received[0][0].id, "prop-1");
      assert.equal(Received[0][0].targets.length, 1);
      assert.equal(Received[0][1].outcome, "approved");
      assert.equal(Result.detail, "approved prop-1; applied 1, conflicts 0, recovery 0");
    });
  }
  {
    const Run = Setup();
    Run.Services["batchIngester"] = {
      apply: async (Decision_) => ({
        proposal: Decision_.proposal,
        perTarget: [],
        applied: 2,
        conflicts: 0,
        recovery: 0
      })
    };
    Run.Services["ingester"] = {
      Apply: async () => {
        throw new Error("the declared seam must win");
      }
    };
    Run.CtxListeners["batch/proposed"](Proposal({}));
    await CheckAsync(Count, "H5: a registered `batchIngester` seam is preferred over the live name", async () => {
      const Result = await Tool(Run).execute({ id: "prop-1", approve: true }, {});
      assert.equal(Result.detail, "approved prop-1; applied 2, conflicts 0, recovery 0");
      assert.ok(Run.Gets.includes("batchIngester"));
    });
  }
  return Finish(Count, "Inbox-Handoff");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Inbox-Handoff`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
