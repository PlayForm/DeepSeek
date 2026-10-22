import assert from "node:assert/strict";
import {
  Block,
  Check,
  Finish,
  Fire,
  JournalEvents,
  JournalLines,
  Ledger,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const SPLICE = [
  "[HONEST FEEDBACK - agent-b - review the pr - session-child]",
  "LIKED: the plan was precise",
  "DISLIKED: the build was slow",
  "DELTAS: -",
  "TRANSFERRED: -",
  "READ-STATUS: unread"
].join("\n");
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Record(Block());
    const Updated = Run.Service.Delta("session-child", "agent-a", "parent: registry fixed");
    Check(Count, "D1: the delta appends to the stored block, never edits the honest content", () => {
      assert.equal(Updated?.deltas.length, 1);
      assert.equal(Updated?.deltas[0], "parent: registry fixed");
      assert.equal(Updated?.liked, "the harness was clear");
      assert.equal(Run.State.Sessions.get("session-child").blocks.get("agent-a").deltas.length, 1);
    });
    Check(Count, "D1: the delta journals its event", () => {
      assert.deepEqual(JournalEvents(), ["recorded", "delta"]);
    });
    Check(Count, "D1: a delta on an unknown block is null", () => {
      assert.equal(Run.Service.Delta("session-child", "agent-x", "nope"), null);
      assert.equal(Run.Service.Delta("session-unknown", "agent-a", "nope"), null);
      assert.deepEqual(JournalEvents(), ["recorded", "delta"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Run.Service.Record(Block());
    const Read = Run.Service.Read("session-child", "agent-a", "session-parent");
    Check(Count, "R1: the read records read-at with the reader, never forced", () => {
      assert.equal(Read?.readStatus, "read-at session-parent");
      assert.equal(Run.State.Sessions.get("session-child").blocks.get("agent-a").readStatus, "read-at session-parent");
    });
    Check(Count, "R1: the read journals its event", () => {
      assert.deepEqual(JournalEvents(), ["recorded", "restored"]);
      assert.equal(JournalLines()[1]?.block.readStatus, "read-at session-parent");
    });
    Check(Count, "R1: a second read is idempotent - no second journal line", () => {
      const Again = Run.Service.Read("session-child", "agent-a", "session-grandparent");
      assert.equal(Again?.readStatus, "read-at session-parent");
      assert.deepEqual(JournalEvents(), ["recorded", "restored"]);
    });
    Check(Count, "R1: a read of an unknown block is null", () => {
      assert.equal(Run.Service.Read("session-child", "agent-x", "r"), null);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, summaryTerms: 3 }));
    Run.Service.Record(Block({ agentId: "agent-a", liked: "the harness the tools", disliked: "the slow the build" }));
    Run.Service.Record(Block({ agentId: "agent-b", session: "session-child", liked: "the plan", disliked: "the lag" }));
    Run.Service.Read("session-child", "agent-b", "reader");
    const Summary = Run.Service.Summary("session-child");
    Check(Count, "S1: the summary counts blocks and unread and aggregates the terms", () => {
      assert.equal(Summary.session, "session-child");
      assert.equal(Summary.blocks, 2);
      assert.equal(Summary.unread, 1);
      assert.equal(Summary.liked[0], "harness");
      assert.equal(Summary.entries.length, 2);
    });
    Check(Count, "S1: short words are excluded from the clusters", () => {
      assert.ok(Summary.liked.includes("harness"));
      assert.ok(!Summary.liked.includes("the"));
      assert.ok(Summary.disliked.includes("slow"));
      assert.ok(!Summary.disliked.includes("lag"));
    });
    const Empty = Run.Service.Summary("session-unknown");
    Check(Count, "S1: a summary of an unknown session is the empty aggregate", () => {
      assert.deepEqual(
        [Empty.blocks, Empty.unread, Empty.liked.length, Empty.disliked.length],
        [0, 0, 0, 0]
      );
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }));
    Fire(Run, { type: "agent/inbox/spliced", data: { inserted: [{ content: [{ type: "text", text: SPLICE }] }] } });
    Check(Count, "L1: an inbox splice carrying a block is recorded unread", () => {
      const Stored = Run.State.Sessions.get("session-child").blocks.get("agent-b");
      assert.equal(Stored.readStatus, "unread");
      assert.equal(Stored.liked, "the plan was precise");
      assert.deepEqual(JournalEvents(), ["recorded"]);
    });
    Check(Count, "L1: a splice without a block records nothing", () => {
      Fire(Run, { type: "agent/inbox/spliced", data: { inserted: [{ content: [{ type: "text", text: "plain text" }] }] } });
      assert.deepEqual(JournalEvents(), ["recorded"]);
    });
    Check(Count, "L1: other event types are ignored", () => {
      Fire(Run, { type: "agent/message", data: { inserted: [{ content: [{ type: "text", text: SPLICE }] }] } });
      assert.deepEqual(JournalEvents(), ["recorded"]);
    });
    Check(Count, "L1: malformed events never throw (fail-open)", () => {
      Fire(Run, { type: "agent/inbox/spliced", data: void 0 });
      Fire(Run, { type: "agent/inbox/spliced" });
      Fire(Run, {});
      assert.deepEqual(JournalEvents(), ["recorded"]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Fire(Run, { type: "agent/inbox/spliced", data: { inserted: [{ content: [{ type: "text", text: SPLICE }] }] } });
    Check(Count, "L2: a disabled listener records nothing", () => {
      assert.equal(Run.State.Sessions.size, 0);
      assert.deepEqual(JournalEvents(), []);
    });
  }
  return Finish(Count, "Read-Summary-Listener");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Read-Summary-Listener`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
