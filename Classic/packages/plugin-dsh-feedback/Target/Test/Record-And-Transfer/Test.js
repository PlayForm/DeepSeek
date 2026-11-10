import assert from "node:assert/strict";
import {
  Block,
  Check,
  Finish,
  JournalEvents,
  JournalLines,
  Ledger,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Check(Count, "F1: the constructor registers the service and the session/event listener", () => {
      assert.ok(Run.Provided["feedback"] !== void 0);
      assert.ok(Run.Listeners["session/event"] !== void 0);
      assert.equal(Object.keys(Run.Listeners).length, 1);
    });
    Check(Count, "F1: the schema fills the defaults", () => {
      assert.equal(Run.State.Config.enabled, true);
      assert.equal(Run.State.Config.maxBlockBytes, 4096);
      assert.equal(Run.State.Config.maxChain, 8);
      assert.equal(Run.State.Config.summaryTerms, 10);
      assert.equal(Run.State.Ledger, Ledger);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Record(Block());
    Check(Count, "F2: the record stores the block in the session's record, unread", () => {
      const Session = Run.State.Sessions.get("session-child");
      assert.equal(Session.order[0], "agent-a");
      assert.equal(Session.blocks.get("agent-a").readStatus, "unread");
      assert.equal(Session.blocks.get("agent-a").liked, "the harness was clear");
    });
    Check(Count, "F2: the journal records the event with the block", () => {
      assert.deepEqual(JournalEvents(), ["recorded"]);
      const Line = JournalLines()[0];
      assert.equal(Line.session, "session-child");
      assert.equal(Line.agentId, "agent-a");
      assert.equal(Line.block.task, "write the smoke");
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, maxBlockBytes: 256 }));
    Run.Service.Record(Block({ liked: "x".repeat(100), disliked: "ok", deltas: ["y".repeat(70)] }));
    Check(Count, "F3: oversized text is capped with the marker, never dropped", () => {
      const Stored = Run.State.Sessions.get("session-child").blocks.get("agent-a");
      assert.equal(Stored.liked, `${"x".repeat(64)}... [capped]`);
      assert.equal(Stored.disliked, "ok");
      assert.equal(Stored.deltas[0], `${"y".repeat(64)}... [capped]`);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Record(Block());
    Run.Service.Record(Block({ liked: "the newer signal" }));
    Check(Count, "F4: the same agent's newer block replaces the older one in place", () => {
      const Session = Run.State.Sessions.get("session-child");
      assert.equal(Session.blocks.get("agent-a").liked, "the newer signal");
      assert.deepEqual(Session.order, ["agent-a"]);
      assert.deepEqual(JournalEvents(), ["recorded", "restored"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Record(Block());
    Run.Service.Push(Block(), "session-parent");
    Check(Count, "T1: the push lands the block in the parent session with the next hop", () => {
      const Parent = Run.State.Sessions.get("session-parent");
      assert.equal(Parent.blocks.get("agent-a").session, "session-parent");
      assert.deepEqual(Parent.blocks.get("agent-a").transferred, ["session-child"]);
      assert.deepEqual(JournalEvents(), ["recorded", "recorded"]);
    });
    Check(Count, "T1: the pushed block keeps the honest content", () => {
      const Parent = Run.State.Sessions.get("session-parent");
      assert.equal(Parent.blocks.get("agent-a").disliked, "the registry lagged");
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Push(Block(), "session-child");
    Check(Count, "T2: a push back to the same session is a no-op", () => {
      assert.equal(Run.State.Sessions.size, 0);
    });
    Run.Service.Push(Block(), "session-parent");
    assert.equal(Run.State.Sessions.get("session-parent").blocks.size, 1);
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Run.Service.Push(Block(), "session-parent");
    Check(Count, "T2: a disabled plugin's push is a no-op", () => {
      assert.equal(Run.State.Sessions.size, 0);
    });
    Run.Service.Record(Block());
    Check(Count, "T2: Record still stores without journaling when disabled", () => {
      assert.equal(Run.State.Sessions.get("session-child").blocks.size, 1);
      assert.deepEqual(JournalEvents(), ["recorded"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, maxChain: 1 }));
    Run.Service.Push(Block({ transferred: ["older"] }), "session-parent");
    Check(Count, "T3: a block that has traversed too many boundaries is dropped", () => {
      assert.equal(Run.State.Sessions.size, 0);
      assert.equal(JournalEvents().length, 0);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    const Text = Run.Service.Render(Block());
    Check(Count, "R1: the transfer format is byte-exact", () => {
      assert.equal(
        Text,
        [
          "[HONEST FEEDBACK - agent-a - write the smoke - session-child]",
          "LIKED: the harness was clear",
          "DISLIKED: the registry lagged",
          "DELTAS: -",
          "TRANSFERRED: -",
          "READ-STATUS: unread"
        ].join("\n")
      );
    });
    const Hopped = Run.Service.Render(
      Block({ deltas: ["parent saw the lag"], transferred: ["session-grandparent"], readStatus: "read-at session-parent" })
    );
    Check(Count, "R1: the hopped form carries the joined chains", () => {
      assert.equal(
        Text.length > 0 && Hopped.includes("DELTAS: parent saw the lag"),
        true
      );
      assert.ok(Hopped.includes("TRANSFERRED: session-grandparent"));
      assert.ok(Hopped.includes("READ-STATUS: read-at session-parent"));
    });
  }
  return Finish(Count, "Record-And-Transfer");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Record-And-Transfer`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
