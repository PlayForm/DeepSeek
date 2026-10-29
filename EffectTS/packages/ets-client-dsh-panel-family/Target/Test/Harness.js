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
const Make = (Options = {}) => {
  const Locale = [];
  const Injects = {};
  const Registered = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Services = {};
  const Info = [];
  const Warn = [];
  if (Options.trace !== void 0) Services["trace"] = Options.trace;
  if (Options.configForms !== void 0) Services["configForms"] = Options.configForms;
  if (Options.bridge !== void 0) Services["panelFamilyBridge"] = Options.bridge;
  if (Options.remote !== void 0) Services["remote"] = Options.remote;
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
    locale: {
      register: (Namespace, Dictionaries) => {
        Locale.push({ namespace: Namespace, dictionaries: Dictionaries });
        return () => true;
      }
    },
    slots: {
      inject: (Slot, Factory) => {
        Injects[Slot] = [...Injects[Slot] ?? [], Factory];
        return () => true;
      },
      register: (Registration, Component) => {
        Registered.push({ options: Registration, component: Component });
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
    Disposers,
    Services,
    Info,
    Warn
  };
  ClientPlugin.apply(Ctx);
  Run.OpenSlot = (Slot) => {
    const Before = Registered.length;
    for (const Factory of Injects[Slot] ?? []) {
      Factory();
    }
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
const MakeForms = (Namespaces, Writable = true) => {
  const Listeners = /* @__PURE__ */ new Set();
  const Snapshot = {
    status: "ready",
    view: { namespaces: Namespaces, writable: Writable },
    error: null
  };
  const Mutations = [];
  const Forms = {
    describe: () => ({
      getSnapshot: () => Snapshot,
      subscribe: (Listener) => {
        Listeners.add(Listener);
        return () => {
          Listeners.delete(Listener);
        };
      },
      ensure: async () => {
      }
    }),
    get: (Namespace) => {
      const View = Namespaces.find((Entry) => Entry.ns === Namespace);
      return {
        getSnapshot: () => ({
          status: View === void 0 ? "unavailable" : "ready",
          value: View?.value,
          base: View?.base,
          user: View?.user,
          revision: View?.revision,
          writable: Writable
        }),
        subscribe: (Listener) => {
          Listeners.add(Listener);
          return () => {
            Listeners.delete(Listener);
          };
        },
        set: async (Field, Value) => {
          Mutations.push({
            namespace: Namespace,
            ops: [{ op: "set", path: [Field], value: Value }],
            revision: void 0
          });
          return true;
        },
        unset: async (Field) => {
          Mutations.push({
            namespace: Namespace,
            ops: [{ op: "unset", path: [Field] }],
            revision: void 0
          });
          return true;
        },
        mutate: async (Operations, Revision) => {
          Mutations.push({
            namespace: Namespace,
            ops: Operations,
            revision: Revision
          });
          return true;
        }
      };
    }
  };
  return {
    Forms,
    Mutations,
    Notify: () => {
      for (const Listener of Listeners) Listener();
    }
  };
};
const MakeBridge = () => {
  const Writes = [];
  return {
    Writes,
    Bridge: {
      editFull: async (Namespace, Patch) => {
        Writes.push({ namespace: Namespace, patch: Patch });
        return true;
      }
    }
  };
};
const BuiltClientSource = () => FileSystem.readFileSync(new URL("../Client.js", import.meta.url), "utf8");
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
    assert.equal(Run.Provided["playformFamilyPanel"] !== void 0, true);
    assert.deepEqual(Run.Effects, [
      "panel: dictionaries",
      "panel: trace source",
      "panel: family tab",
      "panel: overlay mount",
      "panel: adapter adapter-hook-dsh-normalize-dash",
      "panel: adapter adapter-hook-dsh-tool-coach",
      "panel: adapter adapter-hook-dsh-convention-suggester",
      "panel: adapter adapter-hook-dsh-normalize-quotes",
      "panel: adapter adapter-hook-dsh-normalize-ellipsis",
      "panel: adapter adapter-hook-dsh-normalize-spaces",
      "panel: adapter adapter-hook-dsh-normalize-invisible",
      "panel: adapter adapter-hook-dsh-normalize-fullwidth",
      "panel: adapter adapter-plugin-dsh-normalize-file",
      "panel: adapter adapter-hook-dsh-package-governor",
      "panel: adapter adapter-hook-dsh-package-pinner",
      "panel: adapter adapter-hook-dsh-cargo-governor",
      "panel: adapter adapter-hook-dsh-ccr"
    ]);
    assert.equal(Run.Locale.length, 1);
    assert.deepEqual(Object.keys(Run.Injects), [
      "conversation.view",
      "shell.overlay",
      "playform.panel.section"
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
  BuiltClientSource,
  BundleSource,
  Check,
  Client,
  ClientPlugin,
  Finish,
  Library,
  Make,
  MakeBridge,
  MakeCounter,
  MakeForms,
  MakeTrace,
  Plugin,
  Validate
};
//# sourceMappingURL=Harness.js.map
