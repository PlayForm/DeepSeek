import assert from "node:assert/strict";
import Render from "../../../Target/Function/Render.js";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Validate,
  rm
} from "../Harness.js";
const Graph = () => {
  const Nodes = [
    {
      id: "File:src/a.ts",
      kind: "File",
      path: "src/a.ts",
      name: "a",
      span: { startLine: 1, endLine: 10 },
      fingerprint: "fp-a",
      version: "v3"
    },
    {
      id: "File:src/b.ts",
      kind: "File",
      path: "src/b.ts",
      name: "b",
      fingerprint: "fp-b",
      version: "v1"
    },
    {
      id: "File:docs/readme.md",
      kind: "File",
      path: "docs/readme.md",
      name: "readme",
      fingerprint: "fp-c",
      version: "v2"
    }
  ];
  const Edges = [
    { kind: "imports", from: "File:src/a.ts", to: "File:src/b.ts" },
    { kind: "calls", from: "File:src/a.ts", to: "File:src/b.ts" },
    { kind: "references", from: "File:src/a.ts", to: "File:docs/readme.md" }
  ];
  return {
    indexRevision: "rev-7",
    nodes: Nodes,
    edges: Edges,
    snapshot: () => ({ indexRevision: "rev-7", nodes: Nodes, edges: Edges }),
    getNode: (Id) => Nodes.find((Node) => Node.id === Id),
    find: (Query) => Nodes.filter(
      (Node) => Query.name === void 0 ? true : `${Node.name ?? Node.path}`.includes(Query.name)
    ).slice(0, Query.limit ?? 10),
    expand: (Id) => ({
      nodes: [],
      edges: Edges.filter((Edge) => Edge.from === Id || Edge.to === Id)
    })
  };
};
const Setup = (Raw = {}, WithGraph = true, Extra) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Raw }), (Context) => {
    if (WithGraph) {
      Context.workspaceGraph = Graph();
    }
    Extra?.(Context);
  });
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup({}, false);
    const Packet = Run.Context.workspaceContext.packet({});
    Check(Count, "K1: an absent sibling yields the honest OPEN line", () => {
      assert.deepEqual(Packet.open, [
        "workspace graph unavailable (the sibling index has not been probed)"
      ]);
      assert.equal(Packet.focus, "FOCUS (none: no scope)");
      assert.equal(Packet.workspace, "WORKSPACE workspace @ unknown");
      assert.deepEqual(Packet.map, []);
      assert.deepEqual(Packet.neighbors, []);
      assert.deepEqual(Packet.evidence, []);
      assert.equal(Packet.lens, "code");
      assert.equal(Packet.stale, void 0);
      assert.equal(Packet.nodeId, void 0);
      assert.equal(Packet.tokens, Math.ceil(Render(Packet).length / 4));
    });
    Check(Count, "K1: the packet line is byte-exact in the ledger", () => {
      assert.deepEqual(LinesWith(Run, "packet "), [
        `context: packet (none) (${Packet.tokens} tok, lens code)`
      ]);
      assert.equal(LedgerWith(`packet (none) (${Packet.tokens} tok, lens code)`).length, 1);
    });
  }
  {
    const Run = Setup();
    const Svc = Run.Context.workspaceContext;
    const Packet = Svc.packet({ id: "File:src/a.ts", caller: "tester" });
    Check(Count, "K2: the sections carry the exact graph data", () => {
      assert.equal(Packet.workspace, "WORKSPACE workspace @ rev-7");
      assert.equal(Packet.scope, "SCOPE File:src/a.ts");
      assert.deepEqual(Packet.map, ["src (2 files)", "docs (1 files)"]);
      assert.equal(
        Packet.focus,
        "FOCUS File:src/a.ts span 1-10 fp fp-a v v3"
      );
      assert.deepEqual(Packet.neighbors, [
        "calls File:src/a.ts -> File:src/b.ts",
        "imports File:src/a.ts -> File:src/b.ts",
        "references File:src/a.ts -> File:docs/readme.md"
      ]);
      assert.deepEqual(Packet.evidence, [
        "src/a.ts 1-10",
        "src/b.ts -",
        "docs/readme.md -"
      ]);
      assert.deepEqual(Packet.open, ["(none)"]);
      assert.equal(Packet.nodeId, "File:src/a.ts");
      assert.equal(Packet.nodeVersion, "v3");
    });
    Check(Count, "K2: the caller's focus is tracked and journaled", () => {
      assert.deepEqual(Run.Context.workspaceContext.focusOf("tester"), {
        id: "File:src/a.ts",
        version: "v3"
      });
      assert.ok(LinesWith(Run, "focus tester -> File:src/a.ts").length > 0);
      assert.ok(
        LinesWith(Run, `packet File:src/a.ts (${Packet.tokens} tok, lens code)`).length > 0
      );
    });
  }
  {
    const Run = Setup();
    const Packet = Run.Context.workspaceContext.packet({ query: "readme", lens: "docs" });
    Check(Count, "K3: the docs lens filters the edges and keeps the File nodes", () => {
      assert.equal(Packet.lens, "docs");
      assert.equal(Packet.nodeId, "File:docs/readme.md");
      assert.deepEqual(Packet.neighbors, []);
    });
    Check(Count, "K3: the MAP is capped by mapLimit and ordered biggest first", () => {
      const Small = Setup({ mapLimit: 1 });
      const SmallPacket = Small.Context.workspaceContext.packet({});
      assert.deepEqual(SmallPacket.map, ["src (2 files)"]);
      assert.equal(SmallPacket.map.length <= Small.State.MapLimit, true);
    });
  }
  {
    const Run = Setup({ lensDefault: "nope" });
    const Packet = Run.Context.workspaceContext.packet({ lens: "nope" });
    Check(Count, "K4: an unknown default lens reports itself and filters nothing", () => {
      assert.deepEqual(Packet.open, [
        'lens "nope" is not in the catalog (no filtering applied)'
      ]);
      assert.equal(Packet.lens, "nope");
      assert.equal(Packet.nodeId, void 0);
    });
  }
  {
    const Run = Setup();
    Run.Context.workspaceContext.packet({ id: "File:src/a.ts", caller: "tester" });
    const Stale = Run.Context.workspaceContext.packet({
      id: "File:src/a.ts",
      caller: "tester",
      callerVersion: "v2"
    });
    Check(Count, "K5: a mismatched caller version reports the STALE line", () => {
      assert.equal(Stale.stale, "caller held v2, current v3");
      assert.equal(Run.State.Stale, 1);
      assert.ok(LinesWith(Run, "stale File:src/a.ts (caller held v2)").length > 0);
    });
    Check(Count, "K5: a matching caller version stays fresh", () => {
      const Fresh = Run.Context.workspaceContext.packet({
        id: "File:src/a.ts",
        caller: "tester",
        callerVersion: "v3"
      });
      assert.equal(Fresh.stale, void 0);
      assert.equal(Run.State.Stale, 1);
    });
  }
  {
    const Run = Setup({ budgetTokens: 10, budgetMaximum: 12 });
    const Packet = Run.Context.workspaceContext.packet({ id: "File:src/a.ts" });
    Check(Count, "K6: an oversized packet drops the weakest neighbors first", () => {
      assert.deepEqual(Packet.neighbors, []);
      assert.equal(Packet.tokens, Math.ceil(Render(Packet).length / 4));
      assert.equal(Packet.tokens > 12, true);
      assert.equal(Run.State.Clamped, 1);
      assert.ok(LinesWith(Run, "clamped (").length > 0);
      assert.equal(
        LinesWith(Run, "clamped (")[0]?.endsWith("tok, budget 12)"),
        true
      );
    });
  }
  {
    const Run = Setup({ budgetTokens: 100 }, true, (Context) => {
      Context.tokenMeter = { estimate: () => 999 };
    });
    const Packet = Run.Context.workspaceContext.packet({ id: "File:src/a.ts" });
    Check(Count, "K7: the harness meter is honored and the clamp uses it", () => {
      assert.equal(Packet.tokens, 999);
      assert.deepEqual(LinesWith(Run, "clamped ("), [
        "context: clamped (999 -> 999 tok, budget 4000)"
      ]);
    });
  }
  {
    const Run = Setup();
    Run.Context.workspaceContext.packet({});
    Run.Context.workspaceContext.packet({ id: "File:src/a.ts" });
    Check(Count, "K8: the statistics report the exact counters and budget", () => {
      assert.deepEqual(Run.Context.workspaceContext.statistics(), {
        packets: 2,
        clamped: 0,
        stale: 0,
        budget: { target: 2e3, maximum: 4e3 }
      });
    });
  }
  {
    const Run = Setup();
    const Tool = Run.Tools[0];
    await CheckAsync(Count, "K9: the tool renders the packet as text with the stale flag", async () => {
      const Result = await Tool.execute({ id: "File:src/a.ts", callerVersion: "v2" });
      assert.equal(Result.lens, "code");
      assert.equal(Result.stale, true);
      assert.equal(Result.text.startsWith("WORKSPACE workspace @ rev-7"), true);
      assert.equal(Result.text.includes("STALE caller held v2, current v3"), true);
      assert.equal(Result.tokens, Math.ceil(Result.text.length / 4));
    });
  }
  {
    const Run = Setup();
    Run.Context.workspaceContext.packet({ id: "File:src/a.ts" });
    Check(Count, "K10: the fake fs records ZERO writeText and readText calls", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.reads.length, 0);
    });
  }
  return Finish(Count, "Packet-And-Budget");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Packet-And-Budget`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
