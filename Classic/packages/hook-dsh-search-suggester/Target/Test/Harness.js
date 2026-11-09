import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin, * as Exports from "../../Target/Library.js";
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
const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "search-suggester-home-"));
process.env["HOME"] = Home;
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "search-suggester-smoke-"));
const Ledger = Path.join(Root, "search-suggester.log");
const Knowledge = Path.join(Root, "knowledge.json");
const rm = () => {
  try {
    FileSystem.rmSync(Ledger);
  } catch {
  }
  try {
    FileSystem.rmSync(Knowledge);
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
const Durable = (Message) => new RegExp(
  `^\\[\\d{4}-\\d{2}-\\d{2}T[\\d:.]+Z\\] ${Message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`
);
const DurableLine = (Needle) => {
  const Line = LedgerWith(Needle)[0];
  if (Line === void 0) {
    throw new Error(`no durable ledger line for: ${Needle}`);
  }
  return Line;
};
const FirstLine = () => {
  const Line = LedgerLines()[0];
  if (Line === void 0) {
    throw new Error("the durable ledger is empty");
  }
  return Line;
};
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const MakeProjections = () => {
  const Units = /* @__PURE__ */ new Map();
  const Cells = /* @__PURE__ */ new WeakMap();
  const CellOf = (Session) => {
    let Cell = Cells.get(Session);
    if (Cell === void 0) {
      Cell = /* @__PURE__ */ new Map();
      Cells.set(Session, Cell);
    }
    return Cell;
  };
  const StateOf = (Session, Key) => {
    const Unit = Units.get(Key);
    if (Unit === void 0 || Session === void 0 || Session === null) {
      return void 0;
    }
    const Cell = CellOf(Session);
    if (!Cell.has(Key)) {
      Cell.set(Key, Unit.init({}, 0));
    }
    return Cell.get(Key);
  };
  const Registry = {
    register: (Definition) => {
      Units.set(Definition.key, Definition);
      return Promise.resolve({
        stateOf: (Session) => StateOf(Session, Definition.key)
      });
    },
    stateOf: StateOf
  };
  const Commit2 = (Session, Event) => {
    for (const [Key, Unit] of Units) {
      const Next = Unit.apply(StateOf(Session, Key), Event);
      if (Next !== void 0) {
        CellOf(Session).set(Key, Next);
      }
    }
  };
  return { Registry, Commit: Commit2, StateOf, Units };
};
const Make = (Raw, Prepare) => {
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Effects = [];
  const RootNames = [];
  const Tools = [];
  const Injected = [];
  const Projections = MakeProjections();
  let Ready = Promise.resolve();
  const Root2 = {
    on: (Name, _Listener) => {
      RootNames.push(Name);
      return () => true;
    }
  };
  const Fs = { reads: 0, writes: 0 };
  Fs.readText = async (..._Parts) => {
    Fs.reads++;
    throw new Error("readText must never be called");
  };
  Fs.writeText = async (..._Parts) => {
    Fs.writes++;
    throw new Error("writeText must never be called");
  };
  let Context;
  Context = {
    pluginFactory: Furnace,
    sessionProjections: Projections.Registry,
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
    inject: (Deps, Callback) => {
      Injected.push(Deps);
      try {
        Ready = Promise.resolve(Callback(Context));
      } catch {
      }
      return Ready;
    },
    tools: {
      register: (Definition) => {
        Tools.push(Definition);
        return () => true;
      }
    },
    effect: (Setup2, Label) => {
      Effects.push(Label ?? "unnamed");
      const Disposer = Setup2();
      if (typeof Disposer === "function") {
      }
      return () => true;
    },
    root: Root2,
    reflect: {
      provide: (Name, Value) => {
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  Prepare?.(Context);
  const Run = {
    Context,
    Root: Root2,
    CtxListeners,
    Lines,
    Warns,
    Effects,
    RootNames,
    Fs,
    Raw,
    Tools,
    Injected,
    Projections
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__hookDshSearchSuggesterState;
  Run.Ready = Ready;
  return Run;
};
const FakeGraph = (Nodes, Revision = "r1") => {
  const Calls = { snapshots: 0 };
  return {
    Calls,
    snapshot: () => {
      Calls.snapshots += 1;
      return {
        indexRevision: Revision,
        nodes: Nodes.map((Node) => ({
          id: `${Node.kind}:${Node.path}`,
          kind: Node.kind,
          path: Node.path,
          version: Node.version ?? "1",
          fingerprint: "f"
        })),
        edges: []
      };
    }
  };
};
const Validate = (Raw) => Plugin.Config({
  persistPath: Knowledge,
  ...Raw
});
const Setup = () => {
  rm();
  return Make(Validate({ logFile: Ledger, enabled: true }));
};
const Workspace = (Files) => {
  const Space = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "search-suggester-workspace-"));
  FileSystem.writeFileSync(Path.join(Space, "package.json"), "{}", "utf8");
  for (const Relative of Files) {
    const Full = Path.join(Space, Relative);
    FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
    FileSystem.writeFileSync(Full, "x", "utf8");
  }
  return { Root: Space, At: (Relative) => Path.join(Space, Relative) };
};
const Service = (Cwd) => ({ get: () => Cwd });
const Post = (Run, Exec, Decision = { kind: "allow", additionalContexts: [] }) => Run.CtxListeners["tools/post-execute"](Exec, {}, () => Promise.resolve(Decision));
const Pre = (Run, Payload) => Run.CtxListeners["agent/pre-step"](Payload, () => Promise.resolve("down"));
const Assemble = (Run, Agent) => Run.CtxListeners["system-prompt/assemble"](
  {},
  { agent: Agent },
  () => Promise.resolve({ sections: [{ name: "base", text: "b" }], contexts: [], tools: [], variables: {} })
);
const Agents = /* @__PURE__ */ new Map();
const AgentOf = (Id) => {
  if (!Agents.has(Id)) {
    Agents.set(Id, { id: Id, session: { id: `session-${Id}` } });
  }
  return Agents.get(Id);
};
const Commit = (Run, Id, Path_) => {
  Run.Projections.Commit(AgentOf(Id).session, {
    type: "tool/call",
    seq: 0,
    data: { name: "read", arguments: JSON.stringify({ file_path: Path_ }) }
  });
};
const SeedHistory = (Run, Id, Anchor, Companions) => {
  Commit(Run, Id, Anchor);
  for (const Companion of Companions) {
    Commit(Run, Id, Companion);
  }
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
  const Run = Setup();
  Check(Count, "selfcheck: the fake ctx wires the four listeners and the projection unit", () => {
    assert.deepEqual(Object.keys(Run.CtxListeners), [
      "loader/volatile-update",
      "tools/post-execute",
      "agent/pre-step",
      "system-prompt/assemble",
      "tools/change"
    ]);
    assert.deepEqual(Run.Injected, [["sessionProjections"]]);
    assert.equal(Run.Projections.Units.has("searchHistory"), true);
    assert.deepEqual(Run.RootNames, []);
    assert.equal(Run.Returned, void 0);
    assert.equal(Run.Fs.reads + Run.Fs.writes, 0);
    assert.deepEqual(Run.Lines, [`hook-dsh-search-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.75)`]);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  AgentOf,
  Assemble,
  Check,
  CheckAsync,
  Commit,
  Durable,
  DurableLine,
  Exports,
  FakeGraph,
  Finish,
  FirstLine,
  Furnace,
  Home,
  Knowledge,
  Ledger,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Plugin,
  Post,
  Pre,
  Root,
  SeedHistory,
  Service,
  Setup,
  Validate,
  Workspace,
  rm
};
//# sourceMappingURL=Harness.js.map
