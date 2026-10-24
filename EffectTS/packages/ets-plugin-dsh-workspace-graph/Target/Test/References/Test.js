import assert from "node:assert/strict";
import { Check, Finish, GraphClass, LinesWith, MakeCounter, MakeDisk, Tree } from "../Harness.js";
import Semantics from "../../../../ets-plugin-dsh-workspace-semantics/Target/Library.js";
const CORE = [
  "export const config = { port: 1 };",
  "",
  "export function core(): number {",
  "	return config.port;",
  "}",
  "",
  "config.port;",
  ""
].join("\n");
const LIB = "export const helper = 1;\n";
const DOC = "# The workspace\n\nSee [the helper](./helper.md).\n";
const Definition = (Raw) => Semantics.Config({ ...Raw });
const Mount = (Run, Config = {}) => {
  Semantics.apply(
    Run.Context,
    Definition({ enabled: true, log: false, ...Config })
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  const Fixture = Tree({ "src/core.ts": CORE, "src/lib.ts": LIB, "README.md": DOC });
  const Root = Fixture.root;
  const CorePath = `${Root}/src/core.ts`;
  const DocPath = `${Root}/README.md`;
  {
    const Run = MakeDisk(Root, { enabled: true });
    Mount(Run);
    await Run.Graph.indexWorkspace(Root);
    const Snapshot = Run.Graph.snapshot();
    Check(Count, "R1: the service is probed through ctx.get, never injected", () => {
      assert.deepEqual(GraphClass.inject, ["fs", "storage"]);
      assert.ok(Run.Context.get("workspaceSemantics") !== void 0);
      assert.ok(
        Run.loggerLines.some((Line) => Line === `semantics: resolved ${CorePath} (2 symbols, 2 references)`),
        JSON.stringify(LinesWith(Run, "semantics: resolved"))
      );
    });
    Check(Count, "R1: the real index produces honest references edges", () => {
      assert.deepEqual(
        Snapshot.edges.filter((Edge) => Edge.kind === "references").map((Edge) => [Edge.from, Edge.to, Edge.span.startLine, Edge.span.endLine]),
        [
          [`Symbol:${CorePath}:core`, `Symbol:${CorePath}:config`, 4, 4],
          [`File:${CorePath}`, `Symbol:${CorePath}:config`, 7, 7]
        ]
      );
    });
    Check(Count, "R1: the indexed line and the snapshot count the references edges", () => {
      const Indexed = LinesWith(Run, `indexed ${CorePath}`);
      assert.equal(Indexed.length, 1);
      assert.match(Indexed[0], /\(4 nodes, 5 edges\)$/);
      assert.equal(Snapshot.nodes.length, 8);
      assert.equal(Snapshot.edges.length, 7);
    });
    Check(Count, "R1: expand follows a references edge from the using symbol", () => {
      const Expansion = Run.Graph.expand(`Symbol:${CorePath}:core`);
      assert.ok(
        Expansion.edges.some(
          (Edge) => Edge.kind === "references" && Edge.to === `Symbol:${CorePath}:config`
        )
      );
      assert.deepEqual(
        Expansion.nodes.map((Node) => Node.id),
        [`Symbol:${CorePath}:core`, `Symbol:${CorePath}:config`]
      );
    });
  }
  {
    const Run = MakeDisk(Root, { enabled: true });
    await Run.Graph.indexWorkspace(Root);
    const Snapshot = Run.Graph.snapshot();
    Check(Count, "R2: without the service there are NO references edges (never faked)", () => {
      assert.equal(Snapshot.edges.filter((Edge) => Edge.kind === "references").length, 0);
      assert.equal(Snapshot.edges.length, 5, "the three core contains edges plus lib and the doc");
    });
    Check(Count, "R2: the indexed line counts only the parsed edges", () => {
      const Indexed = LinesWith(Run, `indexed ${CorePath}`);
      assert.equal(Indexed.length, 1);
      assert.match(Indexed[0], /\(4 nodes, 3 edges\)$/);
      assert.deepEqual(LinesWith(Run, "semantics:"), []);
    });
  }
  {
    const Run = MakeDisk(Root, { enabled: true });
    Mount(Run, { enabled: false });
    await Run.Graph.indexFile(CorePath);
    Check(Count, "R3: a disabled service answers undefined and adds no edge", () => {
      assert.equal(
        Run.Graph.snapshot().edges.filter((Edge) => Edge.kind === "references").length,
        0
      );
      assert.ok(Run.loggerLines.includes("semantics: disabled (enabled=false)"));
    });
    Check(Count, "R3: the record keeps its parsed edge count", () => {
      const Indexed = LinesWith(Run, `indexed ${CorePath}`);
      assert.match(Indexed[0], /\(4 nodes, 3 edges\)$/);
    });
  }
  {
    const Run = MakeDisk(Root, { enabled: true });
    Mount(Run, { adapters: ["markdown"] });
    await Run.Graph.indexFile(DocPath);
    Check(Count, "R4: a resolved markdown reference with no Symbol node adds no edge", () => {
      assert.equal(
        Run.Graph.snapshot().edges.filter((Edge) => Edge.kind === "references").length,
        0
      );
      assert.ok(
        Run.loggerLines.includes(
          `semantics: resolved ${DocPath} (1 symbols, 1 references)`
        ),
        JSON.stringify(LinesWith(Run, "semantics: resolved"))
      );
    });
  }
  {
    const Run = MakeDisk(Root, { enabled: true });
    const At = CORE.lastIndexOf("config.port");
    Run.Context.semantics = {
      resolve: async () => ({
        references: [{ target: "config.port", span: { start: At, end: At + 11 } }]
      })
    };
    await Run.Graph.indexFile(CorePath);
    Check(Count, "R5: a service registered under the `semantics` alias is probed too", () => {
      assert.deepEqual(
        Run.Graph.snapshot().edges.filter((Edge) => Edge.kind === "references").map((Edge) => [Edge.from, Edge.to, Edge.span.startLine]),
        [[`File:${CorePath}`, `Symbol:${CorePath}:config`, 7]]
      );
    });
  }
  return Finish(Count, "References");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - References`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
