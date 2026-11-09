import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
  CheckAsync,
  Finish,
  Make,
  MakeCounter,
  Validate,
  Pre,
  Post,
  rm,
  ALLOW,
  ACCEPT,
  Agent,
  LinesWith,
  SED_ROW,
  JQ_EXEMPT,
  Ledger
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const RunR5 = Make(Validate({ logFile: Ledger, enforce: "write" }));
    const AgentR5 = Agent("agent-r5");
    for (let Index = 0; Index < 7; Index += 1) {
      await Post(RunR5, "sed -i s/x/y/ f", AgentR5);
    }
    await CheckAsync(Count, "R5: the tier-1 note fired at the write-class threshold on the way", async () => {
      assert.ok(LinesWith(RunR5, ": strike 3/3 bash write -> note edit").length === 1);
    });
    const R5Denied = await Pre(RunR5, "sed -i s/x/y/ f", AgentR5);
    await CheckAsync(
      Count,
      "R5/D1: the deny reason is the byte-exact NOTE_DENIED text with the fetched edit entry",
      async () => {
        assert.equal(
          JSON.stringify(R5Denied),
          JSON.stringify({
            kind: "deny",
            reason: `Blocked by tool-coach: "sed -i s/x/y/ f" is forbidden (write-class bash pattern). Use the edit tool for this operation instead \u2014 Edit an existing UTF-8 text file by replacing literal text. (key parameter: old_string). Then rerun only the legitimate command parts (build/test/git), if any.`
          })
        );
      }
    );
    await CheckAsync(
      Count,
      "R5: the denied ledger line is byte-exact: 'denied bash write <sed row> -> use edit'",
      async () => {
        assert.ok(LinesWith(RunR5, `: denied bash write ${SED_ROW} -> use edit`).length === 1);
      }
    );
    const R5Cat = await Pre(RunR5, "cat f", AgentR5);
    await CheckAsync(Count, "R5: read class is NOT denied under enforce='write'", async () => {
      assert.ok(R5Cat === ALLOW);
    });
    rm();
    const RunR5all = Make(Validate({ logFile: Ledger, enforce: "all" }));
    const AgentR5all = Agent("agent-r5-all");
    for (let Index = 0; Index < 7; Index += 1) {
      await Post(RunR5all, "cat f", AgentR5all);
    }
    const R5allCat = await Pre(RunR5all, "cat f", AgentR5all);
    await CheckAsync(Count, "R5: under enforce='all' the read class IS denied", async () => {
      assert.ok(R5allCat.kind === "deny");
    });
    rm();
    const RunR5off = Make(Validate({ logFile: Ledger, enforce: "off" }));
    const AgentR5off = Agent("agent-r5-off");
    for (let Index = 0; Index < 7; Index += 1) {
      await Post(RunR5off, "sed -i s/x/y/ f", AgentR5off);
    }
    await CheckAsync(Count, "R5: under enforce='off' nothing is ever denied", async () => {
      assert.ok(await Pre(RunR5off, "sed -i s/x/y/ f", AgentR5off) === ALLOW);
    });
  }
  {
    rm();
    const RunR6 = Make(Validate({ logFile: Ledger }));
    const AgentR6 = Agent("agent-r6");
    for (const Command of ["rm -rf build", "git commit -m x", "cp a b", "echo hi", "python script.py"]) {
      await Post(RunR6, Command, AgentR6);
    }
    await CheckAsync(
      Count,
      "R6: rm/git commit/cp/echo/python script.py write NO lines (not even exempt)",
      async () => {
        assert.ok(RunR6.Lines.every((L) => !L.includes(": offense") && !L.includes(": exempt")));
      }
    );
    await Post(RunR6, "cat f.json | jq", AgentR6);
    await CheckAsync(
      Count,
      "R6: the cat|jq carve-out logs the exempt line once: 'exempt bash <carve-out>'",
      async () => {
        assert.ok(LinesWith(RunR6, `: exempt bash ${JQ_EXEMPT}`).length === 1);
      }
    );
    await Post(RunR6, "cat g.json | jq", AgentR6);
    await CheckAsync(Count, "R6: the exempt line is deduped per distinct pattern per agent", async () => {
      assert.ok(LinesWith(RunR6, ": exempt bash").length === 1);
    });
    await CheckAsync(Count, "the durable ledger file carries the [ISO] exempt line", async () => {
      assert.ok(
        FileSystem.existsSync(Ledger) && FileSystem.readFileSync(Ledger, "utf8").includes(`] exempt bash ${JQ_EXEMPT}`)
      );
    });
    rm();
    const RunR6off = Make(Validate({ logFile: Ledger, enabled: false }));
    await CheckAsync(
      Count,
      "R6: the disabled ledger line is byte-exact: 'disabled (enabled=false)'",
      async () => {
        assert.ok(RunR6off.Lines.includes("hook-dsh-tool-coach: disabled (enabled=false)"));
      }
    );
    const R6offOut = await Post(RunR6off, "cat a.md", Agent("agent-r6-off"));
    await CheckAsync(
      Count,
      "R6: enabled=false - every listener returns next() untouched (full passthrough)",
      async () => {
        assert.ok(R6offOut === ACCEPT);
      }
    );
    await CheckAsync(Count, "R6: enabled=false writes no offense lines", async () => {
      assert.ok(RunR6off.Lines.every((L) => !L.includes(": offense")));
    });
    rm();
    const RunR6n0 = Make(Validate({ logFile: Ledger, patternTable: [] }));
    const R6n0Out = await Post(RunR6n0, "cat a.md", Agent("agent-r6-n0"));
    await CheckAsync(Count, "R6: an emptied pattern table = N=0 passthrough", async () => {
      assert.ok(R6n0Out.kind === "accept" && R6n0Out.additionalContexts === void 0);
    });
    await CheckAsync(Count, "R6: N=0 writes no offense lines", async () => {
      assert.ok(RunR6n0.Lines.every((L) => !L.includes(": offense")));
    });
  }
  return Finish(Count, "Enforce-And-Exempts");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Enforce-And-Exempts`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
