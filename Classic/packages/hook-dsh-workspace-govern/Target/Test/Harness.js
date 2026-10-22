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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "workspace-govern-smoke-"));
const Ledger = Path.join(Root, "govern.log");
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
const Proposal = (Over = {}) => ({
  operation: "op:1",
  parent: "(root)",
  category: "tool",
  kind: "write",
  target: "/repo/src/a.ts",
  contribution: "edit the workspace",
  scope: [],
  holder: "agent-a",
  declared: true,
  ...Over
});
const Make = (Raw) => {
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
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__hookDshWorkspaceGovernState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Exec = (Over = {}) => ({
  name: "write",
  callId: "c1",
  rootCallId: "c1",
  arguments: { path: "/repo/src/a.ts" },
  agent: { id: "agent-a" },
  ...Over
});
const Next = () => {
  let Called = 0;
  const downstream = { kind: "pass-through" };
  return {
    decision: downstream,
    next: (Value) => {
      Called += 1;
      return Value ?? downstream;
    }
  };
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
    assert.ok(Run.Provided["workspaceGovern"] !== void 0);
    assert.deepEqual(Run.RootNames, []);
    assert.deepEqual(Object.keys(Run.CtxListeners), [
      "loader/volatile-update",
      "tools/pre-execute",
      "tools/post-execute"
    ]);
    assert.deepEqual(Run.Lines, ["govern: activated (tools=4, policy=0)"]);
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
  LinesWith,
  Make,
  MakeCounter,
  Next,
  Plugin,
  Proposal,
  Root,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
