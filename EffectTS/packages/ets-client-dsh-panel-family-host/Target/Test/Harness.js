import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import ClientPluginModule from "../../Target/Client.js";
const ClientPlugin = ClientPluginModule;
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
const MakeRoot = () => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "panel-host-smoke-"));
const Make = (Raw, Services = {}) => {
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Context = {
    get: (Name) => Services[Name],
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
      }
    },
    provide: (Name, Value) => {
      Provided[Name] = Value ?? true;
      return () => true;
    },
    // The fiber seam: the real cordis context owns the disposer of whatever
    // the callback returns; the fixture runs it once and hands back a
    // no-op teardown (the suite asserts the route registration, not the
    // fiber).
    effect: (Callback) => {
      Callback();
      return () => true;
    }
  };
  const Run = {
    Context,
    Lines,
    Warns,
    Provided,
    Raw,
    Services
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.Service = Provided["panelFamilyHost"];
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Put = (Dir, Name, Content) => {
  const File = Path.join(Dir, Name);
  FileSystem.writeFileSync(File, Content, "utf8");
  return File;
};
const Bytes = (File) => FileSystem.readFileSync(File);
const Names = (Dir) => FileSystem.readdirSync(Dir).sort();
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));
const MakeEditor = (Entries) => {
  const Writes = [];
  const Editor = {
    entries: () => Entries,
    edit: async (Entry, Change) => {
      Writes.push({ id: Entry?.options?.id, patch: Change({}, {}) });
    }
  };
  return { Editor, Writes };
};
const MakeEntry = (Id, Schema) => ({
  options: { id: Id, name: `@playform/${Id}` },
  fiber: { runtime: { Config: Schema } }
});
const MakeSchema = (Serialized) => ({
  toJSON: () => Serialized
});
const MakeBus = () => {
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
const MakeClient = (Options = {}) => {
  const Services = {};
  if (Options.remote !== void 0) Services["remote"] = Options.remote;
  const Provided = {};
  const Injects = [];
  const Context = {
    get: (Name) => Services[Name],
    provide: (Name, Value) => {
      Provided[Name] = Value;
      return () => true;
    },
    inject: (Deps, Callback) => {
      Injects.push({ deps: Deps, callback: Callback });
      return () => true;
    },
    // The client fiber seam: the real client context owns the disposer of
    // whatever the callback returns; the fixture runs it once and hands
    // back a no-op teardown.
    effect: (Callback) => {
      Callback();
      return () => true;
    }
  };
  const Run = { Context, Provided, Injects, Services };
  Run.Open = () => {
    for (const Entry of Injects) Entry.callback(Context);
  };
  return Run;
};
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
  const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
  Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
    assert.equal(Run.Returned, void 0);
    assert.ok(Run.Service !== void 0);
    assert.equal(typeof Run.Service.tail, "function");
    assert.equal(typeof Run.Service.stats, "function");
    assert.deepEqual(Run.Lines, ["host: activated (enabled=true)"]);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  BundleSource,
  Bytes,
  Check,
  CheckAsync,
  ClientPlugin,
  Finish,
  LinesWith,
  Make,
  MakeBus,
  MakeClient,
  MakeCounter,
  MakeEditor,
  MakeEntry,
  MakeRoot,
  MakeSchema,
  Names,
  Plugin,
  Put,
  Validate
};
//# sourceMappingURL=Harness.js.map
