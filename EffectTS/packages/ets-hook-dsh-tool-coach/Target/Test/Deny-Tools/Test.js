import assert from "node:assert/strict";
import {
  CheckAsync,
  Finish,
  Make,
  MakeCounter,
  Validate,
  Pre,
  rm,
  ALLOW,
  Agent,
  LinesWith,
  Ledger
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const RunR7 = Make(Validate({ logFile: Ledger, denyTools: [] }));
    const AgentR7 = Agent("agent-r7-empty");
    const R7First = await Pre(RunR7, "cat f", AgentR7);
    await CheckAsync(Count, "R7: denyTools [] - the first judged call passes", async () => {
      assert.ok(R7First === ALLOW);
    });
    await CheckAsync(Count, "R7: the empty list logs no deny line", async () => {
      assert.ok(LinesWith(RunR7, ": denied ").length === 0);
    });
  }
  {
    rm();
    const RunR7list = Make(Validate({ logFile: Ledger, denyTools: ["bash"] }));
    const AgentR7list = Agent("agent-r7-list");
    const R7Denied = await Pre(RunR7list, "cat f", AgentR7list);
    await CheckAsync(
      Count,
      "R7: denyTools ['bash'] - the FIRST call of the listed tool is denied with the byte-exact NOTE_DENIED_TOOL reason",
      async () => {
        assert.equal(
          JSON.stringify(R7Denied),
          JSON.stringify({
            kind: "deny",
            reason: `Blocked by tool-coach: this tool is disabled in this profile. Use the documented alternative for that surface instead.`
          })
        );
      }
    );
    await CheckAsync(Count, "R7: the denied ledger line is byte-exact: 'denied bash denyTools'", async () => {
      assert.ok(LinesWith(RunR7list, ": denied bash denyTools").length === 1);
    });
    await CheckAsync(Count, "R7: the deny-list denial leaves no strike machinery (no ': strike' line)", async () => {
      assert.ok(LinesWith(RunR7list, ": strike").length === 0);
    });
  }
  {
    rm();
    const RunR7other = Make(Validate({ logFile: Ledger, denyTools: ["pwsh"] }));
    const AgentR7other = Agent("agent-r7-other");
    const R7Bash = await Pre(RunR7other, "cat f", AgentR7other);
    await CheckAsync(Count, "R7: a tool outside the list is never denied by it", async () => {
      assert.ok(R7Bash === ALLOW);
    });
  }
  {
    rm();
    const RunR7off = Make(Validate({ logFile: Ledger, enforce: "off", denyTools: ["bash"] }));
    const AgentR7off = Agent("agent-r7-off");
    const R7OffDenied = await Pre(RunR7off, "cat f", AgentR7off);
    await CheckAsync(
      Count,
      "R7: enforce='off' does NOT suppress the deny-list (the deny fires on the first call)",
      async () => {
        assert.ok(R7OffDenied.kind === "deny");
      }
    );
    const R7OffLadder = await Pre(RunR7off, "sed -i s/x/y/ f", AgentR7off, "pwsh");
    await CheckAsync(Count, "R7: enforce='off' still lets the ladder-only call through", async () => {
      assert.ok(R7OffLadder === ALLOW);
    });
  }
  {
    rm();
    const RunR7read = Make(Validate({ logFile: Ledger, denyTools: ["read"] }));
    const AgentR7read = Agent("agent-r7-read");
    const R7Read = await Pre(RunR7read, "x", AgentR7read, "read");
    await CheckAsync(
      Count,
      "R7: the deny is unconditional - a non-judged listed tool is denied too",
      async () => {
        assert.ok(R7Read.kind === "deny");
      }
    );
  }
  {
    rm();
    let Threw = null;
    try {
      Make(
        Validate({
          logFile: Ledger,
          notes: { first: "a", persistent: "b", denied: "c", deniedTool: "" }
        })
      );
    } catch (Error) {
      Threw = Error;
    }
    await CheckAsync(
      Count,
      "R7: fail-loud validation - an empty notes.deniedTool is rejected",
      async () => {
        assert.ok(
          Threw !== null && Threw.message === "hook-dsh-tool-coach: notes.deniedTool must be a non-empty template string"
        );
      }
    );
  }
  return Finish(Count, "Deny-Tools");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Deny-Tools`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
