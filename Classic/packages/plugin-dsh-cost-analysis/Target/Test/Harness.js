import assert from "node:assert/strict";
import Plugin from "../../Target/Library.js";
const MakeCounter = () => ({ N: 0, F: 0 });
const Check = (Count, Label, Assertions) => {
  Count.N++;
  try {
    Assertions();
    console.log(`PASS - ${Label}`);
  } catch (Issue) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(Issue instanceof Error ? Issue.message : String(Issue));
  }
};
const CheckAsync = async (Count, Label, Assertions) => {
  Count.N++;
  try {
    await Assertions();
    console.log(`PASS - ${Label}`);
  } catch (Issue) {
    Count.F++;
    console.log(`FAIL - ${Label}`);
    console.log(Issue instanceof Error ? Issue.message : String(Issue));
  }
};
const Finish = (Count, Name) => {
  if (Count.F !== 0) throw new Error(`${Name}: ${Count.F} failed check(s)`);
  return Count.N;
};
const Make = (Raw) => {
  const Listeners = {};
  const Lines = [];
  const Effects = [];
  const Commands = { Registered: [] };
  Commands.register = (Definition) => void Commands.Registered.push(Definition);
  const Factory = {
    State: (Context2, _Config, Setup) => ({
      Context: Context2,
      Module: Setup?.module ?? "plugin-dsh-cost-analysis",
      Stash: /* @__PURE__ */ new Map(),
      Inflight: /* @__PURE__ */ new Map()
    }),
    Append: (_State, Message) => void Lines.push(Message)
  };
  let Context;
  Context = {
    pluginFactory: Factory,
    commands: Commands,
    tokenMeter: { estimateMessage: () => 10 },
    logger: { info: (M) => void Lines.push(M), warn: (M) => void Lines.push(M) },
    on: (Name, Listener) => {
      Listeners[Name] = Listener;
      return () => true;
    },
    get: (Name) => Context[Name],
    effect: (Setup, Label) => {
      Effects.push(Label ?? "unnamed");
      const Disposer = Setup();
      return typeof Disposer === "function" ? Disposer : () => true;
    },
    Raw
  };
  return { Context, Factory, Commands, Listeners, Lines, Effects, Raw };
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  const Run = Make(Validate({ enabled: true }));
  Check(Count, "selfcheck: a failing assertion counts as FAIL", () => {
    assert.equal(1, 2);
  });
  Check(Count, "selfcheck: the fake ctx carries the spec's surfaces", () => {
    assert.equal(Count.N, 2);
    assert.equal(Count.F, 1);
    assert.equal(typeof Run.Context.on, "function");
    assert.equal(typeof Run.Context.commands.register, "function");
    assert.equal(typeof Run.Factory.Append, "function");
  });
  console.log(Count.N === 2 && Count.F === 1 ? "Harness selfcheck OK" : `Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
  if (Count.N !== 2 || Count.F !== 1) process.exitCode = 1;
}
export {
  Check,
  CheckAsync,
  Finish,
  Make,
  MakeCounter,
  Validate
};
//# sourceMappingURL=Harness.js.map
