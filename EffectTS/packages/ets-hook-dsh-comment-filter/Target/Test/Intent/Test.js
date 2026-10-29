import assert from "node:assert/strict";
import { Check, Finish, Ledger, Make, MakeCounter, Rm, Validate } from "../Harness.js";
const Envelope = (Path, Body2) => `<path>${Path}</path>
<type>file</type>
<content>
${Body2}
</content>`;
const Body = (Lines, Footer) => [...Lines, "", Footer].join("\n");
const Omission = "(Comments omitted. Use grep to inspect them, or ask the user to include comments.)";
const Outcome = (Value) => ({ isError: false, value: {}, content: [{ type: "text", text: Value }] });
const Step = (Agent, Text) => ({
  agent: Agent,
  messages: [{ role: "user", content: [{ type: "text", text: Text }] }],
  turn: 1,
  step: 0,
  signal: new AbortController().signal
});
const Exec = (Name, Agent) => ({
  callId: "call_smoke",
  name: Name,
  arguments: {},
  signal: new AbortController().signal,
  ...Agent === void 0 ? {} : { agent: Agent }
});
const Accept = async () => ({ kind: "accept" });
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  {
    const RunI = Make(Validate({ logFile: Ledger }));
    const PostI = RunI.Listeners["tools/post-execute"];
    const PreI = RunI.Listeners["agent/pre-step"];
    const AgentA = { id: "agent-a" };
    const AgentB = { id: "agent-b" };
    const Source = Envelope(
      "/tmp/demo.ts",
      Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)")
    );
    const Stripped = Envelope(
      "/tmp/demo.ts",
      Body(["1: ", "2: const a = 1;"], "(End of file - total 2 lines)") + "\n" + Omission
    );
    {
      const Sub = "intent: the agent/pre-step arm is registered";
      Check(Count, Sub, () => {
        assert.ok(typeof PreI === "function");
      });
    }
    {
      const Decision = { kind: "enter", messages: [] };
      const Out = await PreI(
        Step(AgentA, "Please explain the comments in the parser"),
        async () => Decision
      );
      const Sub = "intent: the pre-step listener returns the downstream decision unchanged";
      Check(Count, Sub, () => {
        assert.ok(Out === Decision);
      });
    }
    {
      const LinesBefore = RunI.Lines.length;
      const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
      const Sub = "intent: a task ABOUT comments leaves the read result untouched";
      Check(Count, Sub, () => {
        assert.ok(Out.kind === "accept" && !("content" in Out));
        assert.ok(RunI.Lines.length === LinesBefore);
      });
    }
    {
      await PreI(Step(AgentA, "Refactor the parser"), async () => ({ kind: "enter", messages: [] }));
      const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
      const Sub = "intent: a normal task strips the read result";
      Check(Count, Sub, () => {
        assert.equal(Out.content[0].text, Stripped);
      });
    }
    {
      await PreI(Step(AgentB, "Show me the docstrings"), async () => ({ kind: "enter", messages: [] }));
      const Out = await PostI(Exec("read", AgentB), Outcome(Source), Accept);
      const Sub = "intent: the stash is PER AGENT (B's comment task leaves B untouched)";
      Check(Count, Sub, () => {
        assert.ok(Out.kind === "accept" && !("content" in Out));
      });
    }
    {
      const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
      const Sub = "intent: A still strips after B's comment task (per-agent isolation)";
      Check(Count, Sub, () => {
        assert.equal(Out.content[0].text, Stripped);
      });
    }
    {
      await PreI(Step(AgentA, "Fix the off-by-one bug"), async () => ({ kind: "enter", messages: [] }));
      const Out = await PostI(Exec("read"), Outcome(Source), Accept);
      const Sub = "intent: a call with no agent identity uses the global fallback";
      Check(Count, Sub, () => {
        assert.equal(Out.content[0].text, Stripped);
      });
    }
    {
      await PreI(Step(AgentA, "Explain the comments"), async () => ({ kind: "enter", messages: [] }));
      await PreI(
        {
          agent: AgentA,
          messages: [{ role: "assistant", content: [{ type: "text", text: "ok" }] }],
          turn: 1,
          step: 1,
          signal: new AbortController().signal
        },
        async () => ({ kind: "enter", messages: [] })
      );
      const Out = await PostI(Exec("read", AgentA), Outcome(Source), Accept);
      const Sub = "intent: a step with no user message keeps the previous intent";
      Check(Count, Sub, () => {
        assert.ok(Out.kind === "accept" && !("content" in Out));
      });
    }
    {
      await PreI(Step(AgentA, "Refactor the parser"), async () => ({ kind: "enter", messages: [] }));
      const LinesBefore = RunI.Lines.length;
      const Out = await PostI(Exec("grep", AgentA), Outcome(Source), Accept);
      const Sub = "intent: a non-target tool passes by identity";
      Check(Count, Sub, () => {
        assert.ok(Out.kind === "accept" && !("content" in Out));
        assert.ok(RunI.Lines.length === LinesBefore);
      });
    }
  }
  {
    const RunOff = Make(Validate({ logFile: Ledger, intent: false }));
    const Agent = { id: "agent-blunt" };
    await RunOff.Listeners["agent/pre-step"](
      Step(Agent, "Please explain the comments in the parser"),
      async () => ({ kind: "enter", messages: [] })
    );
    const Source = Envelope(
      "/tmp/blunt.ts",
      Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)")
    );
    const Out = await RunOff.Listeners["tools/post-execute"](
      Exec("read", Agent),
      Outcome(Source),
      Accept
    );
    const Sub = "intent: intent off always strips (the blunt mode)";
    Check(Count, Sub, () => {
      assert.ok(Out.kind === "accept" && Out.content[0].text.includes("1: \n2: const a = 1;"));
    });
  }
  {
    const RunDisabled = Make(Validate({ logFile: Ledger, enabled: false }));
    const LinesBefore = RunDisabled.Lines.length;
    const Source = Envelope(
      "/tmp/off.ts",
      Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)")
    );
    const Out = await RunDisabled.Listeners["tools/post-execute"](
      Exec("read", { id: "agent-off" }),
      Outcome(Source),
      Accept
    );
    const Sub = "intent: enabled off never strips (and no ledger line)";
    Check(Count, Sub, () => {
      assert.ok(Out.kind === "accept" && !("content" in Out));
      assert.ok(RunDisabled.Lines.length === LinesBefore);
    });
    {
      const Sub2 = "intent: enabled off still records the activation line in the ledger";
      Check(Count, Sub2, () => {
        const Activated = RunDisabled.Lines.filter(
          (Line) => Line.startsWith("hook-dsh-comment-filter: activated")
        );
        assert.equal(Activated.length, 1);
        assert.ok(Activated[0].includes("targets 2"));
      });
    }
  }
  return Finish(Count, "Intent");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Intent`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
