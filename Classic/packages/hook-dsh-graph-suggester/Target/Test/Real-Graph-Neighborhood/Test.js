import assert from "node:assert/strict";
import {
  Call,
  Check,
  Finish,
  LinesWith,
  MakeCounter,
  RealGraph,
  Setup
} from "../Harness.js";
const CORE = "export function core(): number {\n	return 1;\n}\n";
const USE = 'import { core } from "./Core.ts";\n\nexport const used = core;\n';
const TEST_FILE = 'import { core } from "./Core.ts";\n\nexport const suite = core;\n';
const MARKDOWN = "# The workspace\n\nText.\n";
const FILES = {
  "/ws/Source/Core.ts": CORE,
  "/ws/Source/Use.ts": USE,
  "/ws/Source/Core.test.ts": TEST_FILE,
  "/ws/README.md": MARKDOWN
};
const ARGS = {
  file_path: "/ws/Source/Core.ts",
  pattern: "export function",
  glob: "**/*.ts"
};
const runTest = async () => {
  const Count = MakeCounter();
  const Graph = RealGraph(FILES);
  const Summary = await Graph.indexWorkspace("/ws");
  const Run = Setup({}, (Context) => {
    Context.workspaceGraph = Graph;
  });
  const Result = await Call(Run, "read", ARGS);
  {
    Check(Count, "G1: the real graph yielded the neighborhood component", () => {
      assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
      assert.deepEqual(
        Graph.neighborhood("/ws/Source/Core.ts").map((Entry) => `${Entry.path} ${Entry.role}`),
        [
          "/ws/Source/Core.ts definition",
          "/ws/Source/Core.test.ts test",
          "/ws/Source/Use.ts importer"
        ]
      );
    });
    Check(Count, "G1: the suggest line is byte-exact and the graph answered", () => {
      assert.deepEqual(LinesWith(Run, "candidates call"), [
        "graph-suggester: suggest Neighborhood 0.87 2 candidates call read"
      ]);
      assert.equal(LinesWith(Run, "graph unavailable").length, 0);
      assert.equal(LinesWith(Run, "abstained").length, 0);
    });
    Check(Count, "G1: the note carries the real candidate paths and reasons", () => {
      assert.ok(Array.isArray(Result.additionalContexts));
      assert.equal(Result.additionalContexts.length, 1);
      assert.equal(
        Result.additionalContexts[0].content[0].text,
        "[graph-suggester] intent=Neighborhood confidence=0.87\ntargets (2):\n- /ws/Source/Core.test.ts - the tests\n- /ws/Source/Use.ts - the importers\nnote: the files around this one: importers, dependencies, tests, doc block."
      );
      assert.equal(Result.kind, "allow");
    });
    Check(Count, "G1: the candidates are the graph's own entries minus the anchor", () => {
      const Paths = Result.additionalContexts[0].content[0].text.split("\n").filter((Line) => Line.startsWith("- ")).map((Line) => Line.slice(2).split(" - ")[0]);
      assert.deepEqual(
        Paths,
        Graph.neighborhood("/ws/Source/Core.ts").map((Entry) => Entry.path).filter((Path) => Path !== "/ws/Source/Core.ts")
      );
    });
  }
  {
    const Unknown = Setup({}, (Context) => {
      Context.workspaceGraph = Graph;
    });
    await Call(Unknown, "read", { ...ARGS, file_path: "/ws/Source/Missing.ts" });
    Check(Count, "G2: an unknown anchor is an empty component, so the hook abstains honestly", () => {
      assert.deepEqual(Graph.neighborhood("/ws/Source/Missing.ts"), []);
      assert.deepEqual(LinesWith(Unknown, "candidates call"), []);
      assert.deepEqual(LinesWith(Unknown, "abstained"), [
        "graph-suggester: abstained no-companions Neighborhood 0.87"
      ]);
      assert.equal(LinesWith(Unknown, "graph unavailable").length, 0);
    });
  }
  {
    Check(Count, "G3: the suggester's fs capture records ZERO operations", () => {
      assert.equal(Run.Fs.reads.length, 0);
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.resolved.length, 0);
      assert.equal(Run.Fs.stats.length, 0);
    });
  }
  {
    const Alone = Setup({}, (Context) => {
      Context.workspaceGraph = Graph;
    });
    await Call(Alone, "read", { ...ARGS, file_path: "/ws/README.md" });
    Check(Count, "G4: an anchor-only component abstains no-companions", () => {
      assert.deepEqual(
        Graph.neighborhood("/ws/README.md").map((Entry) => Entry.path),
        ["/ws/README.md"]
      );
      assert.deepEqual(LinesWith(Alone, "candidates call"), []);
      assert.deepEqual(LinesWith(Alone, "abstained"), [
        "graph-suggester: abstained no-companions Neighborhood 0.87"
      ]);
      assert.equal(LinesWith(Alone, "graph unavailable").length, 0);
    });
    Check(Count, "G4: the note of the real component never names the anchor", () => {
      assert.equal(
        Result.additionalContexts[0].content[0].text.includes("/ws/Source/Core.ts"),
        false
      );
    });
  }
  return Finish(Count, "Real-Graph-Neighborhood");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Real-Graph-Neighborhood`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
