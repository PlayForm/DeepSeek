import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Seed,
  Validate
} from "../Harness.js";
const CONTENT = [
  "const alpha = 1;",
  "function alphaBeta() { return alpha; }",
  "export const gamma = alphaBeta();"
].join("\n");
const Setup = (Config = {}, Files = {}) => {
  rm();
  return Make(
    Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" }, ...Config }),
    Seed({ "/repo/a.ts": CONTENT, ...Files })
  );
};
const SetupFailing = (FailMessage) => {
  rm();
  return Make(
    Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" } }),
    (_Context, Run) => {
      Run.Fs.files = { "/repo/a.ts": CONTENT };
      Run.Fs.FailWrites = FailMessage;
    }
  );
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Reply = await Run.Context.workspaceReflect.rename({
      kind: "rename",
      path: "/repo/a.ts",
      startLine: 1,
      endLine: 2,
      oldName: "alpha",
      newName: "delta"
    });
    Check(Count, "R1: the block-scope rename applies only inside the span", () => {
      assert.equal(Reply.status, "applied");
      assert.equal(Reply.version, "2");
      assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[0], "const delta = 1;");
      assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[2], "export const gamma = alphaBeta();");
    });
    Check(Count, "R1: the rename ledger line is byte-exact (logger and durable file)", () => {
      assert.deepEqual(LinesWith(Run, "rename /repo/a.ts"), [
        "reflect: rename /repo/a.ts alpha -> delta (applied)"
      ]);
      assert.equal(LedgerWith("rename /repo/a.ts alpha -> delta (applied)").length, 1);
      assert.equal(LinesWith(Run, "conflict").length, 0);
    });
  }
  {
    const Run = Setup();
    const Reply = await Run.Context.workspaceReflect.rename({
      kind: "rename",
      path: "/repo/a.ts",
      startLine: 1,
      endLine: 1,
      oldName: "alpha",
      newName: "delta",
      scope: "file"
    });
    Check(Count, "R2: the file scope renames every whole-word occurrence", () => {
      assert.equal(Reply.status, "applied");
      assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[0], "const delta = 1;");
      assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[1], "function alphaBeta() { return delta; }");
      assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[2], "export const gamma = alphaBeta();");
    });
    Check(Count, "R2: whole-word only - alphaBeta is never touched", () => {
      assert.ok(!Run.Fs.files["/repo/a.ts"].includes("deltaBeta"));
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceReflect;
    await CheckAsync(Count, "R3: zero occurrences is a rejected reply, never an applied write", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: "/repo/a.ts",
        startLine: 1,
        endLine: 1,
        oldName: "omega",
        newName: "delta"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "no occurrences in scope");
      assert.equal(Run.Fs.writes.length, 0);
    });
    await CheckAsync(Count, "R3: a no-op rename is rejected", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: "/repo/a.ts",
        startLine: 1,
        endLine: 1,
        oldName: "alpha",
        newName: "alpha"
      });
      assert.equal(Reply.detail, "rename is a no-op");
    });
    await CheckAsync(Count, "R3: an incomplete identity is rejected", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: "",
        startLine: 1,
        endLine: 1,
        oldName: "alpha",
        newName: "delta"
      });
      assert.equal(Reply.detail, "rename identity incomplete");
    });
    await CheckAsync(Count, "R3: a non-integral span is rejected", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: "/repo/a.ts",
        startLine: 1.5,
        endLine: 2,
        oldName: "alpha",
        newName: "delta"
      });
      assert.equal(Reply.detail, "span is not integral");
    });
    await CheckAsync(Count, "R3: a missing file is rejected, never a fabricated read", async () => {
      const Reply = await Service.rename({
        kind: "rename",
        path: "/repo/none.ts",
        startLine: 1,
        endLine: 1,
        oldName: "alpha",
        newName: "delta"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "not an observed file");
    });
  }
  {
    const Run = Setup({ maxFileBytes: 10 });
    await CheckAsync(Count, "R4: a file larger than maxFileBytes is rejected", async () => {
      const Reply = await Run.Context.workspaceReflect.rename({
        kind: "rename",
        path: "/repo/a.ts",
        startLine: 1,
        endLine: 1,
        oldName: "alpha",
        newName: "delta"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "file too large");
      assert.equal(Run.Fs.reads.length, 0);
    });
    const Run2 = Setup({ maxBlockLines: 2 });
    await CheckAsync(Count, "R4: a rename span wider than maxBlockLines is rejected", async () => {
      const Reply = await Run2.Context.workspaceReflect.rename({
        kind: "rename",
        path: "/repo/a.ts",
        startLine: 1,
        endLine: 3,
        oldName: "alpha",
        newName: "delta"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "span too large");
      assert.equal(Run2.Fs.writes.length, 0);
    });
  }
  {
    const Run = Setup();
    const Reply = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: "/repo/a.ts",
      startLine: 2,
      endLine: 2,
      text: "function delta() { return 42; }"
    });
    Check(Count, "P1: the replace swaps the span's lines exactly", () => {
      assert.equal(Reply.status, "applied");
      assert.deepEqual(Run.Fs.files["/repo/a.ts"].split("\n"), [
        "const alpha = 1;",
        "function delta() { return 42; }",
        "export const gamma = alphaBeta();"
      ]);
    });
    Check(Count, "P1: the replace ledger line is byte-exact", () => {
      assert.ok(LinesWith(Run, "replace /repo/a.ts lines 2-2").includes("reflect: replace /repo/a.ts lines 2-2 (applied)"));
    });
    const Reply2 = await Run.Context.workspaceReflect.replace({
      kind: "replace",
      path: "/repo/a.ts",
      startLine: 1,
      endLine: 1,
      text: ""
    });
    Check(Count, "P1: an empty text deletes the span", () => {
      assert.equal(Reply2.status, "applied");
      assert.equal(Run.Fs.files["/repo/a.ts"].split("\n")[0], "function delta() { return 42; }");
    });
  }
  {
    const Run = Setup();
    await CheckAsync(Count, "P2: a span outside the file is rejected", async () => {
      const Reply = await Run.Context.workspaceReflect.replace({
        kind: "replace",
        path: "/repo/a.ts",
        startLine: 1,
        endLine: 9,
        text: "x"
      });
      assert.equal(Reply.status, "rejected");
      assert.equal(Reply.detail, "span is outside the file");
    });
    const Run2 = Setup({ maxBlockLines: 1 });
    await CheckAsync(Count, "P2: a replace span wider than maxBlockLines is rejected", async () => {
      const Reply = await Run2.Context.workspaceReflect.replace({
        kind: "replace",
        path: "/repo/a.ts",
        startLine: 1,
        endLine: 2,
        text: "x"
      });
      assert.equal(Reply.detail, "span too large");
      assert.equal(Run2.Fs.writes.length, 0);
    });
  }
  {
    const Run = Setup();
    Run.Fs.versions["/repo/a.ts"] = "7";
    Run.Fs.WriteVersionOverride = "8";
    const Reply = await Run.Context.workspaceReflect.rename({
      kind: "rename",
      path: "/repo/a.ts",
      startLine: 1,
      endLine: 1,
      oldName: "alpha",
      newName: "delta"
    });
    Check(Count, "X1: a file that moved under the op yields a conflict, never an overwrite", () => {
      assert.equal(Reply.status, "conflict");
      assert.ok(Reply.detail.includes("version"));
      assert.equal(Run.Fs.files["/repo/a.ts"], CONTENT);
      assert.deepEqual(LinesWith(Run, "conflict /repo/a.ts"), [
        "reflect: conflict /repo/a.ts (expected 7)"
      ]);
    });
  }
  {
    const Run = SetupFailing("raid array on fire");
    const Reply = await Run.Context.workspaceReflect.rename({
      kind: "rename",
      path: "/repo/a.ts",
      startLine: 1,
      endLine: 1,
      oldName: "alpha",
      newName: "delta"
    });
    Check(Count, "X2: an unclassifiable write failure maps to outcome-unknown", () => {
      assert.equal(Reply.status, "outcome-unknown");
      assert.equal(Reply.detail, "raid array on fire");
      assert.equal(Reply.version, void 0);
      assert.deepEqual(LinesWith(Run, "failed /repo/a.ts"), [
        "reflect: failed /repo/a.ts (raid array on fire)"
      ]);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger }), Seed({ "/repo/a.ts": CONTENT }));
    const Reply = await Run.Context.workspaceReflect.rename({
      kind: "rename",
      path: "/repo/a.ts",
      startLine: 1,
      endLine: 1,
      oldName: "alpha",
      newName: "delta"
    });
    Check(Count, "X3: a disabled plugin answers denied, never a write", () => {
      assert.equal(Reply.status, "denied");
      assert.equal(Reply.detail, "enabled=false");
      assert.equal(Run.Fs.writes.length, 0);
      assert.deepEqual(LinesWith(Run, "denied"), ["reflect: denied (enabled=false)"]);
    });
  }
  return Finish(Count, "Rename-And-Replace");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Rename-And-Replace`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
