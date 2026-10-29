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
const Make = (Raw) => {
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Fs = FakeFs();
  const RootObj = { on: () => () => true };
  let Context;
  Context = {
    pluginFactory: Furnace,
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
    Fs
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__testSuggesterState;
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Setup = (Config = {}) => {
  rm();
  return Make(Validate({ logFile: Ledger, threshold: 0.5, ...Config }));
};
const Call = async (Run, Name, Arguments, Agent = { agent: { id: "agent-a" } }, Decision = { kind: "allow" }) => Run.CtxListeners["tools/post-execute"](
  { name: Name, arguments: Arguments, agent: Agent },
  void 0,
  async () => Decision
);
const PreStep = async (Run, Agent = { agent: { id: "agent-a" } }, Messages = [{ role: "user" }]) => Run.CtxListeners["agent/pre-step"]({ agent: Agent, messages: Messages }, async () => ({
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
  Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
    assert.equal(Run.Returned, void 0);
    assert.ok(Run.CtxListeners["tools/post-execute"] instanceof Function);
    assert.ok(Run.CtxListeners["agent/pre-step"] instanceof Function);
    assert.ok(Run.State !== void 0);
    assert.ok(
      Run.Lines.includes(`test-suggester: activated (bundle ${"0.2.1"}, intents 2, threshold 0.75)`)
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
  Call,
  Check,
  CheckAsync,
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
