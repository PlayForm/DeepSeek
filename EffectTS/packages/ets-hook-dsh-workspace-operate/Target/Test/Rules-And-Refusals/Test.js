import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  FileNode,
  FakeGraph,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  Plugin,
  SymbolNode,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}, Graph) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }), Graph);
};
const DefaultGraph = (Edges = [], ExtraNodes = []) => FakeGraph(
  [
    SymbolNode("Alpha", "/repo/src/a.ts", "sym-alpha"),
    FileNode("/repo/src/a.ts", "file-a"),
    FileNode("/repo/src/b.ts", "file-b"),
    ...ExtraNodes
  ],
  Edges
);
const runTest = async () => {
  const Count = MakeCounter();
  {
    Check(Count, "G1: the default object carries exactly name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "hook-dsh-workspace-operate");
      assert.equal(typeof Plugin.apply, "function");
      assert.equal(typeof Plugin.Config, "function");
      assert.deepEqual(Plugin.inject, ["pluginFactory", "fs"]);
      assert.deepEqual(Object.keys(Plugin), ["name", "apply", "Config", "inject"]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "G2: apply returns NOTHING and exposes the state probe", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.Module, "operate");
      assert.equal(Run.State.DomainName, "workspace_operate");
    });
    Check(Count, "G2: the workspaceOperate service is registered from apply", () => {
      assert.ok(Run.Provided["workspaceOperate"] !== void 0);
      assert.ok(Run.Context.workspaceOperate !== void 0);
      assert.equal(typeof Run.Context.workspaceOperate.proposeRename, "function");
      assert.equal(typeof Run.Context.workspaceOperate.proposeConnect, "function");
      assert.equal(typeof Run.Context.workspaceOperate.proposeReplace, "function");
    });
    Check(Count, "G2: the fs/observed fence tracker is registered on the ROOT only", () => {
      assert.deepEqual(Run.RootNames, ["fs/observed"]);
    });
    Check(Count, "G2: the activation line is byte-exact (logger and durable file)", () => {
      assert.deepEqual(Run.Lines, ["operate: activated (domain=workspace_operate)"]);
      assert.equal(LedgerWith("activated (domain=workspace_operate)").length, 1);
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "G3: a disabled mount wires NOTHING and logs the honest line", () => {
      assert.deepEqual(Run.RootNames, []);
      assert.deepEqual(Run.Lines, ["operate: disabled (enabled=false)"]);
      assert.ok(Run.Provided["workspaceOperate"] !== void 0);
    });
  }
  {
    Check(Count, "G4: an empty domain fails loud with the module-prefixed error", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
        /operate: domain must be a non-empty string/
      );
    });
    Check(Count, "G4: a zero maxProposals fails loud", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, maxProposals: 0 })),
        /operate: maxProposals must be an integer >= 1/
      );
    });
  }
  {
    const Run = Setup({}, DefaultGraph());
    const Service = Run.Context.workspaceOperate;
    await CheckAsync(Count, "P1: a rename proposal is recorded with the byte-exact line", async () => {
      const Outcome = await Service.proposeRename({
        path: "/repo/src/a.ts",
        name: "Alpha",
        to: "Beta",
        version: "v1"
      });
      assert.equal(Outcome.status, "proposed");
      assert.deepEqual(
        ((proposal) => [
          proposal.id,
          proposal.kind,
          proposal.path,
          proposal.version,
          proposal.sequence,
          proposal.name,
          proposal.to
        ])(Outcome.proposal),
        ["rename-1", "rename", "/repo/src/a.ts", "v1", 1, "Alpha", "Beta"]
      );
      assert.deepEqual(LinesWith(Run, "proposed"), [
        "operate: proposed rename-1 rename /repo/src/a.ts"
      ]);
      assert.equal(LedgerWith("proposed rename-1 rename /repo/src/a.ts").length, 1);
    });
    await CheckAsync(Count, "P1: a connect proposal is recorded with the byte-exact line", async () => {
      const Outcome = await Service.proposeConnect({
        from: { path: "/repo/src/a.ts" },
        target: { path: "/repo/src/b.ts" },
        edge: "imports",
        version: "v1"
      });
      assert.equal(Outcome.status, "proposed");
      assert.equal(Outcome.proposal.id, "connect-2");
      assert.deepEqual(LinesWith(Run, "proposed"), [
        "operate: proposed rename-1 rename /repo/src/a.ts",
        "operate: proposed connect-2 connect /repo/src/a.ts"
      ]);
    });
    await CheckAsync(Count, "P1: a replace proposal is recorded with the byte-exact line", async () => {
      const Outcome = await Service.proposeReplace({
        path: "/repo/src/b.ts",
        span: { startLine: 1, endLine: 2 },
        content: "replaced",
        version: "v1"
      });
      assert.equal(Outcome.status, "proposed");
      assert.equal(Outcome.proposal.id, "replace-3");
      assert.deepEqual(Outcome.proposal.span, { startLine: 1, endLine: 2 });
      assert.deepEqual(LinesWith(Run, "proposed replace-3"), [
        "operate: proposed replace-3 replace /repo/src/b.ts"
      ]);
    });
  }
  {
    const Run = Setup({}, DefaultGraph());
    const Service = Run.Context.workspaceOperate;
    await CheckAsync(Count, "P2: a malformed rename is refused bad-request", async () => {
      const Outcome = await Service.proposeRename({ path: "/repo/src/a.ts" });
      assert.deepEqual(Outcome, {
        status: "refused",
        refusal: {
          kind: "rename",
          reason: "bad-request",
          detail: "rename needs path, name and to"
        }
      });
      assert.deepEqual(LinesWith(Run, "refused"), [
        "operate: refused rename bad-request"
      ]);
    });
    await CheckAsync(Count, "P2: a proposal without a fence is refused missing-version", async () => {
      const Outcome = await Service.proposeRename({
        path: "/repo/src/a.ts",
        name: "Alpha",
        to: "Beta"
      });
      assert.deepEqual(Outcome.refusal, {
        kind: "rename",
        reason: "missing-version",
        detail: "no version fence for /repo/src/a.ts"
      });
    });
    await CheckAsync(Count, "P2: a rename without the graph is refused graph-unavailable", async () => {
      const NoGraph = Setup();
      const Outcome = await NoGraph.Context.workspaceOperate.proposeRename({
        path: "/repo/src/a.ts",
        name: "Alpha",
        to: "Beta",
        version: "v1"
      });
      assert.deepEqual(Outcome.refusal, {
        kind: "rename",
        reason: "graph-unavailable",
        detail: "workspaceGraph is not mounted"
      });
      assert.deepEqual(LinesWith(NoGraph, "refused rename graph-unavailable"), [
        "operate: refused rename graph-unavailable"
      ]);
    });
    await CheckAsync(Count, "P2: an unknown symbol is refused, never guessed", async () => {
      const Outcome = await Service.proposeRename({
        path: "/repo/src/a.ts",
        name: "Gamma",
        to: "Beta",
        version: "v1"
      });
      assert.equal(Outcome.refusal.reason, "unknown-symbol");
      assert.equal(
        Outcome.refusal.detail,
        "symbol Gamma is not in the graph for /repo/src/a.ts"
      );
    });
    await CheckAsync(Count, "P2: a name collision is refused", async () => {
      const Run2 = Setup(
        {},
        DefaultGraph([], [SymbolNode("Beta", "/repo/src/a.ts", "sym-beta")])
      );
      const Outcome = await Run2.Context.workspaceOperate.proposeRename({
        path: "/repo/src/a.ts",
        name: "Alpha",
        to: "Beta",
        version: "v1"
      });
      assert.equal(Outcome.refusal.reason, "name-collision");
      assert.equal(Outcome.refusal.detail, "Beta already exists in /repo/src/a.ts");
    });
    await CheckAsync(Count, "P2: an incompatible edge is refused", async () => {
      const Outcome = await Service.proposeConnect({
        from: { path: "/repo/src/a.ts" },
        target: { path: "/repo/src/b.ts" },
        edge: "contains",
        version: "v1"
      });
      assert.equal(Outcome.refusal.reason, "incompatible-edge");
      assert.equal(
        Outcome.refusal.detail,
        "contains cannot connect File to File"
      );
    });
    await CheckAsync(Count, "P2: a duplicate edge is refused", async () => {
      const Run2 = Setup(
        {},
        DefaultGraph([{ kind: "imports", from: "file-a", to: "file-b" }])
      );
      const Outcome = await Run2.Context.workspaceOperate.proposeConnect({
        from: { path: "/repo/src/a.ts" },
        target: { path: "/repo/src/b.ts" },
        edge: "imports",
        version: "v1"
      });
      assert.equal(Outcome.refusal.reason, "duplicate-edge");
      assert.equal(
        Outcome.refusal.detail,
        "imports file-a -> file-b exists"
      );
    });
    await CheckAsync(Count, "P2: an unknown connect endpoint is refused", async () => {
      const Outcome = await Service.proposeConnect({
        from: { path: "/repo/src/missing.ts" },
        target: { path: "/repo/src/b.ts" },
        edge: "imports",
        version: "v1"
      });
      assert.equal(Outcome.refusal.reason, "unknown-symbol");
      assert.equal(
        Outcome.refusal.detail,
        "an endpoint is not in the graph: /repo/src/missing.ts -> /repo/src/b.ts"
      );
    });
    await CheckAsync(Count, "P2: a stale fence against the file version is refused", async () => {
      const Outcome = await Service.proposeReplace({
        path: "/repo/src/a.ts",
        span: { startLine: 1, endLine: 2 },
        content: "x",
        version: "v0"
      });
      assert.equal(Outcome.refusal.reason, "stale-version");
      assert.equal(
        Outcome.refusal.detail,
        "the fence v0 contradicts the file version v1"
      );
    });
    await CheckAsync(Count, "P2: a replace span beyond the file is refused with the real line count", async () => {
      const Outcome = await Service.proposeReplace({
        path: "/repo/src/b.ts",
        span: { startLine: 1, endLine: 5 },
        content: "x",
        version: "v1"
      });
      assert.deepEqual(Outcome.refusal, {
        kind: "replace",
        reason: "span-beyond-file",
        detail: "the span ends at 5 but the file has 2 lines"
      });
    });
    await CheckAsync(Count, "P2: a malformed replace is refused bad-request", async () => {
      const Outcome = await Service.proposeReplace({
        path: "/repo/src/b.ts",
        span: { startLine: 0, endLine: 2 },
        content: "x",
        version: "v1"
      });
      assert.equal(Outcome.refusal.reason, "bad-request");
      assert.equal(Outcome.refusal.detail, "span.startLine must be an integer >= 1");
    });
  }
  {
    const Run = Setup({}, DefaultGraph());
    const Service = Run.Context.workspaceOperate;
    await CheckAsync(Count, "P3: proposing never writes a file", async () => {
      await Service.proposeRename({
        path: "/repo/src/a.ts",
        name: "Alpha",
        to: "Beta",
        version: "v1"
      });
      await Service.proposeReplace({
        path: "/repo/src/b.ts",
        span: { startLine: 1, endLine: 1 },
        content: "x",
        version: "v1"
      });
      assert.equal(Run.Fs.writes.length, 0);
    });
  }
  return Finish(Count, "Rules-And-Refusals");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Rules-And-Refusals`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
