import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Names as TraceNames } from "@playform/ets-lib-dsh-trace";
import CreateTrace from "../../../ets-plugin-dsh-factory/Target/Function/Trace.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";
import GraphClass from "../../Target/Library.js";
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
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
const Contexts = [];
const Make = (Raw = {}) => {
  const files = Raw.files ?? {};
  const disk = Raw.disk;
  const writes = [];
  const reads = [];
  const stats = [];
  const loggerLines = [];
  const provided = {};
  const handlers = {};
  const effects = [];
  const disposers = [];
  const subscriptions = /* @__PURE__ */ new Map();
  const Trace = CreateTrace();
  const Subscribe = Trace.on.bind(Trace);
  Trace.on = (Name, Listener) => {
    subscriptions.set(Name, (subscriptions.get(Name) ?? 0) + 1);
    const Dispose = Subscribe(Name, Listener);
    return () => {
      subscriptions.set(Name, Math.max(0, (subscriptions.get(Name) ?? 1) - 1));
      Dispose();
    };
  };
  const Display = (P) => disk === void 0 ? P : Path.resolve(disk, P);
  const Identity = (P) => {
    const Absolute = Display(P);
    if (disk === void 0) {
      return Absolute;
    }
    try {
      return FileSystem.realpathSync(Absolute);
    } catch {
      return Absolute;
    }
  };
  const Info = (Target) => {
    if (disk === void 0) {
      const Text = files[Target.displayPath];
      if (Text !== void 0) {
        return { version: "v1", type: "file", size: Text.length };
      }
      return Object.keys(files).some((Key) => Key.startsWith(`${Target.displayPath}/`)) ? { version: "v1", type: "directory", size: 0 } : void 0;
    }
    try {
      const Stat = FileSystem.statSync(String(Target.targetKey));
      return {
        version: `${Stat.mtimeMs}-${Stat.size}`,
        type: Stat.isFile() ? "file" : Stat.isDirectory() ? "directory" : "other",
        size: Stat.size
      };
    } catch {
      return void 0;
    }
  };
  const Children = (Target) => {
    const Directory = String(Target.displayPath).replace(/\/$/, "");
    if (disk !== void 0) {
      try {
        return FileSystem.readdirSync(String(Target.targetKey), { withFileTypes: true }).map(
          (Entry) => {
            const ChildDisplay = Path.join(Directory, Entry.name);
            return { name: Entry.name, display: ChildDisplay };
          }
        );
      } catch {
        throw new Error(`cannot list ${Directory}: not found`);
      }
    }
    const Names = /* @__PURE__ */ new Set();
    for (const Key of Object.keys(files)) {
      if (!Key.startsWith(`${Directory}/`)) {
        continue;
      }
      Names.add(Key.slice(Directory.length + 1).split("/")[0]);
    }
    return [...Names].sort((Left, Right) => Left.localeCompare(Right)).map((Name) => ({
      name: Name,
      display: `${Directory}/${Name}`
    }));
  };
  const Context = {
    pluginFactory: Furnace,
    logger: {
      info: (M) => loggerLines.push(M),
      warn: (M) => loggerLines.push(M),
      error: (M) => loggerLines.push(M)
    },
    on: (Name, Listener) => {
      (handlers[Name] ??= []).push(Listener);
      return () => true;
    },
    // The trace seam: the REAL bus from the factory's built Target, with
    // its `on` wrapped to count live subscriptions (the mechanism assertion
    // - the graph consumes `observe/stamp` from the bus, not from a direct
    // root fs/observed registration). `get` is the optional-service probe
    // the adapter uses; `effect` runs its setup at once and records the
    // disposer (the adapter's unload path).
    trace: Trace,
    get: (Name) => Context[Name],
    effect: (Setup, Label) => {
      effects.push(Label ?? "unnamed");
      const Disposer = Setup();
      if (typeof Disposer === "function") {
        disposers.push(Disposer);
      }
      return () => true;
    },
    reflect: {
      provide: (Name, Value) => {
        provided[Name] = Value;
        Context[Name] = Value;
      }
    },
    fs: {
      resolve: async (P) => ({ targetKey: Identity(P), displayPath: Display(P) }),
      stat: async (Target) => {
        stats.push(Target.displayPath);
        return Info(Target);
      },
      // The path form is accepted too (a sibling plugin reads by path -
      // the semantics service's readText takes a string): the same fake
      // file is served either way.
      readText: async (Target) => {
        const Display_ = typeof Target === "string" ? Display(Target) : Target.displayPath;
        const Key = typeof Target === "string" ? Identity(Target) : String(Target.targetKey);
        reads.push(Display_);
        if (disk !== void 0) {
          try {
            return FileSystem.readFileSync(Key, "utf8");
          } catch {
            throw new Error("vanished");
          }
        }
        const Text = files[Display_];
        if (Text === void 0) {
          throw new Error("vanished");
        }
        return Text;
      },
      listDir: async (Target) => Children(Target).sort((Left, Right) => Left.name.localeCompare(Right.name)).map((Child) => {
        const Resolved = {
          targetKey: Identity(Child.display),
          displayPath: Child.display
        };
        const Meta = Info(Resolved);
        return {
          name: Child.name,
          type: Meta?.type ?? "other",
          target: Resolved,
          ...Meta === void 0 ? {} : { version: Meta.version }
        };
      }),
      contains: (Parent, Child) => {
        const Left = String(Parent.targetKey);
        const Right = String(Child.targetKey);
        return Right === Left || Right.startsWith(`${Left}${Path.sep}`) || Right.startsWith(`${Left}/`);
      },
      writeText: async (Target, Content) => {
        writes.push({ path: Target.displayPath, content: Content });
        return { operation: "update", version: "v2", before: null, after: Content };
      }
    },
    get root() {
      return Context;
    }
  };
  Context.__writeCapture = writes;
  Context.__handlers = handlers;
  Contexts.push(Context);
  return {
    Context,
    files,
    writes,
    reads,
    stats,
    loggerLines,
    provided,
    Trace,
    effects,
    disposers,
    subscriptions
  };
};
const Emit = (Run, Target, Observation = { kind: "present", version: "v2" }, Actor) => {
  const Version = Observation?.kind === "present" ? String(Observation.version) : "absent";
  Run.Context.trace.emit({
    kind: TraceNames.observe,
    payload: {
      path: typeof Target?.displayPath === "string" ? Target.displayPath : "",
      version: Version,
      origin: "fs/observed"
    },
    actor: Actor
  });
};
const Handlers = (Run, Name) => (Run.Context.__handlers?.[Name] ?? []).length;
const Subscribers = (Run, Name) => Run.subscriptions?.get(Name) ?? 0;
const Tree = (Files) => {
  const Base = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-graph-"));
  const Root = Path.join(Base, "ws");
  for (const [Relative, Text] of Object.entries(Files)) {
    const Absolute = Path.join(Root, Relative);
    FileSystem.mkdirSync(Path.dirname(Absolute), { recursive: true });
    FileSystem.writeFileSync(Absolute, Text);
  }
  return { root: Root, outside: Base };
};
const MakeGraph = (Raw = {}, Storage) => {
  const Run = Make({ ...Raw, files: { ...Raw.files ?? {} } });
  if (Storage !== void 0) {
    Run.Context.storage = { domain: Storage.facility };
    Run.Context.storageDomain = Storage.facility;
  }
  Run.Graph = new GraphClass(Run.Context, GraphClass.Config({ ...Raw }));
  Run.State = Run.Context.__workspaceGraphState;
  return Run;
};
const MakeDisk = (Root, Raw = {}) => MakeGraph({ ...Raw, disk: Root });
const Settled = async (Run) => {
  await Run.State.Opened;
};
const FakeStorage = () => {
  const Store = {
    spec: void 0,
    records: /* @__PURE__ */ new Map()
  };
  Store.facility = {
    open: async (Spec) => {
      Store.spec = Spec;
      return {
        name: Spec.name,
        close: async () => {
          Store.closed = true;
        },
        table: () => ({
          get: (Key) => Store.records.get(Key),
          entries: () => Store.records.entries(),
          keys: () => Store.records.keys(),
          get size() {
            return Store.records.size;
          },
          put: async (Key, Value) => {
            Store.records.set(Key, Value);
          },
          delete: async (Key) => Store.records.delete(Key)
        })
      };
    }
  };
  Store.seed = (Key, Value) => {
    Store.records.set(Key, Value);
  };
  return Store;
};
const LinesWith = (Run, Needle) => Run.loggerLines.filter((L) => L.includes(Needle));
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  const Run = MakeGraph({ files: {} });
  Check(Count, "selfcheck: the fake ctx registers the service instance", () => {
    assert.equal(Run.provided["workspaceGraph"], Run.Graph);
    assert.equal(Run.Graph.name, "workspaceGraph");
    assert.ok(
      Run.loggerLines.some((L) => L === "graph: activated (domain=workspace_graph, languages=3)")
    );
  });
  const Enabled = MakeGraph({ files: {}, enabled: true });
  Check(Count, "selfcheck: the enabled graph wires the trace adapter (observe/stamp)", () => {
    assert.equal(Subscribers(Enabled, "observe/stamp"), 1);
    assert.equal(Handlers(Enabled, "fs/observed"), 0, "no direct root registration");
  });
  if (Count.N === 4 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Check,
  CheckAsync,
  Contexts,
  Emit,
  FakeStorage,
  Finish,
  Furnace,
  GraphClass,
  Handlers,
  LinesWith,
  Make,
  MakeCounter,
  MakeDisk,
  MakeGraph,
  Settled,
  Subscribers,
  Tree
};
//# sourceMappingURL=Harness.js.map
