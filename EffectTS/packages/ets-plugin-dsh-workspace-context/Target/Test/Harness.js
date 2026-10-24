import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
import FactoryClass from "../../../ets-plugin-dsh-factory/Target/Library.js";
import GraphClass from "../../../ets-plugin-dsh-workspace-graph/Target/Library.js";
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-context-smoke-"));
const Ledger = Path.join(Root, "context.log");
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
const RealGraph = (Files, Options = {}) => {
  const Names = Object.keys(Files);
  const Info = (Display) => {
    const Text = Files[Display];
    if (Text !== void 0) {
      return { version: "v1", type: "file", size: Text.length };
    }
    return Names.some((Key) => Key.startsWith(`${Display}/`)) ? { version: "v1", type: "directory", size: 0 } : void 0;
  };
  const Fs = {
    resolve: async (Path_) => ({ targetKey: Path_, displayPath: Path_ }),
    stat: async (Target) => Info(String(Target.displayPath)),
    readText: async (Target) => {
      const Text = Files[String(Target.displayPath)];
      if (Text === void 0) {
        throw new Error("vanished");
      }
      return Text;
    },
    listDir: async (Target) => {
      const Directory = String(Target.displayPath).replace(/\/$/, "");
      const Found = /* @__PURE__ */ new Set();
      for (const Key of Names) {
        if (!Key.startsWith(`${Directory}/`)) {
          continue;
        }
        Found.add(Key.slice(Directory.length + 1).split("/")[0]);
      }
      return [...Found].sort((Left, Right) => Left.localeCompare(Right)).map((Name) => {
        const Display = `${Directory}/${Name}`;
        const Meta = Info(Display);
        return {
          name: Name,
          type: Meta?.type ?? "other",
          target: { targetKey: Display, displayPath: Display }
        };
      });
    },
    contains: (Parent, Child) => {
      const Left = String(Parent.displayPath);
      const Right = String(Child.displayPath);
      return Right === Left || Right.startsWith(`${Left}/`);
    },
    writeText: async () => {
      throw new Error("writeText must never be called");
    }
  };
  const GraphContext = {
    fs: Fs,
    logger: { info: () => void 0, warn: () => void 0, error: () => void 0 },
    reflect: { provide: () => void 0 }
  };
  GraphContext.root = GraphContext;
  return new GraphClass(GraphContext, GraphClass.Config({ enabled: true, ...Options }));
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
    tools: {
      register: (Definition) => {
        Tools.push(Definition);
      }
    },
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
    Tools,
    Raw,
    Fs
  };
  Attach?.(Context, Run);
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__pluginDshWorkspaceContextState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const LinesWith = (Run, Needle) => Run.Lines.filter((Line) => Line.includes(Needle));
const LedgerWith = (Needle) => LedgerLines().filter((Line) => Line.includes(Needle));
const Throws = (Assertions, Message) => {
  try {
    Assertions();
  } catch (_Error) {
    assert.equal(
      _Error instanceof Error ? _Error.message : String(_Error),
      Message
    );
    return;
  }
  throw new Error(`expected throw: ${Message}`);
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
    assert.ok(Run.Provided.workspaceContext !== void 0);
    assert.ok(Run.State !== void 0);
    assert.deepEqual(Run.Lines, ["context: activated (budget=2000/4000, lenses=3)"]);
    assert.equal(Run.Tools.length, 1);
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
  Finish,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Plugin,
  RealGraph,
  Root,
  Throws,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
