import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  Fire,
  Launch,
  LinesWith,
  MakeCounter,
  Make,
  Validate
} from "../Harness.js";
const Setup = async () => {
  const Run = Make(Validate({ enabled: true }));
  return Run;
};
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = await Setup();
    const Resolve = (Request) => Run.Service.Resolve(Request);
    Check(Count, "P1: the omission resolves the default role silently", () => {
      assert.deepEqual(Resolve({}), {
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "low",
        taskType: "explorer",
        source: "resolved"
      });
    });
    Check(Count, "P1: a declared task type selects the role row", () => {
      const Route = Resolve({ taskType: "coder" });
      assert.equal(Route.taskType, "coder");
      assert.equal(Route.reasoningEffort, "high");
      assert.equal(Route.source, "resolved");
    });
    Check(Count, "P1: a keyword hit infers the task type", () => {
      const Route = Resolve({ spec: "fix the bug" });
      assert.equal(Route.taskType, "coder");
    });
    Check(Count, "P1: the planner keywords win over later ones (documented order)", () => {
      assert.equal(Resolve({ spec: "design the fix for the module" }).taskType, "planner");
      assert.equal(Resolve({ spec: "hello world" }).taskType, "explorer");
    });
    Check(Count, "P1: a complete, policy-legal explicit route is kept untouched", () => {
      const Passed = {
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "high"
      };
      const Route = Resolve({ taskType: "coder", route: Passed });
      assert.equal(Route.source, "kept");
      assert.deepEqual(Route.passed, Passed);
      assert.equal(Route.model, Passed.model);
      assert.equal(Route.reasoningEffort, "high");
    });
    Check(Count, "P1: a complete but illegal route is silently corrected, with the audit trail", () => {
      const Route = Resolve({
        taskType: "coder",
        route: { provider: "other", model: "@cf/other/m", reasoningEffort: "low" }
      });
      assert.equal(Route.source, "corrected");
      assert.equal(Route.provider, "cloudflare-workers-ai");
      assert.equal(Route.model, "@cf/zai-org/glm-5.3-flash");
      assert.equal(Route.reasoningEffort, "high");
      assert.deepEqual(Route.passed, {
        provider: "other",
        model: "@cf/other/m",
        reasoningEffort: "low"
      });
    });
    Check(Count, "P1: a partial explicit route is resolved silently (never kept)", () => {
      const Route = Resolve({ taskType: "coder", route: { model: "@cf/zai-org/glm-5.3-flash" } });
      assert.equal(Route.source, "resolved");
      assert.equal(Route.reasoningEffort, "high");
    });
    Check(Count, "P1: the escalation flag selects the planner rung", () => {
      const Route = Resolve({ escalate: true, taskType: "explorer" });
      assert.deepEqual(
        [Route.taskType, Route.source, Route.model, Route.reasoningEffort],
        ["planner", "escalated", "@cf/deepseek-ai/deepseek-v4.1-flash-1017", "max"]
      );
    });
  }
  {
    const Run = await Setup();
    Check(Count, "P2: Classify maps the documented keywords", () => {
      assert.equal(Run.Service.Classify("survey the docs"), "explorer");
      assert.equal(Run.Service.Classify("refactor this module"), "coder");
      assert.equal(Run.Service.Classify("plan the architecture"), "planner");
      assert.equal(Run.Service.Classify("greet the user"), void 0);
    });
    Check(Count, "P2: Escalate follows the attempts ladder (at most one rung)", () => {
      const Rung = Run.Service.Escalate(0);
      assert.equal(Rung.source, "escalated");
      assert.equal(Rung.taskType, "planner");
      assert.equal(Run.Service.Escalate(1), void 0);
    });
  }
  {
    const Run = Make(
      Validate({ enabled: true, policy: { escalation: { enabled: false, max: 1 } } })
    );
    Check(Count, "P3: with escalation disabled the flag falls through and the ladder is closed", () => {
      const Route = Run.Service.Resolve({ escalate: true });
      assert.equal(Route.taskType, "explorer");
      assert.equal(Route.source, "resolved");
      assert.equal(Run.Service.Escalate(0), void 0);
    });
  }
  {
    const Run = await Setup();
    await CheckAsync(Count, "P4: an omission-free launch gets the resolved route injected silently", async () => {
      const Exec = Launch({ description: "fix the bug", agentOptions: {} });
      const { Out, Decision, Called } = await Fire(Run, Exec);
      assert.equal(Called, 1);
      assert.equal(Out, Decision);
      assert.deepEqual(Exec.args.agentOptions, {
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "high"
      });
      assert.deepEqual(LinesWith(Run, "route "), [
        "plugin-dsh-route: route coder resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high"
      ]);
      assert.deepEqual(Run.Warns, []);
    });
    await CheckAsync(Count, "P4: a wrong explicit route is corrected in place, never surfaced", async () => {
      const Exec = Launch({
        description: "fix the bug",
        agentOptions: { provider: "other", model: "@cf/other/m", reasoningEffort: "low" }
      });
      await Fire(Run, Exec);
      assert.deepEqual(Exec.args.agentOptions, {
        provider: "cloudflare-workers-ai",
        model: "@cf/zai-org/glm-5.3-flash",
        reasoningEffort: "high"
      });
      assert.deepEqual(LinesWith(Run, "route coder corrected"), [
        "plugin-dsh-route: route coder corrected cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high"
      ]);
      assert.deepEqual(Run.Warns, []);
    });
    await CheckAsync(Count, "P4: a policy-legal route is kept as passed", async () => {
      const Exec = Launch({
        description: "fix the bug",
        agentOptions: {
          provider: "cloudflare-workers-ai",
          model: "@cf/zai-org/glm-5.3-flash",
          reasoningEffort: "high"
        }
      });
      await Fire(Run, Exec);
      assert.equal(Exec.args.agentOptions.reasoningEffort, "high");
      assert.deepEqual(LinesWith(Run, "route coder kept"), [
        "plugin-dsh-route: route coder kept cloudflare-workers-ai @cf/zai-org/glm-5.3-flash high"
      ]);
    });
    await CheckAsync(Count, "P4: the top-level spelling is injected too (the second spelling)", async () => {
      const Exec = Launch({ prompt: "survey the docs" });
      await Fire(Run, Exec);
      assert.deepEqual(
        [Exec.args.provider, Exec.args.model, Exec.args.reasoningEffort],
        ["cloudflare-workers-ai", "@cf/zai-org/glm-5.3-flash", "low"]
      );
      assert.deepEqual(LinesWith(Run, "route explorer resolved"), [
        "plugin-dsh-route: route explorer resolved cloudflare-workers-ai @cf/zai-org/glm-5.3-flash low"
      ]);
    });
    await CheckAsync(Count, "P4: a non-subagent tool passes through untouched and unlogged", async () => {
      const Exec = Launch();
      Exec.name = "read";
      const { Decision } = await Fire(Run, Exec);
      assert.equal(Exec.args.agentOptions, void 0);
      assert.equal(LinesWith(Run, "route ").length, 4);
      assert.equal(Decision.marker, "downstream");
    });
  }
  {
    const Run = await Setup();
    const Flipped = {
      ...Run.Service.Policy,
      coder: {
        provider: "cloudflare-workers-ai",
        model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
        reasoningEffort: "max"
      }
    };
    const Cell = Run.Raw.policy;
    const Write = /* @__PURE__ */ Symbol.for("cosmokit.volatile.write");
    Cell[Write](Flipped);
    Run.CtxListeners["loader/volatile-update"](["policy"]);
    Check(Count, "P5: a policy hot-edit lands on the next launch without a remount", () => {
      assert.equal(Run.Service.Policy.coder.model, "@cf/deepseek-ai/deepseek-v4.1-flash-1017");
    });
  }
  {
    const Run = await Setup();
    const Request = { spec: "fix the bug", route: void 0 };
    Check(Count, "P6: the same request and policy always produce the same route", () => {
      const First = Run.Service.Resolve(Request);
      const Second = Run.Service.Resolve(Request);
      assert.deepEqual(First, Second);
    });
  }
  return Finish(Count, "Resolve-And-Inject");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Resolve-And-Inject`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
