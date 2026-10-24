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
const Finish = (Count, Name) => {
  if (Count.F !== 0) {
    throw new Error(`${Name}: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "queue-smoke-"));
const Ledger = Path.join(Root, "queue.log");
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
    files: {},
    targets: /* @__PURE__ */ new Map(),
    writes: [],
    reads: [],
    resolved: [],
    stats: []
  };
  Fs.resolve = async (P) => {
    Fs.resolved.push(P);
    const Target = { targetKey: P, displayPath: P };
    Fs.targets.set(P, Target);
    return Target;
  };
  Fs.stat = async (Target) => {
    Fs.stats.push(Target);
    return Fs.files[Target.displayPath] === void 0 ? void 0 : { version: Fs.files[Target.displayPath], type: "file" };
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
const Make = (Raw, Attach) => {
  const Listeners = {};
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const RootNames = [];
  const Tools = [];
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
    },
    tools: {
      register: (Definition) => {
        Tools.push(Definition);
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
    Tools,
    Raw,
    Fs
  };
  Attach?.(Context, Run);
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__pluginDshQueueState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Write = /* @__PURE__ */ Symbol.for("cosmokit.volatile.write");
const Flip = (CellValue, New) => {
  const Cell = CellValue;
  if (typeof Cell?.[Write] !== "function") {
    throw new Error("Flip: not a volatile cell (no cosmokit write symbol)");
  }
  Cell[Write](New);
};
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));
const LedgerWith = (Needle) => LedgerLines().filter((L) => L.includes(Needle));
const FakeSubagents = () => {
  const Calls = [];
  const Results = [];
  const Disposed = [];
  return {
    calls: Calls,
    results: Results,
    disposed: Disposed,
    startActivation: async (Spec) => {
      Calls.push(Spec);
      let Settle = {};
      const Result = new Promise((Resolve, Reject) => {
        Settle = { resolve: Resolve, reject: Reject };
      });
      Results.push(Settle);
      const Child = `child-${Calls.length}`;
      return {
        childId: Child,
        messageId: `message-${Calls.length}`,
        result: Result,
        dispose: async () => {
          Disposed.push(Child);
        }
      };
    }
  };
};
const FakeAgents = (Parent = { id: "parent" }) => {
  const Live = /* @__PURE__ */ new Set();
  return {
    live: Live,
    parent: Parent,
    currentInitiator: () => Parent,
    get: (Id) => Live.has(Id) ? { id: Id } : void 0
  };
};
const Automation = (Config = {}, Agents = FakeAgents(), Subagents = FakeSubagents()) => {
  rm();
  const Run = Make(
    Validate({
      logFile: Ledger,
      enabled: true,
      autoSpawn: true,
      policy: { spawn: "auto" },
      ...Config
    }),
    (Context) => {
      Context.subagents = Subagents;
      if (Agents !== void 0) {
        Context.agents = Agents;
      }
    }
  );
  return { Run, Service: Run.Context.dshQueue, Subagents, Agents };
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
    assert.deepEqual(Run.RootNames, []);
    assert.ok(Run.Provided["dshQueue"] !== void 0);
    assert.deepEqual(Run.Tools.map((T) => T.name), ["queue_enqueue", "queue_status"]);
    assert.deepEqual(Run.Lines, [
      "plugin-dsh-queue: activated (bundle 0.1.0, capacity=main=10 child=2, routedDispatch=true)"
    ]);
    assert.ok(Run.State !== void 0);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Automation,
  Check,
  FakeAgents,
  FakeFs,
  FakeSubagents,
  Finish,
  Flip,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Plugin,
  Root,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
