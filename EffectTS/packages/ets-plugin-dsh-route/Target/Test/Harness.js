import assert from "node:assert/strict";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";
const MakeCounter = () => ({ N: 0, F: 0 });
const Check = (Count, Label, Assertions) => {
  Count.N++;
  try {
    Assertions();
    console.log(`PASS - ${Label}`);
  } catch (_Error) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(_Error instanceof Error ? _Error.message : String(_Error));
  }
};
const CheckAsync = async (Count, Label, Assertions) => {
  Count.N++;
  try {
    await Assertions();
    console.log(`PASS - ${Label}`);
  } catch (_Error) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(_Error instanceof Error ? _Error.message : String(_Error));
  }
};
const Finish = (Count, Name) => {
  if (Count.F !== 0) {
    throw new Error(`${Name}: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const Make = (Raw, Attach) => {
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const RootNames = [];
  const Root = {
    on: (Name, _Listener) => {
      RootNames.push(Name);
      return () => true;
    }
  };
  let Context;
  Context = {
    pluginFactory: Furnace,
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
      }
    },
    on: (Name, Listener) => {
      CtxListeners[Name] = Listener;
      return () => true;
    },
    get: (Name) => Context[Name],
    effect: (Setup, Label) => {
      Effects.push(Label ?? "unnamed");
      const Disposer = Setup();
      return typeof Disposer === "function" ? Disposer : () => true;
    },
    root: Root,
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value ?? true;
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  const Run = {
    Context,
    Root,
    CtxListeners,
    Lines,
    Warns,
    Provided,
    Effects,
    RootNames,
    Raw
  };
  Attach?.(Context, Run);
  Run.Returned = Plugin.apply(Context, Raw);
  Run.Service = Run.Provided["dshRoute"];
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Fire = async (Run, Exec) => {
  let Called = 0;
  const Decision = { action: "continue", marker: "downstream" };
  const Out = await Run.CtxListeners["tools/pre-execute"](Exec, async () => {
    Called += 1;
    return Decision;
  });
  return { Out, Decision, Called };
};
const Launch = (Args = { description: "fix the bug" }) => ({ name: "subagent", args: JSON.parse(JSON.stringify(Args)) });
const FireStep = async (Run, Payload, Messages = []) => {
  const Decision = { kind: "enter", messages: Messages };
  const Out = await Run.CtxListeners["agent/pre-step"](Payload, async () => Decision);
  return { Out, Decision };
};
const Child = (Options = {}, Depth = 1) => ({
  options: { ...Options, subagentDepth: Depth },
  session: { header: { delegationDepth: Depth } }
});
const Prompt = (Text) => ({
  id: `message-${Text.length}`,
  role: "user",
  content: [{ type: "text", text: Text }],
  source: { kind: "user" }
});
const Coder = {
  provider: "cloudflare-workers-ai",
  model: "@cf/zai-org/glm-5.3-flash",
  reasoningEffort: "high"
};
const Planner = {
  provider: "cloudflare-workers-ai",
  model: "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
  reasoningEffort: "max"
};
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  const Run = Make(Validate({ enabled: true }));
  Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
    assert.ok(Run.CtxListeners["tools/pre-execute"] !== void 0);
    assert.ok(Run.Provided["dshRoute"] !== void 0);
    assert.deepEqual(Run.Lines, [
      `plugin-dsh-route: activated (bundle ${"0.2.1"}, defaultRole=explorer, models=3)`
    ]);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Check,
  CheckAsync,
  Child,
  Coder,
  Finish,
  Fire,
  FireStep,
  Furnace,
  Launch,
  LinesWith,
  Make,
  MakeCounter,
  Planner,
  Plugin,
  Prompt,
  Validate
};
//# sourceMappingURL=Harness.js.map
