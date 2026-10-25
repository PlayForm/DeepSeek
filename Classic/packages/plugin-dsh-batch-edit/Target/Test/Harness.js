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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batch-edit-smoke-"));
const Ledger = Path.join(Root, "batch-edit.log");
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
const FakeFs = (Files = {}) => {
  const Fs = {
    files: { ...Files },
    versions: /* @__PURE__ */ new Map(),
    n: 0,
    resolves: [],
    stats: [],
    reads: [],
    writes: [],
    failWrite: null
  };
  for (const Path_ of Object.keys(Files)) {
    Fs.versions.set(Path_, "v1");
  }
  Fs.resolve = async (P) => {
    Fs.resolves.push(P);
    if (!(P in Fs.files)) {
      throw new Error(`not found: ${P}`);
    }
    return { displayPath: P, targetKey: `key:${P}` };
  };
  Fs.stat = async (T) => {
    Fs.stats.push(T?.displayPath ?? String(T));
    const Version = Fs.versions.get(T?.displayPath ?? "");
    return Version === void 0 ? null : { version: Version };
  };
  Fs.readText = async (T) => {
    Fs.reads.push(T?.displayPath ?? String(T));
    return Fs.files[T?.displayPath ?? ""];
  };
  Fs.writeText = async (T, Content, Intent) => {
    const P = T?.displayPath ?? String(T);
    if (Fs.failWrite === P) {
      throw new Error("write denied");
    }
    Fs.writes.push({ path: P, content: Content, intent: Intent });
    Fs.files[P] = Content;
    Fs.n += 1;
    const Fresh = `v${Fs.n + 1}`;
    Fs.versions.set(P, Fresh);
    return { version: Fresh };
  };
  Fs.sandboxMode = void 0;
  return Fs;
};
const Make = (Raw, Files = {}, Attach) => {
  const Registered = [];
  const CtxListeners = {};
  const RootListeners = {};
  const RootEmits = [];
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Services = {};
  const Gets = [];
  const Fs = FakeFs(Files);
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
    get: (Name) => {
      Gets.push(Name);
      return Services[Name];
    },
    tools: {
      register: (Definition) => {
        Registered.push(Definition);
        return () => true;
      }
    },
    fs: Fs,
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
    Services,
    Gets,
    Registered,
    Raw,
    Fs
  };
  Attach?.(Context, Run);
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__pluginDshBatchEditState;
  Run.Tool = Registered.find((D) => D.name === "batch_edit");
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Exec = () => ({ agent: { id: "agent-a" } });
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
  const Run = Make(
    Validate({ logFile: Ledger, enabled: true }),
    { "a.txt": "hello\n" }
  );
  Check(Count, "selfcheck: the fake ctx registers the tool, the root observer and the state", () => {
    assert.equal(Run.Tool.name, "batch_edit");
    assert.deepEqual(Object.keys(Run.RootListeners), ["fs/observed"]);
    assert.ok(Run.State !== void 0);
    assert.deepEqual(Run.Lines, [
      "plugin-dsh-batch-edit: activated bundle 0.2.0 (machinesPerAgent 2, opsPerCommit 64, deadlineMs 120000, strictMode false, interceptBash false)"
    ]);
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
  Exec,
  FakeFs,
  Finish,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Plugin,
  Root,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
