import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
await import("./Alias-Hooks.js");
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
const Library = await import("../../Target/Library.js");
const Client = await import("../../Target/Client.js");
const Plugin = Library.default;
const ClientPlugin = Client.default;
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Make = (Options = {}) => {
  const Locale = [];
  const Injects = {};
  const Registered = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Services = {};
  if (Options.registry !== void 0) Services["playformFamilyPanel"] = Options.registry;
  if (Options.trace !== void 0) Services["trace"] = Options.trace;
  const Ctx = {
    get: (Name) => Services[Name],
    locale: {
      register: (Namespace, Dictionaries) => {
        Locale.push({ namespace: Namespace, dictionaries: Dictionaries });
        return () => true;
      }
    },
    slots: {
      inject: (Slot, Factory) => {
        Injects[Slot] = Factory;
        return () => true;
      },
      register: (Options2, Component) => {
        Registered.push({ options: Options2, component: Component });
        return () => true;
      }
    },
    effect: (Setup, Label) => {
      Effects.push(Label ?? "unnamed");
      const Disposer = Setup();
      if (typeof Disposer === "function") {
        Disposers.push(Disposer);
      }
      return () => true;
    },
    provide: (Name, Value) => {
      Provided[Name] = Value;
      return () => true;
    }
  };
  const Run = {
    Ctx,
    Locale,
    Injects,
    Registered,
    Provided,
    Effects,
    Disposers,
    Services
  };
  ClientPlugin.apply(Ctx);
  Run.OpenSlot = (Slot) => {
    const Before = Registered.length;
    Injects[Slot]();
    return Registered.slice(Before);
  };
  return Run;
};
const MakeTrace = () => {
  const Listeners = /* @__PURE__ */ new Map();
  const Ring = [];
  let Sequence = 0;
  return {
    on: (Kind, Listener) => {
      let Subscribers = Listeners.get(Kind);
      if (Subscribers === void 0) {
        Subscribers = /* @__PURE__ */ new Set();
        Listeners.set(Kind, Subscribers);
      }
      Subscribers.add(Listener);
      return () => {
        Subscribers?.delete(Listener);
      };
    },
    ring: (Limit) => [...Ring].reverse().slice(0, Limit ?? 256),
    emit: (Kind, Payload) => {
      Sequence += 1;
      const Envelope = {
        trace: `trace-${Sequence}`,
        kind: Kind,
        at: Sequence,
        payload: Payload
      };
      Ring.push(Envelope);
      for (const Listener of Listeners.get(Kind) ?? []) Listener(Envelope);
      return Envelope;
    }
  };
};
const MakeRegistry = () => {
  const Registered = [];
  return {
    Registered,
    register: (Section) => {
      Registered.push(Section);
      return () => void 0;
    },
    unregister: () => void 0,
    entries: () => Registered.slice(),
    subscribe: () => () => void 0,
    getVersion: () => Registered.length,
    open: () => void 0
  };
};
const BuiltSource = (Relative) => FileSystem.readFileSync(new URL(Relative, import.meta.url), "utf8");
const BundleSource = () => FileSystem.readFileSync(new URL("../Client.bundle.js", import.meta.url), "utf8");
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  const Run = Make();
  Check(Count, "selfcheck: the fake ctx registers the client apply wiring", () => {
    assert.equal(Run.Provided["workspaceLive"] !== void 0, true);
    assert.deepEqual(Run.Effects, ["live: dictionaries", "live: workspace tab"]);
    assert.equal(Run.Locale.length, 1);
    assert.deepEqual(Object.keys(Run.Injects), ["conversation.view"]);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  BuiltSource,
  BundleSource,
  Check,
  CheckAsync,
  Client,
  ClientPlugin,
  Finish,
  Library,
  Make,
  MakeCounter,
  MakeRegistry,
  MakeTrace,
  Plugin,
  Validate
};
//# sourceMappingURL=Harness.js.map
