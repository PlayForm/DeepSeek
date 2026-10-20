import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Containers from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
import { DEFAULT_BLOCKS } from "../../Target/Variable/DefaultBlocks.js";
import { Frame } from "../../Target/Function/Render.js";
const DEFAULT_BLOCKS_IDS = DEFAULT_BLOCKS.map((Block2) => Block2.id);
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "live-containers-smoke-"));
const Ledger = Path.join(Root, "live-containers.log");
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
const ClockBox = { Now: 17e11 };
const FakeClock = () => ClockBox.Now;
const Advance = (Ms) => {
  ClockBox.Now += Ms;
};
const Write = /* @__PURE__ */ Symbol.for("cosmokit.volatile.write");
const Flip = (CellValue, New) => {
  const Cell = CellValue;
  if (typeof Cell?.[Write] !== "function") {
    throw new Error("Flip: not a volatile cell (no cosmokit write symbol)");
  }
  Cell[Write](New);
};
const Make = (Raw, Attach) => {
  const Listeners = {}, Lines = [], Warns = [];
  const Context = {
    pluginFactory: Furnace,
    tools: { schemas: () => [] },
    on: (Name, Listener) => {
      Listeners[Name] = Listener;
      return () => true;
    },
    get: (Name) => {
      switch (Name) {
        case "pluginFactory":
          return Furnace;
        case "tools":
          return Context.tools;
        default:
          return void 0;
      }
    },
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
      }
    },
    get root() {
      return Context;
    }
  };
  const Run = { Context, Listeners, Lines, Warns, Raw };
  Attach?.(Context, Run);
  const Returned = Containers.apply(Context, Raw);
  Run.Returned = Returned;
  Run.State = Context.__hookDshLiveContainersState;
  return Run;
};
const Validate = (Raw) => Containers.Config({ ...Raw });
const MakeClocked = (Raw) => {
  const Run = Make(Raw);
  Run.State.Now = FakeClock;
  return Run;
};
const Block = (ID, Kind, Template, Extra = {}) => ({
  id: ID,
  kind: Kind,
  template: Template,
  enabled: true,
  vars: {},
  trigger: "request",
  ttlCalls: 8,
  scope: "always",
  ...Extra
});
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));
const LedgerWith = (Needle) => LedgerLines().filter((L) => L.includes(Needle));
const ACCEPT = { kind: "accept" };
const AgentA = { id: "agent-a" };
const ScopeA = { key: "scope-a" };
const AssembleBase = async (Run, Base, Scope = void 0) => Run.Listeners["system-prompt/assemble"](
  Base,
  Scope === void 0 ? {} : { scope: Scope },
  async () => Base
);
const Assemble = async (Run, Scope = void 0) => {
  const Assembly = {
    sections: [{ name: "base", text: "BASE" }],
    contexts: [],
    tools: [],
    variables: {}
  };
  return AssembleBase(Run, Assembly, Scope);
};
const PreStep = async (Run, Users = 1) => {
  const Step = {
    agent: AgentA,
    messages: Array.from({ length: Users }, () => ({ source: { kind: "user" } }))
  };
  return Run.Listeners["agent/pre-step"](Step, async () => ({ stepped: true }));
};
const Post = async (Run, Name = "bash") => Run.Listeners["tools/post-execute"](
  { callId: "call_smoke", name: Name, arguments: { command: "ls" }, agent: AgentA, signal: void 0 },
  { isError: false, value: "", content: [] },
  async () => ACCEPT
);
const LiveSection = (Out) => Out.sections.find((S) => S.name === "live-containers");
const WaveAssemble = async (Run, Agent = AgentA) => {
  const Assembly = {
    sections: [{ name: "base", text: "BASE" }],
    contexts: [],
    tools: [],
    variables: {}
  };
  return Run.Listeners["system-prompt/assemble"](
    Assembly,
    { scope: Agent, agent: Agent },
    async () => Assembly
  );
};
const Pre = async (Run, Exec2) => {
  let nextCalled = false;
  const decision = await Run.Listeners["tools/pre-execute"](Exec2, async () => {
    nextCalled = true;
    return { kind: "allow" };
  });
  return { decision, nextCalled };
};
const Execute = async (Run, Exec2, Next) => Run.Listeners["tools/execute"](Exec2, Next ?? (async () => ({ isError: false, value: { real: true }, content: [] })));
const FireJobs = (Run, Event) => {
  if (Run.JobsHub === void 0) {
    throw new Error("FireJobs: the mount has no jobs service (pass jobs: FakeJobsHub() to MakeWave)");
  }
  for (const Listener of Run.JobsHub.listeners) {
    Listener(Event);
  }
};
const FireSession = (Run, Event) => {
  Run.Listeners["session/event"]({ id: "session-1" }, Event);
};
const FakeProcess = () => {
  const State = {
    status: "running",
    exitCode: null,
    signal: null,
    stdout: { chunks: "", offset: 0 },
    stderr: { chunks: "", offset: 0 }
  };
  const Read = (Buffer_) => ({
    text: Buffer_.chunks.slice(Buffer_.offset),
    nextOffset: Buffer_.chunks.length,
    lossy: false
  });
  const Handle = {
    get status() {
      return State.status;
    },
    get exitCode() {
      return State.exitCode;
    },
    get signal() {
      return State.signal;
    },
    observed: {
      stdout: { readFrom: (From) => ({ text: State.stdout.chunks.slice(From), nextOffset: State.stdout.chunks.length, lossy: false }) },
      stderr: { readFrom: (From) => ({ text: State.stderr.chunks.slice(From), nextOffset: State.stderr.chunks.length, lossy: false }) }
    },
    done: void 0,
    resolve: void 0,
    kill: () => {
      if (State.status === "running") {
        State.status = "killed";
        State.signal = State.signal ?? "SIGTERM";
      }
      return true;
    },
    result: async () => ({
      exitCode: State.exitCode,
      signal: State.signal,
      timedOut: false,
      aborted: false,
      timeoutMs: 12e4,
      stdout: { text: Read(State.stdout).text, truncated: false },
      stderr: { text: Read(State.stderr).text, truncated: false }
    }),
    /** Feed one channel with output (the smoke's pump stand-in). */
    feed: (Channel, Text) => {
      State[Channel].chunks += Text;
    },
    /** Settle the process (exit or kill). */
    settle: (ExitCode, Signal = null) => {
      State.exitCode = ExitCode;
      State.signal = Signal;
      if (State.status === "running") {
        State.status = Signal !== null ? "killed" : "completed";
      }
      ResolveDone?.(void 0);
    }
  };
  let ResolveDone;
  Handle.done = new Promise((Resolve) => {
    ResolveDone = Resolve;
  });
  return Handle;
};
const FakeJobsHub = () => {
  const Hub = {
    started: [],
    killed: [],
    listeners: [],
    next: 0,
    processes: []
  };
  Hub.registry = {
    start: (Specification) => {
      Hub.next += 1;
      const ID = `bash-${Hub.next.toString(16).padStart(16, "0")}`;
      Hub.started.push({ id: ID, spec: Specification });
      return ID;
    },
    events: {
      subscribe: (_Filter, Listener) => {
        Hub.listeners.push(Listener);
        return () => true;
      }
    },
    kill: (ID, Caller, Reason) => {
      Hub.killed.push({ id: ID, caller: Caller, reason: Reason });
      return "requested";
    },
    list: () => [],
    get: () => ({ id: "x", kind: "bash", label: "x", status: "running", startedAt: 0, output: { total: 0, earliest: 0 } }),
    readAt: () => ({ text: "", nextOffset: 0, lossy: false }),
    wait: async () => ({ id: "x", status: "running", startedAt: 0, output: { total: 0, earliest: 0 } }),
    remove: () => void 0,
    attachController: () => void 0
  };
  Hub.settled = (JobID, Options = {}) => ({
    type: "settled",
    job: {
      id: JobID,
      kind: Hub.started.find((S) => S.id === JobID)?.spec.kind ?? "bash",
      label: "cargo build",
      ...Options.owner !== void 0 ? { owner: Options.owner } : {},
      status: Options.status ?? "completed",
      detail: Options.detail,
      startedAt: 0,
      output: { total: 0, earliest: 0 }
    },
    cause: Options.cause ?? "producer",
    awaited: Options.awaited ?? false
  });
  return Hub;
};
const FakeShell = () => {
  const Shell = {
    resolved: [],
    executed: [],
    processes: []
  };
  Shell.registry = {
    sandboxMode: void 0,
    resolve: (Request) => {
      const Specification = { ...Request };
      Shell.resolved.push(Specification);
      return Specification;
    },
    execute: async (Specification) => {
      const Process = FakeProcess();
      Shell.executed.push(Specification);
      Shell.processes.push(Process);
      return Process;
    }
  };
  return Shell;
};
const FakePolicy = (Mode = "workspace-write") => ({
  mode: Mode,
  resolve: (Input) => ({ mode: Mode, session: Input?.session })
});
const FakeSubagent = () => {
  const Sub = { spawns: [], resolvers: [] };
  Sub.registry = {
    startActivation: (Specification) => {
      Sub.spawns.push(Specification);
      let ResolveResult = () => void 0;
      const Result = new Promise((Resolve) => {
        ResolveResult = Resolve;
      });
      Sub.resolvers.push(ResolveResult);
      return { childId: `child-${Sub.spawns.length}`, result: Result, dispose: async () => void 0 };
    }
  };
  Sub.answer = (Index, Output) => {
    Sub.resolvers[Index]?.({ output: Output, stopReason: "end_turn" });
  };
  return Sub;
};
const FakeAgents = (...IDs) => {
  const Map_ = new Map(IDs.map((ID) => [ID, { id: ID, status: "idle" }]));
  return { get: (ID) => Map_.get(ID) };
};
const MakeWave = (Raw, Services = {}) => {
  const Run = Make(Raw, (Context, Run_) => {
    Run_.JobsHub = Services.jobs;
    Context.jobs = Services.jobs?.registry;
    Context.shell = Services.shell?.registry;
    Context.shellEnv = { collect: (Exec2) => ({ DSH_SESSION: Exec2?.agent?.id ?? "none" }) };
    Context.workingDirectory = { ensure: async () => "/session" };
    Context.sandboxPolicy = Services.policy ?? FakePolicy();
    Context.subagent = Services.subagent?.registry;
    Context.agents = Services.agents;
    Run_.tools = {};
    Context.tools = {
      schemas: () => [],
      register: (Definition) => {
        Run_.tools[Definition.name] = Definition;
        return () => true;
      }
    };
    Run_.contexts = {};
    Context.systemPrompt = {
      context: (Context_) => {
        Run_.contexts[Context_.name] = Context_;
        return () => true;
      }
    };
  });
  Run.State.Now = FakeClock;
  return Run;
};
const CallTool = async (Run, Name, Args, Agent = AgentA) => Run.tools[Name].execute(Args, { agent: Agent, callId: "call_tool", rootCallId: "call_tool", signal: void 0 });
const live_plant = async (Run, Agent, Args) => CallTool(Run, "live_plant", Args, Agent);
const live_set = async (Run, Agent, Args) => CallTool(Run, "live_container_set", Args, Agent);
const live_monitor = async (Run, Agent, Args) => CallTool(Run, "live_monitor", Args, Agent);
const PendingText = (Run, Agent = AgentA) => Run.contexts["live-containers-completion"]?.text({ agent: Agent, scope: Agent }) ?? "";
const FakeStorage = (Options = {}) => {
  const Store = {
    spec: void 0,
    records: /* @__PURE__ */ new Map(),
    failOpen: Options.failOpen === true
  };
  Store.facility = {
    open: async (Specification) => {
      if (Store.failOpen) {
        throw new Error("storage unavailable");
      }
      Store.spec = Specification;
      return {
        close: async () => void 0,
        table: (_Name) => ({
          put: async (Key, Value) => {
            Store.records.set(Key, Value);
          },
          get: (Key) => Store.records.get(Key),
          entries: () => Store.records.entries(),
          keys: () => Store.records.keys(),
          get size() {
            return Store.records.size;
          },
          delete: async (Key) => Store.records.delete(Key),
          update: async (Key, Fn) => {
            const Next = Fn(Store.records.get(Key));
            Store.records.set(Key, Next);
            return Next;
          }
        })
      };
    }
  };
  Store.seed = (Key, Record) => {
    Store.records.set(Key, Record);
  };
  return Store;
};
const OpenStorage = async (Run, Facility) => {
  const Storage = await import("../../Target/Function/Storage.js");
  await Storage.default(
    Run.State,
    Facility,
    (Message) => Run.State.Factory.Append(Run.State, Message)
  );
};
const FireObserved = (Run, Path2, Version, Actor = { agent: { id: "agent-a", session: void 0 } }) => {
  Run.Listeners["fs/observed"](
    { displayPath: Path2, targetKey: Path2 },
    { kind: "present", version: Version },
    Actor
  );
};
const FlipLive = (Run, Key, Value) => {
  Flip(Run.Raw[Key], Value);
  Run.Listeners["loader/volatile-update"]([Key]);
};
const MonitorConfig = (Extra = {}) => ({
  monitors: "on",
  watchlist: [{ glob: "**/*.ts", checks: ["tsc", "format"] }],
  monitor: {
    debounceMs: 1500,
    maxMonitors: 8,
    maxMonitorJobs: 3,
    retireMs: 6e5,
    staleMs: 3e5,
    slowCheckIntervalMs: 0,
    bandCapBytes: 2048,
    checkTimeoutMs: 12e4,
    linkageAlertVersions: 3,
    dedupWindowMs: 3e4
  },
  ...Extra
});
const Exec = (Command, Extra = {}) => ({
  callId: `call_${Math.random().toString(16).slice(2, 8)}`,
  rootCallId: "call_root",
  name: "bash",
  arguments: { description: "run", command: Command, ...Extra },
  agent: AgentA,
  signal: void 0
});
const ExpectedTime = (Ms) => new Intl.DateTimeFormat("en-GB", {
  timeZone: Zone(),
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
}).format(new Date(Ms));
const ExpectedDate = (Ms) => new Intl.DateTimeFormat("en-CA", {
  timeZone: Zone(),
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date(Ms));
const Zone = () => {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
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
  const Run = Make(Validate({ logFile: Ledger }));
  Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
    assert.equal(Object.keys(Run.Listeners).length, 5);
    assert.equal(Run.State.Module, "hook-dsh-live-containers");
    assert.ok(
      Run.Lines.some((L) => L.startsWith("hook-dsh-live-containers: disabled"))
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
  ACCEPT,
  Advance,
  AgentA,
  Assemble,
  AssembleBase,
  Block,
  CallTool,
  Check,
  CheckAsync,
  ClockBox,
  Containers,
  DEFAULT_BLOCKS,
  DEFAULT_BLOCKS_IDS,
  Exec,
  Execute,
  ExpectedDate,
  ExpectedTime,
  FakeAgents,
  FakeClock,
  FakeJobsHub,
  FakePolicy,
  FakeProcess,
  FakeShell,
  FakeStorage,
  FakeSubagent,
  Finish,
  FireJobs,
  FireObserved,
  FireSession,
  Flip,
  FlipLive,
  Frame,
  Furnace,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  LiveSection,
  Make,
  MakeClocked,
  MakeCounter,
  MakeWave,
  MonitorConfig,
  OpenStorage,
  PendingText,
  Post,
  Pre,
  PreStep,
  Root,
  ScopeA,
  Validate,
  WaveAssemble,
  Zone,
  live_monitor,
  live_plant,
  live_set,
  rm
};
//# sourceMappingURL=Harness.js.map
