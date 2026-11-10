import assert from "node:assert/strict";
import {
  Check,
  Coder,
  Child,
  Finish,
  Fire,
  FireStep,
  Launch,
  LinesWith,
  Make,
  MakeCounter,
  Planner,
  Prompt,
  Validate
} from "../Harness.js";
const Setup = (Config = {}, Attach) => Make(Validate({ enabled: true, ...Config }), Attach);
const Step = (Agent) => ({ agent: Agent, messages: [], turn: 1, step: 1 });
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    const { Out } = await FireStep(Run, Step(Child(Coder, 1)), [Prompt("Build the parser")]);
    Check(Count, "H1: the child's first step carries the routing hint", () => {
      assert.equal(Out.kind, "enter");
      assert.equal(Out.messages.length, 2);
      const Hint = Out.messages[1];
      assert.equal(Hint.id, "route-hint-1");
      assert.equal(Hint.role, "user");
      assert.deepEqual(Hint.source, { kind: "user" });
      assert.equal(
        Hint.content[0].text,
        "[route: coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high]"
      );
      assert.equal(Out.messages[0].content[0].text, "Build the parser");
    });
    Check(Count, "H1: the hint ledger line is byte-exact", () => {
      assert.deepEqual(LinesWith(Run, "hint "), [
        "plugin-dsh-route: hint coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high"
      ]);
    });
  }
  {
    const Run = Setup();
    const { Out } = await FireStep(Run, Step(Child({}, 0)), [Prompt("Build the parser")]);
    Check(Count, "H2: the main agent's step is untouched and unlogged", () => {
      assert.equal(Out.messages.length, 1);
      assert.equal(LinesWith(Run, "hint ").length, 0);
    });
  }
  {
    const Run = Setup();
    const Hinted = `Build the parser

[route: coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high]`;
    const { Out } = await FireStep(Run, Step(Child(Coder, 1)), [Prompt(Hinted)]);
    Check(Count, "H3: a prompt that already carries the hint is not hinted twice", () => {
      assert.equal(Out.messages.length, 1);
      assert.equal(LinesWith(Run, "hint ").length, 0);
    });
  }
  {
    const Run = Setup();
    const { Out } = await FireStep(Run, Step(Child(Planner, 1)), [Prompt("survey the docs")]);
    Check(Count, "H4: the hint names the child's own route and the classified role", () => {
      assert.equal(
        Out.messages[1].content[0].text,
        "[route: explorer cloudflare-workers-ai @cf/deepseek-ai/deepseek-v4.1-flash-1017 max]"
      );
      assert.ok(
        Run.Lines.includes(
          "plugin-dsh-route: hint explorer cloudflare-workers-ai @cf/deepseek-ai/deepseek-v4.1-flash-1017 max"
        )
      );
    });
  }
  {
    const Run = Setup();
    const Exec = Launch({ description: "fix the bug", prompt: "fix the bug", agentOptions: {} });
    await Fire(Run, Exec);
    Check(Count, "H5: the subagent tool's prompt carries the hint at launch", () => {
      assert.equal(
        Exec.args.prompt,
        "fix the bug\n\n[route: coder cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high]"
      );
      assert.deepEqual(Exec.args.agentOptions, {
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "high"
      });
      assert.deepEqual(LinesWith(Run, "route coder resolved"), [
        "plugin-dsh-route: route coder resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high"
      ]);
    });
  }
  {
    const Run = Setup();
    const Exec = Launch({
      description: "ESCALATION: the build is broken",
      prompt: "fix the build",
      agentOptions: {}
    });
    await Fire(Run, Exec);
    Check(Count, "H6: an ESCALATION: marker routes the launch to the planner rung", () => {
      assert.deepEqual(Exec.args.agentOptions, {
        provider: "cloudflare-workers-ai",
        model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
        reasoningEffort: "max"
      });
      assert.deepEqual(LinesWith(Run, "route planner escalated"), [
        "plugin-dsh-route: route planner escalated cloudflare-workers-ai @cf/deepseek-ai/deepseek-v4.1-flash-1017 max"
      ]);
      assert.ok(
        Exec.args.prompt.endsWith(
          "[route: planner cloudflare-workers-ai @cf/deepseek-ai/deepseek-v4.1-flash-1017 max]"
        )
      );
    });
  }
  {
    const Run = Setup({}, (Context) => {
      Context.llm = {
        listModels: async () => [{ id: "@cf/deepseek-ai/deepseek-v4-flash-0731" }]
      };
    });
    const Exec = Launch({
      description: "ESCALATION: the tests fail",
      prompt: "fix the tests",
      agentOptions: {}
    });
    await Fire(Run, Exec);
    Check(Count, "H7: a rung model missing from the live catalog falls back inside the allowed set", () => {
      assert.deepEqual(Exec.args.agentOptions, {
        provider: "cloudflare-workers-ai",
        model: "@cf/deepseek-ai/deepseek-v4-flash-0731",
        reasoningEffort: "max"
      });
      assert.deepEqual(LinesWith(Run, "route planner escalated"), [
        "plugin-dsh-route: route planner escalated cloudflare-workers-ai @cf/deepseek-ai/deepseek-v4-flash-0731 max"
      ]);
    });
  }
  {
    const Run = Make(Validate({}));
    const { Out } = await FireStep(Run, Step(Child(Coder, 1)), [Prompt("Build the parser")]);
    Check(Count, "H8: a disabled mount leaves the step untouched and unlogged", () => {
      assert.equal(Out.messages.length, 1);
      assert.deepEqual(Run.Lines, ["plugin-dsh-route: disabled (enabled=false)"]);
    });
  }
  {
    const Run = Setup();
    const Decision = { kind: "reject" };
    const Out = await Run.CtxListeners["agent/pre-step"](Step(Child({}, 1)), async () => Decision);
    Check(Count, "H9: a rejected step is returned unchanged and unlogged", () => {
      assert.equal(Out, Decision);
      assert.equal(LinesWith(Run, "hint ").length, 0);
    });
  }
  return Finish(Count, "Launch-And-Hint");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Launch-And-Hint`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
