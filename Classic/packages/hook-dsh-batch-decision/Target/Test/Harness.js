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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batch-decision-smoke-"));
const Ledger = Path.join(Root, "batch-decision.log");
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
const Proposal = (Overrides = {}) => ({
  id: "prop-1",
  intent: "version-bump",
  targets: [{ path: "package.json", version: "v1", why: "the version bump" }],
  operations: [],
  preview: { entries: [], changes: 0, skipped: [] },
  digest: "digest-1",
  revision: 1,
  expiresAt: 106e4,
  confidence: 0.9,
  ...Overrides
});
const Make = (Raw, Attach) => {
  const CtxListeners = {};
  const RootListeners = {};
  const RootEmits = [];
  const Emits = [];
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Services = {};
  const Registered = [];
  const Gets = [];
  const Fs = {
    reads: [],
    writes: []
  };
  const ThrowingFs = {
    ...Fs,
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
  const Clock = { Now: 1e6 };
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
    emit: (Name, ...Args) => {
      Emits.push([Name, ...Args]);
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
    fs: ThrowingFs,
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
    Emits,
    CtxListeners,
    Lines,
    Warns,
    Provided,
    Services,
    Registered,
    Gets,
    Fs: ThrowingFs,
    Clock
  };
  Attach?.(Context, Run);
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__hookDshBatchDecisionState;
  if (Run.State !== void 0) {
    Run.State.Now = () => Clock.Now;
  }
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Tool = (Run) => Run.Registered.find((D) => D.name === "batch_decision");
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
  const Run = Make(Validate({ logFile: Ledger, enabled: true, autoApprove: "on", allowlist: ["version-bump"] }));
  Check(Count, "selfcheck: the fake ctx registers the listener, the tool and the state", () => {
    assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update", "batch/proposed"]);
    assert.equal(Tool(Run).name, "batch_decision");
    assert.ok(Run.State !== void 0);
    assert.deepEqual(Run.Lines, [
      "hook-dsh-batch-decision: activated (bundle 0.3.0, autoApprove=on, allowlist=1)"
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
  Finish,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  Make,
  MakeCounter,
  Plugin,
  Proposal,
  Root,
  Tool,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
