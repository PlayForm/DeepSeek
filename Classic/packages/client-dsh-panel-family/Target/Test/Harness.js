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
const Make = () => {
  const Locale = [];
  const Injects = {};
  const Registered = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Ctx = {
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
      register: (Options, Component) => {
        Registered.push({ options: Options, component: Component });
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
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value;
        return () => true;
      }
    }
  };
  const Run = {
    Ctx,
    Locale,
    Injects,
    Registered,
    Provided,
    Effects,
    Disposers
  };
  ClientPlugin.apply(Ctx);
  Run.OpenSlot = (Slot) => {
    const Before = Registered.length;
    Injects[Slot]();
    return Registered.slice(Before);
  };
  return Run;
};
const BuiltClientSource = () => FileSystem.readFileSync(new URL("../Client.js", import.meta.url), "utf8");
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
    assert.equal(Run.Provided["playformFamilyPanel"] !== void 0, true);
    assert.deepEqual(Run.Effects, ["panel: dictionaries", "panel: family tab", "panel: overlay mount"]);
    assert.equal(Run.Locale.length, 1);
    assert.deepEqual(Object.keys(Run.Injects), ["conversation.view", "shell.overlay"]);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  BuiltClientSource,
  Check,
  Client,
  ClientPlugin,
  Finish,
  Library,
  Make,
  MakeCounter,
  Plugin,
  Validate
};
//# sourceMappingURL=Harness.js.map
