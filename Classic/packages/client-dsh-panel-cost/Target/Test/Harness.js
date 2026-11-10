import assert from "node:assert/strict";
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
const Validate = (Raw = {}) => Plugin.Config({ ...Raw });
const Make = (Options = {}) => {
  const Routes = [];
  const Info = [];
  const Warn = [];
  const Provided = { routes: Routes };
  const Seen = { n: 0 };
  const Server = {
    Seen,
    register: (Route) => {
      Seen.n += 1;
      Routes.push(Route);
      return () => true;
    }
  };
  const Services = {};
  if (Options.none !== true) Services["webServer"] = Server;
  const Ctx = {
    get: (Name) => Services[Name],
    logger: {
      info: (Message) => {
        Info.push(Message);
      },
      warn: (Message) => {
        Warn.push(Message);
      },
      error: (Message) => {
        Warn.push(Message);
      },
      debug: () => void 0
    },
    effect: (Setup) => {
      const Disposer = Setup();
      return typeof Disposer === "function" ? Disposer : void 0;
    }
  };
  const Run = { Ctx, Provided, Routes, Server, Services, Info, Warn };
  if (Options.defer !== true) {
    Plugin.apply(Ctx);
  }
  return Run;
};
const MakeClient = () => {
  const Tabs = [];
  const Locales = [];
  const Disposers = [];
  const Effects = [];
  const Info = [];
  const Warn = [];
  const Provided = { tabs: Tabs, locales: Locales, disposers: Disposers };
  const Ctx = {
    get: () => void 0,
    logger: {
      info: (Message) => {
        Info.push(Message);
      },
      warn: (Message) => {
        Warn.push(Message);
      },
      error: (Message) => {
        Warn.push(Message);
      },
      debug: () => void 0
    },
    locale: {
      register: (Namespace, Dictionaries) => {
        Locales.push({ namespace: Namespace, dictionaries: Dictionaries });
        const Disposer = () => true;
        Disposers.push(Disposer);
        return Disposer;
      }
    },
    slots: {
      inject: (Slot, Factory) => {
        Effects.push(`inject ${Slot}`);
        const Disposer = Factory();
        if (typeof Disposer === "function") {
          Disposers.push(Disposer);
        }
        return () => true;
      },
      register: (Registration, Component) => {
        Tabs.push({ options: Registration, component: Component });
        const Disposer = () => true;
        Disposers.push(Disposer);
        return Disposer;
      }
    },
    effect: (Setup, Label) => {
      Effects.push(Label ?? "unnamed");
      Setup();
      return () => true;
    }
  };
  const Run = { Ctx, Provided, Tabs, Locales, Disposers, Effects, Info, Warn };
  ClientPlugin.apply(Ctx);
  return Run;
};
if (process.argv.includes("--selfcheck")) {
  const Count = MakeCounter();
  const HostRun = Make();
  Check(Count, "selfcheck: the fake host ctx registers the route wiring", () => {
    assert.deepEqual(
      HostRun.Provided.routes.map((Route) => Route.path),
      [
        "/api/playform-cost/session",
        "/api/playform-cost/catalogs",
        "/api/playform-cost/rates",
        "/api/playform-cost/publish"
      ]
    );
  });
  const ClientRun = MakeClient();
  Check(
    Count,
    "selfcheck: the fake client ctx registers the tab and the locale wiring",
    () => {
      assert.equal(ClientRun.Provided.tabs.length, 1);
      assert.equal(ClientRun.Provided.tabs[0].options.id, "playform-cost");
      assert.equal(ClientRun.Provided.locales.length, 1);
      assert.equal(ClientRun.Provided.locales[0].namespace, "client-dsh-panel-cost");
    }
  );
  if (Count.F === 0 && Count.N === 2) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Check,
  Client,
  ClientPlugin,
  Finish,
  Library,
  Make,
  MakeClient,
  MakeCounter,
  Plugin,
  Validate
};
//# sourceMappingURL=Harness.js.map
