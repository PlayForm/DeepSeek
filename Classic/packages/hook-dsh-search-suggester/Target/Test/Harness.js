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
const Make = (Raw, Prepare) => {
  const CtxListeners = {};
  const Lines = [];
  const Warns = [];
  const Effects = [];
  const RootNames = [];
  const Tools = [];
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
  const Run = { Context, Root: Root2, CtxListeners, Lines, Warns, Effects, RootNames, Fs, Raw, Tools };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.State = Context.__hookDshSearchSuggesterState;
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
    Agents.set(Id, { agent: { id: Id } });
  }
  return Agents.get(Id);
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
  Check(Count, "selfcheck: the fake ctx registers the plugin's four listeners", () => {
    assert.deepEqual(Object.keys(Run.CtxListeners), [
      "loader/volatile-update",
      "tools/post-execute",
      "agent/pre-step",
      "system-prompt/assemble",
      "tools/change"
    ]);
    assert.deepEqual(Run.RootNames, []);
    assert.equal(Run.Returned, void 0);
    assert.equal(Run.Fs.reads + Run.Fs.writes, 0);
    assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: activated (bundle 0.1.0, intents 10, threshold 0.75)"]);
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
  Durable,
  DurableLine,
  Exports,
  FakeGraph,
  Finish,
  FirstLine,
  Furnace,
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
  Setup,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
