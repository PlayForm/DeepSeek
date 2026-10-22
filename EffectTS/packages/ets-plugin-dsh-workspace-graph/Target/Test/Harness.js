import assert from "node:assert/strict";
import GraphClass from "../../Target/Library.js";
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
  const writes = [];
  const reads = [];
  const stats = [];
  const loggerLines = [];
  const provided = {};
  const Context = {
    logger: {
      info: (M) => loggerLines.push(M),
      warn: (M) => loggerLines.push(M),
      error: (M) => loggerLines.push(M)
    },
    on: () => () => true,
    reflect: {
      provide: (Name, Value) => {
        provided[Name] = Value;
      }
    },
    fs: {
      resolve: async (Path) => ({ targetKey: Path, displayPath: Path }),
      stat: async (Target) => {
        stats.push(Target.displayPath);
        const Text = files[Target.displayPath];
        if (Text === void 0) {
          return void 0;
        }
        return { version: "v1", type: "file", size: Text.length };
      },
      readText: async (Target) => {
        reads.push(Target.displayPath);
        const Text = files[Target.displayPath];
        if (Text === void 0) {
          throw new Error("vanished");
        }
        return Text;
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
  Contexts.push(Context);
  return { Context, files, writes, reads, stats, loggerLines, provided };
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
  Contexts,
  FakeStorage,
  Finish,
  GraphClass,
  LinesWith,
  Make,
  MakeCounter,
  MakeGraph,
  Settled
};
//# sourceMappingURL=Harness.js.map
