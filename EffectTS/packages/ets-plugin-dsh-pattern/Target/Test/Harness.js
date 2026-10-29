import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import PatternService from "../../Target/Library.js";
const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pattern-smoke-home-"));
process.env["HOME"] = Home;
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
const Settle = async () => {
  for (let Index = 0; Index < 4; Index++) {
    await new Promise((Resolve) => setImmediate(Resolve));
  }
  await new Promise((Resolve) => setTimeout(Resolve, 20));
};
const Make = (Knobs = {}, Attach) => {
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Context = {
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
      }
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
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value ?? true;
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  const Run = { Context, Lines, Warns, Provided, Effects, Disposers };
  Attach?.(Context, Run);
  Run.Service = new PatternService(Context, Knobs);
  return Run;
};
const FakeStorage = (Options = {}) => {
  const Store = {
    spec: void 0,
    version: Options.version ?? 1,
    tables: /* @__PURE__ */ new Map(),
    writes: [],
    failOpen: Options.failOpen === true,
    closed: false
  };
  Store.facility = {
    open: async (Specification) => {
      switch (true) {
        case Store.failOpen:
          throw new Error("storage unavailable");
        case Specification.version !== Store.version:
          throw new Error(
            `version-mismatch: stored ${Store.version}, declared ${Specification.version}`
          );
        default:
      }
      Store.spec = Specification;
      return {
        name: Specification.name,
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
              Store.writes.push([Name, Key]);
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
const Messages = (Run) => Run.Lines.map((Line) => Line.replace(/ \(logFile .*\)$/, ""));
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
  Check(Count, "selfcheck: the fake ctx registers the service and seeds the catalog", () => {
    assert.equal(Run.Provided["pattern"], Run.Service);
    assert.equal(Run.Service.name, "pattern");
    assert.equal(Run.Service.List().length, 4);
    assert.deepEqual(Run.Lines, ["pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)"]);
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
  FakeStorage,
  Finish,
  Home,
  Make,
  MakeCounter,
  Messages,
  PatternService,
  Settle
};
//# sourceMappingURL=Harness.js.map
