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
  RealGraph,
  Validate,
  rm
} from "../Harness.js";
const CORE = 'import { util } from "./util.ts";\n\nexport function core(): number {\n	return util;\n}\n';
const UTIL = "export const util = 1;\n";
const TEST_FILE = 'import { core } from "./core.ts";\n\nexport const suite = core;\n';
const MARKDOWN = "# The workspace\n\nIntro text.\n\n## Section\n";
const FILES = {
  "/ws/src/core.ts": CORE,
  "/ws/src/util.ts": UTIL,
  "/ws/src/core.test.ts": TEST_FILE,
  "/ws/README.md": MARKDOWN
};
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  const Graph = RealGraph(FILES);
  const Summary = await Graph.indexWorkspace("/ws");
  const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
    Context.workspaceGraph = Graph;
  });
  const Focus = Graph.getNode("File:/ws/src/core.ts");
  {
    const Packet = Run.Context.workspaceContext.packet({ id: "File:/ws/src/core.ts" });
    Check(Count, "C1: the real indexing trigger populated the graph the packet reads", () => {
      assert.deepEqual(Summary, { indexed: 4, skipped: 0, failed: 0, files: 4 });
      assert.equal(Graph.statistics().indexRevision, "4");
      assert.ok(Focus !== void 0);
    });
    Check(Count, "C1: the WORKSPACE and SCOPE lines carry the real revision and scope", () => {
      assert.equal(Packet.workspace, "WORKSPACE workspace @ 4");
      assert.equal(Packet.scope, "SCOPE File:/ws/src/core.ts");
    });
    Check(Count, "C1: the MAP band groups the real absolute paths by parent directory", () => {
      assert.deepEqual(Packet.map, ["/ws/src (3 files)", "/ws (1 files)"]);
    });
    Check(Count, "C1: the FOCUS line carries the real span, fingerprint prefix and version", () => {
      assert.equal(
        Packet.focus,
        `FOCUS File:/ws/src/core.ts span 1-5 fp ${Focus.fingerprint.slice(0, 12)} v v1`
      );
      assert.equal(Packet.nodeId, "File:/ws/src/core.ts");
      assert.equal(Packet.nodeVersion, "v1");
    });
    Check(Count, "C1: the NEIGHBORS band ranks the real edges (imports before contains)", () => {
      assert.deepEqual(Packet.neighbors, [
        "imports File:/ws/src/core.ts -> File:/ws/src/util.ts",
        "contains File:/ws/src/core.ts -> Block:/ws/src/core.ts:4:body",
        "contains File:/ws/src/core.ts -> Symbol:/ws/src/core.ts:core"
      ]);
    });
    Check(Count, "C1: the EVIDENCE band carries the real files and spans", () => {
      assert.deepEqual(Packet.evidence, ["/ws/src/core.ts 1-5", "/ws/src/util.ts -"]);
    });
    Check(Count, "C1: OPEN is (none) - the real graph answered, this is not the empty form", () => {
      assert.deepEqual(Packet.open, ["(none)"]);
      assert.equal(Packet.tokens, Math.ceil(Render(Packet).length / 4));
    });
  }
  {
    const Packet = Run.Context.workspaceContext.packet({
      id: "File:/ws/src/core.ts",
      caller: "real"
    });
    Check(Count, "C2: the packet line is byte-exact and the caller's focus is tracked", () => {
      assert.deepEqual(
        Run.Context.workspaceContext.focusOf("real"),
        { id: "File:/ws/src/core.ts", version: "v1" }
      );
      assert.ok(
        LinesWith(Run, `packet File:/ws/src/core.ts (${Packet.tokens} tok, lens code)`).length > 0
      );
      assert.ok(
        LedgerWith(`packet File:/ws/src/core.ts (${Packet.tokens} tok, lens code)`).length >= 1
      );
    });
  }
  {
    const Tool = Run.Tools[0];
    await CheckAsync(Count, "C3: the tool renders the real packet text", async () => {
      const Result = await Tool.execute({ id: "File:/ws/src/core.ts" });
      assert.equal(Result.text.startsWith("WORKSPACE workspace @ 4"), true);
      assert.equal(
        Result.text.includes(
          "\nNEIGHBORS\nimports File:/ws/src/core.ts -> File:/ws/src/util.ts"
        ),
        true
      );
      assert.equal(Result.text.includes("\nEVIDENCE\n/ws/src/core.ts 1-5"), true);
      assert.equal(Result.lens, "code");
      assert.equal(Result.stale, false);
    });
  }
  {
    Check(Count, "C4: the context plugin's fs records ZERO writes and reads", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.reads.length, 0);
    });
  }
  return Finish(Count, "Real-Graph-Packet");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Real-Graph-Packet`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
