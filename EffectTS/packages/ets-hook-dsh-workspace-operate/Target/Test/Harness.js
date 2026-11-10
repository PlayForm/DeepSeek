import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-operate-smoke-"));
const Ledger = Path.join(Root, "operate.log");
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
const FakeFs = (Files = {}) => {
  const Fs = {
    files: Files,
    writes: [],
    reads: [],
    resolved: [],
    stats: []
  };
  Fs.resolve = async (P) => {
    Fs.resolved.push(P);
    return { targetKey: P, displayPath: P };
  };
  Fs.stat = async (Target) => {
    Fs.stats.push(Target);
    const File = Fs.files[Target.displayPath];
    return File === void 0 ? void 0 : { version: File.version, type: "file" };
  };
  Fs.readText = async (Target) => {
    Fs.reads.push(Target);
    const File = Fs.files[Target.displayPath];
    return File === void 0 ? void 0 : File.text;
  };
  Fs.writeText = async (...Parts) => {
    Fs.writes.push(Parts);
    throw new Error("writeText must never be called");
  };
  return Fs;
};
const FakeGraph = (Nodes, Edges = []) => ({
  find: (Query) => Nodes.filter((Node) => {
    switch (true) {
      case (Query.kind !== void 0 && Node.kind !== Query.kind):
        return false;
      case (Query.name !== void 0 && Node.name !== Query.name):
        return false;
      case (Query.path !== void 0 && Node.path !== Query.path):
        return false;
      default:
        return true;
    }
  }).slice(0, Query.limit ?? Nodes.length),
  expand: (Id) => ({
    nodes: Nodes.filter((Node) => Node.id === Id),
    edges: Edges.filter((Edge) => Edge.from === Id)
  }),
  snapshot: () => ({ indexRevision: "r1", nodes: Nodes, edges: Edges })
});
const Make = (Raw, Graph) => {
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
    },
    emit: () => true
  };
  const Fs = FakeFs({
    "/repo/src/a.ts": { version: "v1", text: "line1\nline2\nline3" },
    "/repo/src/b.ts": { version: "v1", text: "one\ntwo" }
  });
  let Context;
  Context = {
    pluginFactory: Furnace,
    fs: Fs,
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
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
  if (Graph !== void 0) {
    Context.workspaceGraph = Graph;
  }
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
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__hookDshWorkspaceOperateState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const SymbolNode = (Name, Path2, Id = `sym-${Name}`) => ({
  id: Id,
  kind: "Symbol",
  path: Path2,
  name: Name,
  fingerprint: `f-${Name}`,
  version: "v1"
});
const FileNode = (Path2, Id = `file-${Path2}`) => ({
  id: Id,
  kind: "File",
  path: Path2,
  fingerprint: `f-${Id}`,
  version: "v1"
});
const Fire = (Run, Path2, Version, Actor = { agent: { id: "agent-a" } }) => {
  Run.Listeners["fs/observed"](
    { displayPath: Path2, targetKey: Path2 },
    { kind: "present", version: Version },
    Actor
  );
};
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));
const LedgerWith = (Needle) => LedgerLines().filter((L) => L.includes(Needle));
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
    assert.ok(Run.State !== void 0);
    assert.ok(Run.Provided["workspaceOperate"] !== void 0);
    assert.deepEqual(Run.RootNames, ["fs/observed"]);
    assert.deepEqual(Run.Lines, ["operate: activated (domain=workspace_operate)"]);
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
  FakeFs,
  FakeGraph,
  FileNode,
  Finish,
  Fire,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Plugin,
  Root,
  SymbolNode,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
