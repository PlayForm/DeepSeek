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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-merge-smoke-"));
const Ledger = Path.join(Root, "merge.log");
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
const FakeFs = (Files = {}, Faults = {}) => {
  const Fs = {
    files: Files,
    faults: Faults,
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
    if (Fs.faults.read !== void 0) {
      throw new Error(Fs.faults.read);
    }
    const File = Fs.files[Target.displayPath];
    return File === void 0 ? void 0 : File.text;
  };
  Fs.writeText = async (Target, Content, Intent) => {
    Fs.writes.push([Target, Content, Intent]);
    if (Fs.faults.write !== void 0) {
      throw new Error(Fs.faults.write);
    }
    const File = Fs.files[Target.displayPath];
    if (File === void 0) {
      throw new Error(`unresolved target ${Target.displayPath}`);
    }
    if (Intent?.kind !== "replaceIfVersion") {
      throw new Error(`unexpected intent ${String(Intent?.kind)}`);
    }
    if (Intent.version !== File.version) {
      throw new Error(`version mismatch for ${Target.displayPath}`);
    }
    File.version = `v${Number(String(File.version).slice(1)) + 1}`;
    File.text = Fs.faults.tamper ?? Content;
    return { version: File.version };
  };
  return Fs;
};
const Make = (Raw, Faults) => {
  const Listeners = {};
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const RootNames = [];
  const Emitted = [];
  const Root2 = {
    on: (Name, Listener) => {
      RootNames.push(Name);
      Listeners[Name] = Listener;
      return () => true;
    },
    emit: (Name, ...Parts) => {
      Emitted.push([Name, ...Parts]);
      return true;
    }
  };
  const Fs = FakeFs(
    {
      "/repo/src/a.ts": { version: "v1", text: "const a = 1;\n" },
      "/repo/src/b.ts": { version: "v1", text: "const b = 2;\n" },
      "/repo/src/stale.ts": { version: "v2", text: "stale\n" }
    },
    Faults
  );
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
    Emitted,
    Raw,
    Fs
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__hookDshWorkspaceMergeState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
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
    assert.ok(Run.Provided["workspaceMerge"] !== void 0);
    assert.equal(Run.Effects.includes("merge-storage"), true);
    assert.deepEqual(Run.Lines, [
      "merge: activated (domain=workspace_merge, mode=all-or-nothing)"
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
  Root,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
