import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Ledger,
  LedgerWith,
  LinesWith,
  MakeCounter,
  Make,
  Plugin,
  Proposal,
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
    Check(Count, "G1: the default object carries exactly name/apply/Config/inject", () => {
      assert.equal(Plugin.name, "hook-dsh-workspace-govern");
      assert.equal(typeof Plugin.apply, "function");
      assert.equal(typeof Plugin.Config, "function");
      assert.deepEqual(Plugin.inject, ["pluginFactory"]);
      assert.deepEqual(Object.keys(Plugin), ["name", "apply", "Config", "inject"]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "G2: apply returns NOTHING and exposes the state probe", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.State !== void 0);
      assert.equal(Run.State.Module, "govern");
      assert.deepEqual(Run.State.Tools, ["write", "edit", "bash", "applyPatch"]);
    });
    Check(Count, "G2: the workspaceGovern service is registered from apply", () => {
      assert.ok(Run.Provided["workspaceGovern"] !== void 0);
      assert.ok(Run.Context.workspaceGovern !== void 0);
      assert.equal(typeof Run.Context.workspaceGovern.gate, "function");
      assert.equal(typeof Run.Context.workspaceGovern.decisions, "function");
    });
    Check(Count, "G2: the activation line is byte-exact (logger and durable file)", () => {
      assert.deepEqual(Run.Lines, ["govern: activated (tools=4, policy=0)"]);
      const Durable = LedgerWith("activated (tools=4, policy=0)");
      assert.equal(Durable.length, 1);
      assert.match(Durable[0], /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] /);
    });
  }
  {
    const Run = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "G3: a disabled mount wires NOTHING and logs the honest line", () => {
      assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update"]);
      assert.deepEqual(Run.Lines, ["govern: disabled (enabled=false)"]);
      assert.ok(Run.Provided["workspaceGovern"] !== void 0);
    });
  }
  {
    Check(Count, "G4: a bad policy table fails loud with the module-prefixed error", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, policy: "x" })),
        /policy/
      );
    });
    Check(Count, "G4: a bad recovery override fails loud", () => {
      assert.throws(
        () => Make(
          Validate({
            logFile: Ledger,
            enabled: true,
            recovery: [{ obligation: "scope", behavior: "sometimes" }]
          })
        ),
        /govern: every recovery override needs obligation/
      );
    });
    Check(Count, "G4: a zero loop bound fails loud", () => {
      assert.throws(
        () => Make(Validate({ logFile: Ledger, enabled: true, loopBound: 0 })),
        /govern: loopBound must be >= 1/
      );
    });
  }
  {
    const Run = Setup();
    const Decision = Run.Context.workspaceGovern.gate(Proposal());
    Check(Count, "D1: a declared, contributed proposal passes with the byte-exact lines", () => {
      assert.equal(Decision.decision, "pass");
      assert.equal(Decision.reason, "");
      assert.deepEqual(LinesWith(Run, "op:1"), [
        "govern: passed op:1 (write /repo/src/a.ts)"
      ]);
      assert.equal(LedgerWith("passed op:1 (write /repo/src/a.ts)").length, 1);
    });
  }
  {
    const Run = Setup();
    const Decision = Run.Context.workspaceGovern.gate(Proposal({ contribution: "" }));
    Check(Count, "D2: an empty contribution denies with the byte-exact line", () => {
      assert.equal(Decision.decision, "deny");
      assert.equal(Decision.reason, "contributes");
      assert.deepEqual(Decision.obligations.contributes, "denied");
      assert.deepEqual(LinesWith(Run, "denied"), [
        "govern: denied op:1 (contributes)"
      ]);
      assert.equal(LedgerWith("denied op:1 (contributes)").length, 1);
    });
  }
  {
    const Run = Setup({ scope: ["/repo/**"] });
    const Decision = Run.Context.workspaceGovern.gate(
      Proposal({ target: "/etc/hosts" })
    );
    Check(Count, "D3: a target outside the scope allowlist denies", () => {
      assert.equal(Decision.decision, "deny");
      assert.equal(Decision.reason, "scope");
      assert.equal(Decision.obligations.scope, "denied");
    });
    Check(Count, "D3: a target inside the scope allowlist passes", () => {
      const Decision2 = Run.Context.workspaceGovern.gate(
        Proposal({ operation: "op:2", target: "/repo/src/b.ts" })
      );
      assert.equal(Decision2.decision, "pass");
      assert.equal(Decision2.obligations.scope, "satisfied");
    });
  }
  {
    const Run = Setup();
    const Decision = Run.Context.workspaceGovern.gate(
      Proposal({
        operation: "op:3",
        preconditions: [
          { name: "tests pass", satisfied: false },
          { name: "lint clean", satisfied: true }
        ]
      })
    );
    Check(Count, "D4: an explicitly unsatisfied precondition denies by name", () => {
      assert.equal(Decision.decision, "deny");
      assert.equal(Decision.reason, "precondition tests pass");
      assert.deepEqual(Decision.obligations.preconditions, "denied:tests pass");
      assert.deepEqual(LinesWith(Run, "denied"), [
        "govern: denied op:3 (precondition tests pass)"
      ]);
    });
    Check(Count, "D4: all-satisfied preconditions pass", () => {
      const Decision2 = Run.Context.workspaceGovern.gate(
        Proposal({
          operation: "op:4",
          preconditions: [{ name: "tests pass", satisfied: true }]
        })
      );
      assert.equal(Decision2.decision, "pass");
    });
  }
  {
    const Run = Setup({ policy: [{ kind: "bash", decision: "deny" }] });
    Check(Count, "D5: a policy deny rule forces the denial", () => {
      const Decision = Run.Context.workspaceGovern.gate(
        Proposal({ operation: "op:5", kind: "bash", target: "/repo/x.sh" })
      );
      assert.equal(Decision.decision, "deny");
      assert.equal(Decision.reason, "policy: bash");
      assert.deepEqual(LinesWith(Run, "denied"), [
        "govern: denied op:5 (policy: bash)"
      ]);
    });
    Check(Count, "D5: a policy allow rule never bypasses the checks", () => {
      const Run2 = Setup({ policy: [{ kind: "bash", decision: "allow" }] });
      const Decision = Run2.Context.workspaceGovern.gate(
        Proposal({ kind: "bash", contribution: "" })
      );
      assert.equal(Decision.decision, "deny");
      assert.equal(Decision.reason, "contributes");
    });
  }
  {
    const Run = Setup({ policy: [{ kind: "*", decision: "escalate" }] });
    Check(Count, "D6: an escalate rule produces the ask decision with the byte-exact line", () => {
      const Decision = Run.Context.workspaceGovern.gate(
        Proposal({ operation: "op:7" })
      );
      assert.equal(Decision.decision, "escalate");
      assert.equal(Decision.reason, "policy: *");
      assert.deepEqual(LinesWith(Run, "escalated"), [
        "govern: escalated op:7 (approval required)"
      ]);
    });
  }
  {
    const Run = Setup();
    Check(Count, "D7: missing preconditions pass with the recovery line by default", () => {
      const Decision = Run.Context.workspaceGovern.gate(
        Proposal({ operation: "op:8" })
      );
      assert.equal(Decision.decision, "pass");
      assert.equal(Decision.obligations.preconditions, "recovery");
      assert.deepEqual(LinesWith(Run, "recovery"), [
        "govern: recovery preconditions (fail-open)"
      ]);
    });
  }
  {
    const Run = Setup({
      recovery: [{ obligation: "preconditions", behavior: "fail-closed" }]
    });
    Check(Count, "D7: a fail-closed override turns missing preconditions into a denial", () => {
      const Decision = Run.Context.workspaceGovern.gate(
        Proposal({ operation: "op:9" })
      );
      assert.equal(Decision.decision, "deny");
      assert.equal(Decision.reason, "precondition ");
    });
  }
  {
    const Run = Setup({ maxDecisions: 2 });
    Run.Context.workspaceGovern.gate(Proposal({ operation: "op:a" }));
    Run.Context.workspaceGovern.gate(Proposal({ operation: "op:b" }));
    Run.Context.workspaceGovern.gate(Proposal({ operation: "op:c" }));
    Check(Count, "D8: the ring keeps the newest decisions, newest first", () => {
      assert.deepEqual(Run.Context.workspaceGovern.decisions().map((D) => D.operation), [
        "op:c",
        "op:b"
      ]);
      assert.deepEqual(Run.Context.workspaceGovern.decisions(1).map((D) => D.operation), [
        "op:c"
      ]);
      assert.deepEqual(Run.Context.workspaceGovern.statistics(), {
        decisions: 2,
        sequence: 3
      });
    });
  }
  {
    const Run = Setup();
    Run.Context.workspaceGovern.gate(Proposal());
    Check(Count, "D9: the gate reads no file content", () => {
      assert.equal(Run.Fs.reads.length, 0);
      assert.equal(Run.Fs.writes.length, 0);
    });
  }
  return Finish(Count, "Wiring-And-Decisions");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Decisions`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
