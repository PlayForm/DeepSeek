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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-smoke-"));
const Ledger = Path.join(Root, "workspace.log");
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
const LedgerWith = (Needle) => LedgerLines().filter((Line) => Line.includes(Needle));
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const Glob = (Pattern) => {
  const Escaped = Pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const Source = Escaped.replace(/\*\*\//g, "(?:.*/)?").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\?/g, ".");
  return new RegExp(`^${Source}$`);
};
const FakeGraph = (Nodes = [], Edges = [], Revision = "rev-1") => {
  const Find = (Query) => {
    let Matched = Nodes.filter((Node_) => {
      if (Query.kind !== void 0 && Node_.kind !== Query.kind) {
        return false;
      }
      if (Query.name !== void 0 && Node_.name !== Query.name) {
        return false;
      }
      if (Query.pattern !== void 0) {
        const Pattern = Glob(Query.pattern);
        if (!Pattern.test(Node_.id) && !(Node_.path !== void 0 && Pattern.test(Node_.path))) {
          return false;
        }
      }
      return true;
    });
    if (Query.limit !== void 0) {
      Matched = Matched.slice(0, Query.limit);
    }
    return Matched;
  };
  const Outgoing = (Id) => Edges.filter((Edge_) => Edge_.from === Id);
  const Self = {
    indexFile: (_Path) => Promise.resolve({ path: String(_Path), status: "indexed", nodes: 0, edges: 0 }),
    removeFile: (_Path) => Promise.resolve(true),
    getNode: (Id) => Nodes.find((Node_) => Node_.id === Id),
    find: Find,
    expand: (Id, Options) => {
      const Depth = Options?.depth ?? 1;
      const Wanted = Options?.kinds;
      const Seen = /* @__PURE__ */ new Set([Id]);
      const Frontier = [Id];
      const Found = [];
      const FoundEdges = [];
      for (let Level = 0; Level < Depth; Level++) {
        const Next = [];
        for (const Current of Frontier) {
          for (const Edge_ of Outgoing(Current)) {
            if (Wanted !== void 0 && !Wanted.includes(Edge_.kind)) {
              continue;
            }
            FoundEdges.push(Edge_);
            if (!Seen.has(Edge_.to)) {
              Seen.add(Edge_.to);
              Next.push(Edge_.to);
              const Node_ = Nodes.find((N) => N.id === Edge_.to);
              if (Node_ !== void 0) {
                Found.push(Node_);
              }
            }
          }
        }
        Frontier.splice(0, Frontier.length, ...Next);
      }
      return { nodes: Found, edges: FoundEdges };
    },
    snapshot: () => ({ indexRevision: Revision, nodes: Nodes, edges: Edges }),
    statistics: () => ({
      files: Nodes.filter((Node_) => Node_.kind === "File").length,
      nodes: Nodes.length,
      edges: Edges.length,
      indexRevision: Revision
    })
  };
  return Object.assign(Self, { graph: { nodes: Nodes, edges: Edges } });
};
const StandardGraph = () => {
  const Node = (Id, Kind, Path2, Extra = {}) => ({
    id: Id,
    kind: Kind,
    path: Path2,
    fingerprint: `fp-${Id}`,
    version: "1",
    ...Extra
  });
  return FakeGraph(
    [
      Node("File:src/a.ts", "File", "src/a.ts", { span: { startLine: 1, endLine: 20 } }),
      Node("File:src/b.ts", "File", "src/b.ts", { span: { startLine: 1, endLine: 4 } }),
      Node("Doc:src/a.ts", "DocSection", "src/a.ts", { name: "Module A" }),
      Node("Symbol:a", "Symbol", "src/a.ts", { name: "aFn", span: { startLine: 1, endLine: 9 } }),
      Node("Symbol:b", "Symbol", "src/b.ts", { name: "bFn", span: { startLine: 1, endLine: 4 } })
    ],
    [
      { kind: "contains", from: "File:src/a.ts", to: "Symbol:a" },
      { kind: "contains", from: "File:src/b.ts", to: "Symbol:b" },
      { kind: "imports", from: "File:src/a.ts", to: "File:src/b.ts" }
    ]
  );
};
const Make = (Raw, Graph) => {
  const Registered = [];
  const CtxListeners = {};
  const RootListeners = {};
  const RootEmits = [];
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Fs = {
    resolves: [],
    stats: [],
    reads: [],
    writes: []
  };
  const ThrowFs = {
    ...Fs,
    resolve: async (P) => {
      Fs.resolves.push(P);
      throw new Error("resolve must never be called");
    },
    stat: async (T) => {
      Fs.stats.push(T?.displayPath ?? String(T));
      throw new Error("stat must never be called");
    },
    readText: async (T) => {
      Fs.reads.push(T?.displayPath ?? String(T));
      throw new Error("readText must never be called");
    },
    writeText: async (T) => {
      Fs.writes.push(T?.displayPath ?? String(T));
      throw new Error("writeText must never be called");
    }
  };
  const Root2 = {
    on: (Name, Listener) => {
      RootListeners[Name] = Listener;
      return () => true;
    },
    emit: (Name, ...Args) => {
      RootEmits.push([Name, ...Args]);
    }
  };
  let Context;
  Context = {
    pluginFactory: Furnace,
    workspaceGraph: Graph,
    tools: {
      register: (Definition) => {
        Registered.push(Definition);
        return () => true;
      }
    },
    fs: ThrowFs,
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
      Setup();
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
    RootListeners,
    RootEmits,
    CtxListeners,
    Lines,
    Warns,
    Provided,
    Effects,
    Registered,
    Raw,
    Fs: ThrowFs,
    Graph
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__pluginDshWorkspaceState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Tool = (Run, Name) => Run.Registered.find((Definition) => Definition.name === Name);
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
  const Run = Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
  Check(Count, "selfcheck: the fake ctx registers the four navigation tools", () => {
    assert.deepEqual(
      Run.Registered.map((Definition) => Definition.name),
      ["workspace_map", "workspace_find", "workspace_expand", "workspace_context"]
    );
    assert.ok(Run.State !== void 0);
    assert.deepEqual(Run.Lines, ["plugin-dsh-workspace: activated (bundle 0.1.0, tools=4)"]);
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
  FakeGraph,
  Finish,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Plugin,
  Root,
  StandardGraph,
  Tool,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
