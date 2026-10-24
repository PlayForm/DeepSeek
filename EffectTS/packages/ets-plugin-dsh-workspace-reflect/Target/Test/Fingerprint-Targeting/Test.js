import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Graph,
  Ledger,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Seed,
  Validate
} from "../Harness.js";
import Semantics from "../../../../ets-plugin-dsh-workspace-semantics/Target/Library.js";
import GraphFingerprint from "../../../../ets-plugin-dsh-workspace-graph/Target/Function/Fingerprint.js";
const CONTENT = [
  "const alpha = 1;",
  "function beta() {",
  "	return alpha;",
  "}"
].join("\n");
const PATH = "/repo/a.ts";
const BLOCK = `Block:${PATH}:3:body`;
const FINGERPRINT = GraphFingerprint(CONTENT.split("\n").slice(2, 4).join("\n"), "Block");
const NODES = {
  [BLOCK]: {
    id: BLOCK,
    kind: "Block",
    path: PATH,
    span: { startLine: 3, endLine: 4 },
    fingerprint: FINGERPRINT
  }
};
const Definition = (Raw) => Semantics.Config({ ...Raw });
const Setup = (Config = {}, Files = { [PATH]: CONTENT }, Attach) => {
  rm();
  return Make(
    Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" }, ...Config }),
    (Context, Run) => {
      Seed(Files)(Context, Run);
      Attach?.(Context, Run);
    }
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Calls = [];
    const Run = Setup({}, { [PATH]: CONTENT }, (Context) => {
      Context.workspaceGraph = Graph(Calls, void 0, NODES);
    });
    const Reply = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: PATH,
      node: BLOCK,
      fingerprint: FINGERPRINT,
      text: "	return alpha + 1;\n}"
    });
    Check(Count, "F1: the graph's node span is the span that is rewritten", () => {
      assert.equal(Reply.status, "applied");
      assert.deepEqual(Run.Fs.files[PATH].split("\n"), [
        "const alpha = 1;",
        "function beta() {",
        "	return alpha + 1;",
        "}"
      ]);
    });
    Check(Count, "F1: the ledger names the NODE's span, not a request span", () => {
      assert.deepEqual(LinesWith(Run, "replace /repo/a.ts"), [
        "reflect: replace /repo/a.ts lines 3-4 (applied)"
      ]);
    });
    Check(Count, "F1: the applied write is carried to the graph", () => {
      assert.deepEqual(Calls, [PATH]);
      assert.deepEqual(LinesWith(Run, "carried"), [
        `reflect: carried ${PATH} (graph reindexed)`
      ]);
    });
  }
  {
    const Run = Setup({}, { [PATH]: CONTENT }, (Context) => {
      Context.workspaceGraph = Graph([], void 0, NODES);
    });
    const Stale = GraphFingerprint("	return omega;", "Block");
    const Reply = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: PATH,
      node: BLOCK,
      fingerprint: Stale,
      text: "gone"
    });
    Check(Count, "F2: a fingerprint mismatch is a rejected reply", () => {
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "fingerprint mismatch");
    });
    Check(Count, "F2: the mismatch refuses byte-exactly and writes nothing", () => {
      assert.equal(Run.Fs.writes.length, 0);
      assert.equal(Run.Fs.files[PATH], CONTENT);
      assert.deepEqual(LinesWith(Run, "fingerprint mismatch"), [
        `reflect: rejected ${PATH} (fingerprint mismatch)`
      ]);
    });
  }
  {
    const Run = Setup();
    const Textual = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: PATH,
      startLine: 3,
      endLine: 3,
      text: "	return alpha + 2;"
    });
    Check(Count, "F3: without a node target the textual span engine still applies", () => {
      assert.equal(Textual.status, "applied");
      assert.equal(Run.Fs.files[PATH].split("\n")[2], "	return alpha + 2;");
      assert.deepEqual(LinesWith(Run, "replace /repo/a.ts"), [
        "reflect: replace /repo/a.ts lines 3-3 (applied)"
      ]);
    });
    const Fallback = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: PATH,
      startLine: 1,
      endLine: 1,
      node: `Symbol:${PATH}:alpha`,
      fingerprint: GraphFingerprint("const alpha = 1;", "Symbol", "alpha"),
      text: "const alpha = 9;"
    });
    Check(Count, "F3: with no graph the explicit span is the fallback and is verified", () => {
      assert.equal(Fallback.status, "applied");
      assert.equal(Run.Fs.files[PATH].split("\n")[0], "const alpha = 9;");
      assert.deepEqual(LinesWith(Run, "replace /repo/a.ts lines 1-1"), [
        "reflect: replace /repo/a.ts lines 1-1 (applied)"
      ]);
    });
    const Absent = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: PATH,
      node: BLOCK,
      fingerprint: FINGERPRINT,
      text: "gone"
    });
    Check(Count, "F3: a node target with no graph and no span refuses byte-exactly", () => {
      assert.equal(Absent.status, "rejected");
      assert.equal(Absent.detail, "graph absent");
      assert.deepEqual(LinesWith(Run, "graph absent"), [
        `reflect: rejected ${PATH} (graph absent)`
      ]);
    });
    const Wrong = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: PATH,
      startLine: 3,
      endLine: 4,
      node: BLOCK,
      fingerprint: "not-the-fingerprint",
      text: "gone"
    });
    Check(Count, "F3: the fallback verifies the fingerprint too", () => {
      assert.equal(Wrong.status, "rejected");
      assert.equal(Wrong.detail, "fingerprint mismatch");
    });
  }
  {
    const Run = Setup({}, { [PATH]: CONTENT, "/repo/other.ts": CONTENT }, (Context) => {
      Context.workspaceGraph = Graph([], void 0, NODES);
    });
    const Service = Run.Context.workspaceReflect;
    await CheckAsync(Count, "F4: a node target without a fingerprint refuses", async () => {
      const Reply = await Service.replace({ kind: "replace", path: PATH, node: BLOCK, text: "x" });
      assert.equal(Reply.detail, "fingerprint required for a node target");
    });
    await CheckAsync(Count, "F4: a fingerprint without a node target refuses", async () => {
      const Reply = await Service.replace({
        kind: "replace",
        path: PATH,
        startLine: 1,
        endLine: 1,
        fingerprint: FINGERPRINT,
        text: "x"
      });
      assert.equal(Reply.detail, "fingerprint without a node target");
    });
    await CheckAsync(Count, "F4: a node id for another path refuses byte-exactly", async () => {
      const Reply = await Service.replace({
        kind: "replace",
        path: "/repo/other.ts",
        node: BLOCK,
        fingerprint: FINGERPRINT,
        text: "x"
      });
      assert.equal(Reply.detail, "node path mismatch");
      assert.deepEqual(LinesWith(Run, "node path mismatch"), [
        "reflect: rejected /repo/other.ts (node path mismatch)"
      ]);
    });
    await CheckAsync(Count, "F4: a File-kind node id is not targetable", async () => {
      const Reply = await Service.replace({
        kind: "replace",
        path: PATH,
        startLine: 1,
        endLine: 1,
        node: `File:${PATH}`,
        fingerprint: FINGERPRINT,
        text: "x"
      });
      assert.equal(Reply.detail, "node not targetable");
    });
    await CheckAsync(Count, "F4: a node the graph does not know refuses", async () => {
      const Reply = await Service.replace({
        kind: "replace",
        path: PATH,
        node: `Symbol:${PATH}:unknown`,
        fingerprint: FINGERPRINT,
        text: "x"
      });
      assert.equal(Reply.detail, "node not found");
    });
  }
  {
    const Run = Setup({}, { [PATH]: CONTENT }, (Context) => {
      Semantics.apply(Context, Definition({ enabled: true, log: false }));
    });
    const Service = Run.Context.workspaceReflect;
    await CheckAsync(Count, "F5: the semantics plan is filtered to the block scope", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: PATH,
        startLine: 3,
        endLine: 4,
        oldName: "alpha",
        newName: "delta"
      });
      assert.equal(Reply.status, "applied");
      assert.deepEqual(Run.Fs.files[PATH].split("\n"), [
        "const alpha = 1;",
        "function beta() {",
        "	return delta;",
        "}"
      ]);
    });
    await CheckAsync(Count, "F5: the deepened and rename lines are byte-exact", async () => {
      assert.deepEqual(LinesWith(Run, "deepened"), [
        `reflect: deepened ${PATH} (1 edits via semantics)`
      ]);
      assert.deepEqual(LinesWith(Run, "rename /repo/a.ts"), [
        `reflect: rename ${PATH} alpha -> delta (applied)`
      ]);
      assert.equal(
        Run.Lines.some((Line) => Line.startsWith("semantics: planned rename alpha -> delta")),
        true,
        "the real service produced the plan"
      );
    });
    await CheckAsync(Count, "F5: the file scope takes every plan edit", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: PATH,
        startLine: 1,
        endLine: 1,
        oldName: "alpha",
        newName: "omega",
        scope: "file"
      });
      assert.equal(Reply.status, "applied");
      assert.deepEqual(Run.Fs.files[PATH].split("\n"), [
        "const omega = 1;",
        "function beta() {",
        "	return delta;",
        "}"
      ]);
      assert.equal(LinesWith(Run, "deepened").length, 2);
    });
    await CheckAsync(Count, "F5: an identifier outside the scope falls back to the refusal", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: PATH,
        startLine: 3,
        endLine: 4,
        oldName: "missing",
        newName: "delta"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "no occurrences in scope");
      assert.deepEqual(LinesWith(Run, "no occurrences in scope"), [
        `reflect: rejected ${PATH} (no occurrences in scope)`
      ]);
    });
  }
  return Finish(Count, "Fingerprint-Targeting");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Fingerprint-Targeting`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
