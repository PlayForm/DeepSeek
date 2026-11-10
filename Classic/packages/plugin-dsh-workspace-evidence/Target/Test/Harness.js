import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-evidence-smoke-"));
const Ledger = Path.join(Root, "evidence.log");
const rm = () => {
  try {
    FileSystem.rmSync(Ledger);
  } catch {
  }
};
const LedgerLines = () => (() => {
  try {
    return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
  } catch {
    return [];
  }
})();
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const FakeFs = () => {
  const Fs = {
    writes: [],
    reads: []
  };
  Fs.writeText = async (...Parts) => {
    Fs.writes.push(Parts);
    throw new Error("writeText must never be called");
  };
  Fs.readText = async (...Parts) => {
    Fs.reads.push(Parts);
    throw new Error("readText must never be called");
  };
  return Fs;
};
const FakeStorage = (Options = {}) => {
  const Store = {
    spec: void 0,
    tables: /* @__PURE__ */ new Map(),
    failOpen: Options.failOpen === true
  };
  Store.facility = {
    open: async (Specification) => {
      if (Store.failOpen) {
        throw new Error("storage unavailable");
      }
      Store.spec = Specification;
      return {
        close: async () => {
          Store.closed = true;
        },
        table: (Name) => {
          if (!Store.tables.has(Name)) {
            Store.tables.set(Name, /* @__PURE__ */ new Map());
          }
          const Rows = Store.tables.get(Name);
          return {
            put: async (Key, Value) => {
              Rows.set(Key, Value);
            },
            entries: () => Rows.entries(),
            keys: () => Rows.keys(),
            get: (Key) => Rows.get(Key),
            delete: async (Key) => Rows.delete(Key),
            get size() {
              return Rows.size;
            }
          };
        }
      };
    }
  };
  Store.seed = (Name, Key, Value) => {
    if (!Store.tables.has(Name)) {
      Store.tables.set(Name, /* @__PURE__ */ new Map());
    }
    Store.tables.get(Name).set(Key, Value);
  };
  return Store;
};
const Make = (Raw, Attach) => {
  const Listeners = {};
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const RootNames = [];
  const Root2 = {
    on: (Name, Listener) => {
      RootNames.push(Name);
      Listeners[Name] = Listener;
      return () => true;
    }
  };
  const Fs = FakeFs();
  let Context;
  Context = {
    pluginFactory: Furnace,
    fs: Fs,
    logger: {
      info: (Message) => {
        Lines.push(Message);
      },
      warn: (Message) => {
        Warns.push(Message);
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
      if (typeof Disposer === "function") {
        Disposers.push(Disposer);
      }
      return () => true;
    },
    root: Root2,
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
    Root: Root2,
    Listeners,
    CtxListeners,
    Lines,
    Warns,
    Provided,
    Effects,
    Disposers,
    RootNames,
    Raw,
    Fs
  };
  Attach?.(Context, Run);
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__pluginDshWorkspaceEvidenceState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Fire = (Run, Path2, Kind = "present", Actor = { agent: { id: "agent-a" } }) => {
  Run.Listeners["fs/observed"](
    Path2 === null ? null : { displayPath: Path2, targetKey: Path2 },
    Kind === null ? null : { kind: Kind, version: "1" },
    Actor
  );
};
const LinesWith = (Run, Needle) => Run.Lines.filter((Line) => Line.includes(Needle));
const LedgerWith = (Needle) => LedgerLines().filter((Line) => Line.includes(Needle));
const OpenStorage = async (Run, Facility) => {
  const Storage = await import("../../Target/Function/Storage.js");
  await Storage.default(Run.State, Facility);
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  rm();
  const Run = Make(Validate({ logFile: Ledger, enabled: true }));
  Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
    assert.equal(Run.Returned, void 0);
    assert.ok(Run.Provided.workspaceEvidence !== void 0);
    assert.ok(Run.State !== void 0);
    assert.deepEqual(Run.RootNames, ["fs/observed"]);
    assert.deepEqual(Run.Effects, ["evidence-storage"]);
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
  FakeFs,
  FakeStorage,
  Finish,
  Fire,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  OpenStorage,
  Plugin,
  Root,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
