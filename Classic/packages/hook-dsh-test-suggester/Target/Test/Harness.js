import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
const Package = fileURLToPath(new URL("../../../hook-dsh-ccr/", import.meta.url));
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
const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-home-"));
process.env["HOME"] = Home;
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-smoke-"));
const Ledger = Path.join(Root, "test-suggester.log");
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
    reads: [],
    resolved: [],
    stats: []
  };
  Fs.resolve = async (P) => {
    Fs.resolved.push(P);
    throw new Error("resolve must never be called");
  };
  Fs.stat = async (...Parts) => {
    Fs.stats.push(Parts);
    throw new Error("stat must never be called");
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
const Make = (Raw) => {
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Injected = [];
  const Projections = MakeProjections();
  const Fs = FakeFs();
  const RootObj = { on: () => () => true };
  let Ready = Promise.resolve();
  let Context;
  Context = {
    pluginFactory: Furnace,
    sessionProjections: Projections.Registry,
    workingDirectory: { get: () => Package },
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
    effect: (Setup2, Label) => {
      Effects.push(Label ?? "unnamed");
      const Disposer = Setup2();
      if (typeof Disposer === "function") {
        Disposers.push(Disposer);
      }
      return () => true;
    },
    root: RootObj,
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
    Root: RootObj,
    CtxListeners,
    Lines,
    Warns,
    Provided,
    Effects,
    Disposers,
    Raw,
    Fs,
    Injected,
    Projections
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__testSuggesterState;
  Run.Ready = Ready;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, threshold: 0.5, ...Config }));
};
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
    data: { name: "write", arguments: JSON.stringify({ file_path: Path_ }) }
  });
};
const Call = async (Run, Name, Arguments, Agent = AgentOf("agent-a"), Decision = { kind: "allow" }) => Run.CtxListeners["tools/post-execute"](
  { name: Name, arguments: Arguments, agent: Agent },
  void 0,
  async () => Decision
);
const PreStep = async (Run, Agent = AgentOf("agent-a"), Messages = [{ role: "user" }]) => Run.CtxListeners["agent/pre-step"]({ agent: Agent, messages: Messages }, async () => ({
  kind: "allow"
}));
const Write = /* @__PURE__ */ Symbol.for("cosmokit.volatile.write");
const Flip = (CellValue, New) => {
  const Cell = CellValue;
  if (typeof Cell?.[Write] !== "function") {
    throw new Error("Flip: not a volatile cell (no cosmokit write symbol)");
  }
  Cell[Write](New);
};
const Volatile = (Run, Key) => Run.Raw[Key];
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
  Check(Count, "selfcheck: the fake ctx wires the two listeners and the projection unit", () => {
    assert.equal(Run.Returned, void 0);
    assert.deepEqual(Object.keys(Run.CtxListeners), [
      "loader/volatile-update",
      "tools/post-execute",
      "agent/pre-step"
    ]);
    assert.deepEqual(Run.Injected, [["sessionProjections"]]);
    assert.equal(Run.Projections.Units.has("testHistory"), true);
    assert.ok(Run.State !== void 0);
    assert.ok(
      Run.Lines.includes(`test-suggester: activated (bundle ${"0.2.1"}, history, threshold 0.75)`)
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
  AgentOf,
  Call,
  Check,
  CheckAsync,
  Commit,
  FakeFs,
  Finish,
  Flip,
  Furnace,
  Home,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Plugin,
  PreStep,
  Root,
  Setup,
  Validate,
  Volatile,
  rm
};
//# sourceMappingURL=Harness.js.map
