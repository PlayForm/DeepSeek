import assert from "node:assert/strict";
import {
  Check,
  Finish,
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
    const Loader = await import("../../../Target/Library.js");
    const Run = Make(Validate({}));
    Check(Count, "W1: the default object carries name/apply/Config/inject", () => {
      assert.equal(Loader.default.name, "plugin-dsh-route");
      assert.equal(Loader.default.apply, Loader.apply);
      assert.ok(Loader.default.Config !== void 0);
      assert.deepEqual(Loader.default.inject, ["pluginFactory"]);
    });
    Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
      assert.equal(Run.Returned, void 0);
      assert.ok(Run.Provided["dshRoute"] !== void 0);
    });
    Check(Count, "W1: a disabled mount still registers the passthrough listener and logs the byte-exact line", async () => {
      assert.ok(Run.CtxListeners["tools/pre-execute"] !== void 0);
      assert.deepEqual(Run.Lines, ["plugin-dsh-route: disabled (enabled=false)"]);
      const Exec = { name: "subagent", args: { description: "fix the bug", agentOptions: {} } };
      const Decision = { action: "continue" };
      const Out = await Run.CtxListeners["tools/pre-execute"](Exec, async () => Decision);
      assert.equal(Out, Decision);
      assert.deepEqual(Exec.args.agentOptions, {});
      assert.deepEqual(Run.Lines, ["plugin-dsh-route: disabled (enabled=false)"]);
    });
    Check(Count, "W1: the disabled service still exposes the policy view", () => {
      assert.equal(Run.Service.Policy.escalation.enabled, true);
      assert.equal(Run.Service.Classify("fix the bug"), "coder");
    });
  }
  {
    const Run = await Setup();
    Check(Count, "W2: the single launch-path listener is on the plugin ctx", () => {
      assert.ok(Run.CtxListeners["tools/pre-execute"] !== void 0);
      assert.deepEqual(Run.RootNames, []);
    });
    Check(Count, "W2: the activation line is byte-exact", () => {
      assert.deepEqual(Run.Lines, [
        "plugin-dsh-route: activated (bundle 0.2.1, defaultRole=explorer, models=3)"
      ]);
    });
    Check(Count, "W2: the plugin touches no files and sets no timers (no fs, no effects)", () => {
      assert.equal(Run.Context.fs, void 0);
      assert.deepEqual(Run.Effects, []);
    });
  }
  {
    const Run = await Setup();
    const Policy = Run.Service.Policy;
    Check(Count, "W3: the policy view is the shipped default", () => {
      assert.equal(Policy.coder.provider, "cloudflare-workers-ai");
      assert.equal(Policy.coder.model, "@cf/zai-org/glm-5.3-flash");
      assert.equal(Policy.coder.reasoningEffort, "high");
      assert.equal(Policy.explorer.reasoningEffort, "low");
      assert.equal(Policy.planner.model, "@cf/deepseek-ai/deepseek-v4.1-flash-1017");
      assert.equal(Policy.planner.reasoningEffort, "max");
      assert.deepEqual(Policy.allowedModels, [
        "@cf/zai-org/glm-5.3-flash",
        "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
        "@cf/deepseek-ai/deepseek-v4-flash-0731"
      ]);
      assert.deepEqual(Policy.escalation, { enabled: true, max: 1 });
    });
  }
  {
    Check(Count, "W4: an empty allowedModels fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ enabled: true, policy: { allowedModels: [] } })),
        /plugin-dsh-route: policy.allowedModels must be a non-empty array of model ids/
      );
    });
    Check(Count, "W4: a role model outside allowedModels fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ enabled: true, policy: { coder: { model: "@cf/nope/x" } } })),
        /plugin-dsh-route: policy.coder.model "@cf\/nope\/x" is not in policy.allowedModels/
      );
    });
    Check(Count, "W4: a negative escalation.max fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ enabled: true, policy: { escalation: { enabled: true, max: -1 } } })),
        /plugin-dsh-route: policy.escalation.max must be >= 0/
      );
    });
    Check(Count, "W4: a keyword key outside the three roles fails loud at load", () => {
      assert.throws(
        () => Make(Validate({ enabled: true, keywords: { bogus: ["x"] } })),
        /plugin-dsh-route: keywords key "bogus" is not one of "explorer" \| "coder" \| "planner"/
      );
    });
  }
  return Finish(Count, "Wiring-And-Policy");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Wiring-And-Policy`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
