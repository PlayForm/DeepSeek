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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-reflect-smoke-"));
const Ledger = Path.join(Root, "reflect.log");
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
const FakeFs = (Files = {}, Options = {}) => {
  const Versions = { ...Options.Versions ?? {} };
  const Fs = {
    files: Files,
    versions: Versions,
    writes: [],
    reads: [],
    resolved: [],
    stats: []
  };
  Fs.resolve = async (P) => {
    Fs.resolved.push(P);
    const Target = { targetKey: P, displayPath: P };
    return Target;
  };
  Fs.stat = async (Target) => {
    Fs.stats.push(Target);
    const Content = Fs.files[Target.displayPath];
    return Content === void 0 ? void 0 : { version: Fs.versions[Target.displayPath] ?? "1", type: "file", size: Content.length };
  };
  Fs.readText = async (Target) => {
    const Key = typeof Target === "string" ? Target : Target.displayPath;
    const Content = Fs.files[Key];
    if (Content === void 0) {
      throw new Error(`readText: no such file ${Key}`);
    }
    Fs.reads.push(Key);
    return Content;
  };
  Fs.writeText = async (Target, Content, Intent) => {
    Fs.writes.push({ target: Target.displayPath, content: Content, intent: Intent });
    const Fail = Fs.FailWrites ?? Options.FailWrites;
    if (Fail !== void 0) {
      throw new Error(Fail);
    }
    const Current = Fs.WriteVersionOverride ?? Fs.versions[Target.displayPath] ?? "1";
    if (Intent?.kind === "replaceIfVersion" && String(Intent.version) !== Current) {
      throw new Error(
        `writeText: version conflict, intent ${Intent.version}, current ${Current}`
      );
    }
    const Next = Number.isFinite(Number(Current)) ? String(Number(Current) + 1) : `${Current}~`;
    Fs.versions[Target.displayPath] = Next;
    Fs.files[Target.displayPath] = Content;
    return { version: Next, operation: "replaceIfVersion" };
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
  Run.State = Context.__pluginDshWorkspaceReflectState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Seed = (Files, Versions = {}) => (_Context, Run) => {
  Run.Fs.files = { ...Files };
  Run.Fs.versions = { ...Versions };
};
const Graph = (Calls = [], Throw, Nodes = {}) => ({
  indexFile: async (P) => {
    Calls.push(P);
    if (Throw !== void 0) {
      throw new Error(Throw);
    }
    return { ok: true };
  },
  find: () => [],
  getNode: (Id) => Nodes[Id]
});
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
    assert.equal(Run.RootNames.length, 0);
    assert.ok(Run.Provided["workspaceReflect"] !== void 0);
    assert.ok(Run.State !== void 0);
    assert.deepEqual(Run.Lines, ["reflect: activated (propagate=block)"]);
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
  Graph,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Plugin,
  Root,
  Seed,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
