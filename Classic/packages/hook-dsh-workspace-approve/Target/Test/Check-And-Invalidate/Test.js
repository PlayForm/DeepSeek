import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Fire,
  FireMalformed,
  Ledger,
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
const Candidate = {
  path: "/repo/a.ts",
  fingerprint: "fp-1",
  version: "1",
  constraints: ["c"],
  summary: ""
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const Result = Run.Context.workspaceApprove.check({
      path: "/repo/a.ts",
      fingerprint: "fp-1",
      version: "1"
    });
    Check(Count, "C1: an unbound change set is never approved", () => {
      assert.deepEqual(Result, {
        bound: false,
        decision: "unbound",
        id: void 0,
        reason: "no approval for this exact candidate"
      });
    });
    Check(Count, "C1: the checked line is byte-exact", () => {
      assert.deepEqual(LinesWith(Run, "checked"), [
        "approve: checked /repo/a.ts (unbound)"
      ]);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({ ...Candidate, fingerprint: "fp-1" });
    const Result = Service.check({ path: "/repo/a.ts", fingerprint: "fp-2", version: "1" });
    Check(Count, "C2: a different fingerprint is a different candidate (unbound)", () => {
      assert.equal(Result.bound, false);
      assert.equal(Result.decision, "unbound");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({ ...Candidate });
    Check(Count, "C3: a pending binding checks as pending with the binding id", () => {
      const Result = Service.check({ path: Candidate.path, fingerprint: "fp-1", version: "1" });
      assert.equal(Result.bound, true);
      assert.equal(Result.decision, "pending");
      assert.equal(Result.id, "ap-1");
      assert.equal(Result.reason, "binding ap-1 is not approved");
    });
    Check(Count, "C3: a denied binding checks as denied", () => {
      Service.deny("ap-1", "human-1");
      const Result = Service.check({ path: Candidate.path, fingerprint: "fp-1", version: "1" });
      assert.equal(Result.decision, "denied");
    });
    Check(Count, "C3: a revoked binding checks as revoked", () => {
      const Bound = Service.bind({
        path: "/repo/b.ts",
        fingerprint: "fp-2",
        version: "1",
        constraints: ["c"],
        summary: ""
      });
      Service.approve(Bound.id, "human-1");
      Service.revoke(Bound.id, "human-2");
      const Result = Service.check({ path: "/repo/b.ts", fingerprint: "fp-2", version: "1" });
      assert.equal(Result.decision, "revoked");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({ ...Candidate });
    Service.approve("ap-1", "human-1");
    Check(Count, "C4: an approved binding with the unchanged version approves", () => {
      const Result = Service.check({ path: Candidate.path, fingerprint: "fp-1", version: "1" });
      assert.deepEqual(Result, {
        bound: true,
        decision: "approved",
        id: "ap-1",
        reason: ""
      });
    });
    Check(Count, "C4: an approved binding whose version moved is STALE, never authorized", () => {
      const Result = Service.check({ path: Candidate.path, fingerprint: "fp-1", version: "2" });
      assert.equal(Result.decision, "stale");
      assert.equal(Result.reason, "candidate changed after the approval");
    });
    Check(Count, "C4: the checked lines are byte-exact", () => {
      assert.deepEqual(LinesWith(Run, "checked"), [
        "approve: checked /repo/a.ts (approved)",
        "approve: checked /repo/a.ts (stale)"
      ]);
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({ ...Candidate });
    Service.approve("ap-1", "human-1");
    Fire(Run, Candidate.path, "1");
    Check(Count, "I1: a same-version present event is a no-op (no line, no state change)", () => {
      assert.equal(LinesWith(Run, "invalidated").length, 0);
      assert.equal(Run.State.ById.get("ap-1").decision, "approved");
    });
    Check(Count, "I1: an absent-kind event is a no-op too", () => {
      Run.Listeners["fs/observed"](
        { displayPath: Candidate.path, targetKey: Candidate.path },
        { kind: "absent" },
        { agent: { id: "agent-a" } }
      );
      assert.equal(Run.State.ById.get("ap-1").decision, "approved");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({ ...Candidate });
    Service.bind({ ...Candidate, path: "/repo/b.ts", fingerprint: "fp-2", version: "1" });
    Service.approve("ap-1", "human-1");
    Fire(Run, "/repo/b.ts", "2");
    Check(Count, "I2: a version change invalidates the binding with the byte-exact line", () => {
      assert.equal(Run.State.ById.get("ap-2").decision, "invalidated");
      assert.deepEqual(LinesWith(Run, "invalidated"), [
        "approve: invalidated ap-2 (version changed)"
      ]);
    });
    Check(Count, "I2: the invalidated binding checks as invalidated", () => {
      const Result = Service.check({ path: "/repo/b.ts", fingerprint: "fp-2", version: "2" });
      assert.equal(Result.decision, "invalidated");
    });
  }
  {
    const Run = Setup();
    const Service = Run.Context.workspaceApprove;
    Service.bind({ ...Candidate });
    Fire(Run, Candidate.path, "9", Run.State.Self);
    Check(Count, "I3: an own-actor event never invalidates the binding", () => {
      assert.equal(Run.State.ById.get("ap-1").decision, "pending");
      assert.equal(LinesWith(Run, "invalidated").length, 0);
    });
  }
  {
    const Run = Setup();
    FireMalformed(Run);
    Check(Count, "I4: a malformed event never throws and is ledgered byte-exactly", () => {
      assert.deepEqual(LinesWith(Run, "failed"), [
        "approve: failed unknown (malformed event: displayPath is not a string)"
      ]);
    });
    Check(Count, "I4: the listener keeps working after a malformed event", () => {
      const Service = Run.Context.workspaceApprove;
      Service.bind({ ...Candidate });
      Fire(Run, Candidate.path, "2");
      assert.equal(Run.State.ById.get("ap-1").decision, "invalidated");
    });
  }
  return Finish(Count, "Check-And-Invalidate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Check-And-Invalidate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
