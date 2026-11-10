import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Ledger,
  LedgerWith,
  LedgerLines,
  LinesWith,
  MakeCounter,
  Make,
  rm,
  Validate
} from "../Harness.js";
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    const Bound = Service.bind({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: ["no tests"],
      summary: "the change set"
    });
    Check(Count, "B1: the bind records a pending binding with the exact candidate", () => {
      assert.deepEqual(Bound, {
        id: "ap-1",
        path: "/repo/a.ts",
        fingerprint: "fp-1",
        version: "1",
        constraints: ["no tests"],
        summary: "the change set",
        decision: "pending",
        committedBy: void 0,
        sequence: 1
      });
      assert.equal(Service.binding("ap-1"), Bound);
    });
    Check(Count, "B1: the bound ledger line is byte-exact (logger and durable file)", () => {
      assert.deepEqual(LinesWith(Run, "bound"), [
        "approve: bound ap-1 /repo/a.ts fingerprint fp-1"
      ]);
      const Durable = LedgerWith("bound ap-1 /repo/a.ts fingerprint fp-1");
      assert.equal(Durable.length, 1);
      assert.ok((Durable[0] ?? "").endsWith(" bound ap-1 /repo/a.ts fingerprint fp-1"));
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Check(Count, "B2: a candidate without its identity is rejected with the byte-exact line", () => {
      const Rejected = Service.bind({
        path: "",
        fingerprint: "fp-1",
        version: "1",
        constraints: ["c"],
        summary: ""
      });
      assert.equal(Rejected.decision, "rejected");
      assert.equal(Rejected.id, "ap-0");
      assert.deepEqual(LinesWith(Run, "rejected"), [
        "approve: rejected  (candidate identity incomplete)"
      ]);
    });
    Check(Count, "B2: a candidate without constraints is rejected (the constraint law)", () => {
      const Rejected = Service.bind({
        path: "/repo/a.ts",
        fingerprint: "fp-1",
        version: "1",
        constraints: [],
        summary: ""
      });
      assert.equal(Rejected.decision, "rejected");
      const Lines = LinesWith(Run, "rejected");
      assert.equal(Lines[Lines.length - 1], "approve: rejected /repo/a.ts (no constraints)");
    });
  }
  {
    const Run = Setup({ requireConstraints: false });
    const Bound = Run.Context.workspaceApprove.bind({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: [],
      summary: ""
    });
    Check(Count, "B3: with requireConstraints=false a constraint-less candidate binds", () => {
      assert.equal(Bound.decision, "pending");
      assert.equal(Bound.id, "ap-1");
      assert.equal(LinesWith(Run, "rejected").length, 0);
    });
  }
  {
    const Run = Setup({ maxBindings: 2 });
    const Service = Run.Context.workspaceApprove;
    const Candidate = { path: "/repo/x.ts", fingerprint: "fp", version: "1", constraints: ["c"], summary: "" };
    Service.bind({ ...Candidate, path: "/repo/a.ts", fingerprint: "fp-a" });
    Service.bind({ ...Candidate, path: "/repo/b.ts", fingerprint: "fp-b" });
    Service.bind({ ...Candidate, path: "/repo/c.ts", fingerprint: "fp-c" });
    Check(Count, "B4: the ring caps at maxBindings and each drop is ledgered byte-exactly", () => {
      assert.deepEqual(LinesWith(Run, "capped"), [
        "approve: capped ap-1 (maxBindings 2)"
      ]);
      assert.equal(Run.State.Ring.length, 2);
      assert.equal(Run.State.ById.size, 3);
    });
    Check(Count, "B4: the evicted binding leaves the ring but not the by-id map", () => {
      assert.equal(Service.binding("ap-1").path, "/repo/a.ts");
      assert.deepEqual(
        Service.bindings().map((B) => B.id),
        ["ap-3", "ap-2"]
      );
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: ["no tests"],
      summary: ""
    });
    const Approved = Service.approve("ap-1", "human-1");
    Check(Count, "D1: the approve records the commitment and the byte-exact line", () => {
      assert.equal(Approved.decision, "approved");
      assert.equal(Approved.committedBy, "human-1");
      assert.deepEqual(LinesWith(Run, "decided"), [
        "approve: decided ap-1 approved by human-1"
      ]);
    });
    Check(Count, "D1: the durable ledger carries the decided line too", () => {
      assert.equal(LedgerWith("decided ap-1 approved by human-1").length, 1);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: ["no tests"],
      summary: ""
    });
    const Rejected = Service.approve("ap-1", "human-1", ["other"]);
    Check(Count, "D2: a changed constraint set rejects the approval, never amends it", () => {
      assert.equal(Rejected.decision, "rejected");
      assert.equal(Rejected.committedBy, "human-1");
      assert.deepEqual(LinesWith(Run, "constraints changed"), [
        "approve: rejected ap-1 (constraints changed)"
      ]);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    const Bound = Service.bind({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: ["c"],
      summary: ""
    });
    const Denied = Service.deny("ap-1", "human-2");
    Check(Count, "D3: the deny records the byte-exact decided line", () => {
      assert.equal(Denied.decision, "denied");
      assert.equal(Denied.committedBy, "human-2");
      assert.deepEqual(LinesWith(Run, "decided ap-1 denied"), [
        "approve: decided ap-1 denied by human-2"
      ]);
    });
    Check(Count, "D3: approving a denied binding is refused with the byte-exact line", () => {
      const Same = Service.approve("ap-1", "human-3");
      assert.equal(Same.decision, "denied");
      assert.deepEqual(LinesWith(Run, "refused"), [
        "approve: refused ap-1 (approve on denied)"
      ]);
    });
    Check(Count, "D3: revoking a pending binding is refused too", () => {
      const BoundAgain = Service.bind({
        path: "/repo/b.ts",
        fingerprint: "fp-2",
        version: "1",
        constraints: ["c"],
        summary: ""
      });
      const Same = Service.revoke(BoundAgain.id, "human-3");
      assert.equal(Same.decision, "pending");
      assert.ok(LinesWith(Run, "refused ap-2 (revoke on pending)").length === 1);
      assert.equal(Bound.id, "ap-1");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1",
      constraints: ["c"],
      summary: ""
    });
    Service.approve("ap-1", "human-1");
    const Revoked = Service.revoke("ap-1", "human-4");
    Check(Count, "D4: the revoke supersedes the approval with the byte-exact line", () => {
      assert.equal(Revoked.decision, "revoked");
      assert.deepEqual(LinesWith(Run, "revoked"), [
        "approve: revoked ap-1 by human-4"
      ]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "D5: a decision on an unknown id is a byte-exact unknown line and undefined", () => {
      const None = Run.Context.workspaceApprove.approve("ap-99", "human-1");
      assert.equal(None, void 0);
      assert.deepEqual(LinesWith(Run, "unknown"), ["approve: unknown ap-99"]);
    });
  }
  {
    const Run = Setup({ maxBindings: 3 });
    const Service = Run.Context.workspaceApprove;
    const Candidate = { path: "/repo/x.ts", fingerprint: "fp", version: "1", constraints: ["c"], summary: "" };
    Service.bind({ ...Candidate, path: "/repo/a.ts", fingerprint: "fp-a" });
    Service.bind({ ...Candidate, path: "/repo/b.ts", fingerprint: "fp-b" });
    Check(Count, "Q1: bindings() is newest first and bindings(1) slices the head", () => {
      assert.deepEqual(
        Service.bindings().map((B) => B.id),
        ["ap-2", "ap-1"]
      );
      assert.deepEqual(
        Service.bindings(1).map((B) => B.id),
        ["ap-2"]
      );
    });
    Check(Count, "Q1: the statistics triple is exact", () => {
      assert.deepEqual(Service.statistics(), { bindings: 2, byId: 2, sequence: 2 });
    });
    Check(Count, "Q1: every bind line also lands in the durable ledger file", () => {
      assert.equal(LedgerLines().filter((L) => L.endsWith("bound ap-1 /repo/a.ts fingerprint fp-a")).length, 1);
      assert.equal(LedgerLines().filter((L) => L.endsWith("bound ap-2 /repo/b.ts fingerprint fp-b")).length, 1);
    });
  }
  return Finish(Count, "Bind-And-Decide");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Bind-And-Decide`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
