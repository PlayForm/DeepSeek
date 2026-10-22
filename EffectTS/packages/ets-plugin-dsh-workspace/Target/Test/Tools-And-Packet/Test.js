import assert from "node:assert/strict";
import {
  CheckAsync,
  Finish,
  Ledger,
  Make,
  MakeCounter,
  rm,
  StandardGraph,
  Tool,
  Validate
} from "../Harness.js";
const Setup = () => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }), StandardGraph());
    CheckAsync(Count, "T1: a disabled plugin's map tool refuses with the byte-exact error", async () => {
      await assert.rejects(
        () => Tool(Run, "workspace_map").execute({}, {}),
        /^Error: workspace_map: the workspace plugin is disabled \(enabled=false\)$/
      );
    });
    CheckAsync(Count, "T1: the other three tools refuse identically", async () => {
      await assert.rejects(() => Tool(Run, "workspace_find").execute({}, {}), /workspace_find: the workspace plugin is disabled/);
      await assert.rejects(() => Tool(Run, "workspace_expand").execute({ id: "File:src/a.ts" }, {}), /workspace_expand: the workspace plugin is disabled/);
      await assert.rejects(() => Tool(Run, "workspace_context").execute({}, {}), /workspace_context: the workspace plugin is disabled/);
    });
  }
  {
    const Run = Setup();
    const Map = Tool(Run, "workspace_map");
    CheckAsync(Count, "T2: map over the standard graph returns the contract shape", async () => {
      const Result = await Map.execute({}, {});
      assert.equal(Result.indexRevision, "rev-1");
      assert.equal(Result.files, 2);
      assert.equal(Result.truncated, false);
      assert.deepEqual(Result.modules, [
        { id: "File:src/a.ts", path: "src/a.ts", role: "Module A" },
        { id: "File:src/b.ts", path: "src/b.ts", role: "module" }
      ]);
      assert.deepEqual(Result.entryPoints, ["File:src/a.ts"]);
      assert.deepEqual(Result.hotSymbols, [
        { id: "Symbol:b", kind: "Symbol", path: "src/b.ts", name: "bFn", startLine: 1, endLine: 4, fingerprint: "fp-Symbol:b", version: "1" }
      ]);
      assert.equal(Result.cursor, "Symbol:b");
    });
    CheckAsync(Count, "T2: the map ledger line is byte-exact", async () => {
      await Map.execute({}, {});
      assert.ok(
        Run.Lines.includes("plugin-dsh-workspace: workspace: map (root) (2 modules, 2 files)")
      );
    });
    CheckAsync(Count, "T2: map's render is the pure one-line summary", async () => {
      const Result = await Map.execute({}, {});
      assert.deepEqual(Map.output.render({}, Result), [
        { type: "text", text: "map @ rev-1: 2 files, 2 modules, 1 entry points" }
      ]);
    });
    CheckAsync(Count, "T2: a scoped path filters the modules", async () => {
      const Result = await Map.execute({ path: "src/b" }, {});
      assert.equal(Result.files, 1);
      assert.deepEqual(Result.modules.map((Row) => Row.path), ["src/b.ts"]);
    });
  }
  {
    const Run = Setup();
    const Find = Tool(Run, "workspace_find");
    CheckAsync(Count, "T3: find by pattern returns the row shape with id, path, span, kind", async () => {
      const Result = await Find.execute({ pattern: "src/*.ts", kind: "Symbol" }, {});
      assert.equal(Result.indexRevision, "rev-1");
      assert.equal(Result.truncated, false);
      assert.deepEqual(
        Result.nodes.map((Row) => Row.id),
        ["Symbol:a", "Symbol:b"]
      );
      assert.deepEqual(Result.nodes[0], {
        id: "Symbol:a",
        kind: "Symbol",
        path: "src/a.ts",
        name: "aFn",
        startLine: 1,
        endLine: 9,
        fingerprint: "fp-Symbol:a",
        version: "1"
      });
    });
    CheckAsync(Count, "T3: cursor pagination resumes strictly after the cursor id", async () => {
      const First = await Find.execute({ kind: "Symbol", limit: 1 }, {});
      assert.deepEqual(First.nodes.map((Row) => Row.id), ["Symbol:a"]);
      assert.equal(First.truncated, true);
      assert.equal(First.cursor, "Symbol:a");
      const Second = await Find.execute({ kind: "Symbol", limit: 1, cursor: "Symbol:a" }, {});
      assert.deepEqual(Second.nodes.map((Row) => Row.id), ["Symbol:b"]);
      assert.equal(Second.truncated, false);
    });
    CheckAsync(Count, "T3: the find ledger line is byte-exact", async () => {
      await Find.execute({ pattern: "src/*.ts", kind: "Symbol" }, {});
      assert.ok(
        Run.Lines.includes("plugin-dsh-workspace: workspace: find src/*.ts (2 nodes)")
      );
    });
  }
  {
    const Run = Setup();
    const Expand = Tool(Run, "workspace_expand");
    CheckAsync(Count, "T4: expand follows the outgoing edges and carries the row shapes", async () => {
      const Result = await Expand.execute({ id: "File:src/a.ts" }, {});
      assert.equal(Result.indexRevision, "rev-1");
      assert.equal(Result.node.id, "File:src/a.ts");
      assert.deepEqual(
        Result.nodes.map((Row) => Row.id),
        ["Symbol:a", "File:src/b.ts"]
      );
      assert.deepEqual(
        Result.edges,
        [
          { kind: "contains", from: "File:src/a.ts", to: "Symbol:a" },
          { kind: "imports", from: "File:src/a.ts", to: "File:src/b.ts" }
        ]
      );
    });
    CheckAsync(Count, "T4: a deferred edge kind yields an honest empty set, never a fake edge", async () => {
      const Result = await Expand.execute({ id: "File:src/a.ts", kinds: ["references", "calls", "tests"] }, {});
      assert.deepEqual(Result.nodes, []);
      assert.deepEqual(Result.edges, []);
    });
    CheckAsync(Count, "T4: an unknown node id expands to nothing and is not faked", async () => {
      const Result = await Expand.execute({ id: "File:src/none.ts" }, {});
      assert.equal(Result.node, void 0);
      assert.deepEqual(Result.nodes, []);
      assert.deepEqual(Result.edges, []);
      assert.equal(Result.truncated, false);
    });
    CheckAsync(Count, "T4: the expand ledger line is byte-exact", async () => {
      await Expand.execute({ id: "File:src/b.ts" }, {});
      assert.ok(
        Run.Lines.includes("plugin-dsh-workspace: workspace: expand File:src/b.ts (1 nodes, 1 edges)")
      );
    });
  }
  {
    const Run = Setup();
    const Context = Tool(Run, "workspace_context");
    CheckAsync(Count, "T5: the packet text follows the fixed eight-line grammar", async () => {
      const Result = await Context.execute({ id: "File:src/b.ts" }, {});
      const Lines = Result.text.split("\n");
      assert.equal(Lines[0], "WORKSPACE workspace @ rev-1");
      assert.equal(Lines[1], "SCOPE File:src/b.ts");
      assert.equal(Lines[2], "MAP src/a.ts (Module A)");
      assert.equal(Lines[3], "MAP src/b.ts (module)");
      assert.equal(Lines[4], "FOCUS File:src/b.ts (1-4, fp-File:src/, v1)");
      assert.equal(Lines[5], "NEIGHBORS File:src/b.ts -contains-> Symbol:b");
      assert.equal(Lines[6], "EVIDENCE src/b.ts:1-4");
      assert.equal(Lines[7], "OPEN references edges are deferred to W2+ - call/reference counts are unavailable");
      assert.equal(Lines[8], "OPEN calls edges are deferred to W2+ - call ranking is unavailable");
      assert.equal(Lines[9], "OPEN tests edges are deferred to W2+ - test coverage ranking is unavailable");
    });
    CheckAsync(Count, "T5: the imports edge outranks contains in the neighbor ranking", async () => {
      const Result = await Context.execute({ id: "File:src/a.ts" }, {});
      const Neighbors = Result.packet.neighbors;
      assert.deepEqual(Neighbors, [
        "File:src/a.ts -imports-> File:src/b.ts",
        "File:src/a.ts -contains-> Symbol:a"
      ]);
    });
    CheckAsync(Count, "T5: a stale caller version sets the STALE line and the packet field", async () => {
      const Result = await Context.execute({ id: "File:src/b.ts", version: "rev-0" }, {});
      assert.equal(Result.packet.stale, "rev-0");
      assert.ok(Result.text.includes("STALE rev-0"));
    });
    CheckAsync(Count, "T5: the packet ledger line is byte-exact and LastPacketTokens is stamped", async () => {
      const Result = await Context.execute({ id: "File:src/b.ts" }, {});
      assert.ok(
        Run.Lines.includes(
          `plugin-dsh-workspace: workspace: packet File:src/b.ts (${Result.tokens} tokens, budget 2000)`
        )
      );
      assert.equal(Run.State.LastPacketTokens, Result.tokens);
      assert.equal(Result.tokens, Math.ceil(Result.text.length / 4));
    });
    CheckAsync(Count, "T5: a small budget truncates the text honestly and marks truncated", async () => {
      const Result = await Context.execute({ id: "File:src/b.ts", budget: 10 }, {});
      assert.equal(Result.budget, 10);
      assert.equal(Result.truncated, true);
      assert.equal(Result.text.length, 40);
      assert.ok(Result.text.length < Result.tokens * 4);
    });
  }
  {
    const Run = Setup();
    CheckAsync(Count, "T6: executing all four tools never touches the fs seam", async () => {
      await Tool(Run, "workspace_map").execute({}, {});
      await Tool(Run, "workspace_find").execute({ pattern: "src/*.ts" }, {});
      await Tool(Run, "workspace_expand").execute({ id: "File:src/a.ts" }, {});
      await Tool(Run, "workspace_context").execute({ id: "File:src/b.ts" }, {});
      assert.deepEqual(Run.Fs.resolves, []);
      assert.deepEqual(Run.Fs.stats, []);
      assert.deepEqual(Run.Fs.reads, []);
      assert.deepEqual(Run.Fs.writes, []);
    });
  }
  return Finish(Count, "Tools-And-Packet");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Tools-And-Packet`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
