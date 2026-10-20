import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Make,
  MakeCounter,
  Validate,
  Ledger,
  Post,
  rm,
  ACCEPT,
  Agent
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    rm();
    const RunR1 = Make(Validate({ logFile: Ledger }));
    const Legit = [
      "git status",
      "pnpm build",
      "node x.js",
      "ls",
      "rm -rf build",
      "python script.py",
      "make",
      "docker ps",
      "echo hello",
      "true"
    ];
    await CheckAsync(
      Count,
      "R1: all 10 legitimate calls pass through with NO additionalContexts",
      async () => {
        let Passthrough = true;
        for (const Command of Legit) {
          const Out = await Post(RunR1, Command);
          if (Out !== ACCEPT) {
            Passthrough = false;
          }
        }
        assert.ok(Passthrough);
      }
    );
    Check(Count, "R1: the only ledger line is the activation", () => {
      assert.ok(
        RunR1.Lines.filter((L) => L.startsWith("hook-dsh-tool-coach: activated")).length === 1
      );
    });
    Check(Count, "R1: no warnings (no listener ever throws)", () => {
      assert.equal(RunR1.Warns.length, 0);
    });
  }
  {
    rm();
    const RunR1 = Make(Validate({ logFile: Ledger }));
    const Cyclical = {};
    Cyclical.self = Cyclical;
    await CheckAsync(
      Count,
      "a malformed (cyclic) payload returns the downstream decision unchanged",
      async () => {
        const Out = await RunR1.Listeners["tools/post-execute"](
          { callId: "c", name: "bash", arguments: Cyclical, agent: Agent("agent-a"), signal: void 0 },
          { isError: false, value: "", content: [] },
          async () => ACCEPT
        );
        assert.ok(Out === ACCEPT);
      }
    );
    Check(Count, "the fail-open envelope logs a prefixed warning instead of throwing", () => {
      assert.ok(RunR1.Warns.some((W) => W.startsWith("hook-dsh-tool-coach: ")));
    });
  }
  {
    rm();
    const RunNJ = Make(Validate({ logFile: Ledger }));
    await Post(RunNJ, "cat a.md", Agent("agent-nj"), "read");
    await Post(RunNJ, "sed -i s/x/y/ f", Agent("agent-nj"), "write");
    await CheckAsync(Count, "the dedicated tools are never judged (read/write calls)", async () => {
      assert.ok(RunNJ.Lines.every((L) => !L.includes(": offense")));
    });
  }
  return Finish(Count, "Passthrough-And-Guards");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Passthrough-And-Guards`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
