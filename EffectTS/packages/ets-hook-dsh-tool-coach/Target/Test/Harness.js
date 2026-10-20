import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Coach from "../../Target/Library.js";
import Detect from "../../Target/Function/Detect.js";
import { DEFAULT_EXEMPTS, DEFAULT_PATTERNS } from "../../Target/Variable/Patterns.js";
import {
  NOTE_DENIED,
  NOTE_FIRST,
  NOTE_PERSISTENT,
  STATIC_TOOL_LINES
} from "../../Target/Variable/Notes.js";
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "tool-coach-smoke-"));
const Ledger = Path.join(Root, "tool-coach.log");
const rm = () => {
  try {
    FileSystem.rmSync(Ledger);
  } catch {
  }
};
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const LiveSchemas = () => [
  {
    name: "read",
    description: "Read a UTF-8 text file (live fixture) and return line-numbered content.",
    parameters: { properties: { file_path: {}, offset: {} } }
  },
  {
    name: "write",
    description: "Create or fully replace a UTF-8 text file.",
    parameters: { properties: { file_path: {} } }
  },
  {
    name: "edit",
    description: "Edit an existing UTF-8 text file by replacing literal text.",
    parameters: { properties: { old_string: {}, new_string: {} } }
  },
  {
    name: "grep",
    description: "Search file contents with a ripgrep regular expression.",
    parameters: { properties: { pattern: {} } }
  },
  {
    name: "web_search",
    description: "Search the web for current information.",
    parameters: { properties: { queries: {} } }
  },
  {
    name: "zzz_fixture",
    description: "Fixture tool for the top-up ordering.",
    parameters: { properties: { x: {} } }
  }
];
const RowFor = (Needle) => DEFAULT_PATTERNS.find((Row) => Row.pattern.includes(Needle));
const CAT_ROW = RowFor("(cat|less|more").pattern;
const SED_ROW = RowFor("\\bsed\\b").pattern;
const JQ_EXEMPT = DEFAULT_EXEMPTS.find((Pattern) => Pattern.includes("jq"));
const Make = (Raw, Options = {}) => {
  const Listeners = {}, ListenerOptions = {}, Lines = [], Warns = [];
  const Context = {
    pluginFactory: Furnace,
    tools: Options.tools ?? { schemas: LiveSchemas },
    on: (Name, Listener, Opts) => {
      Listeners[Name] = Listener;
      ListenerOptions[Name] = Opts;
      return () => true;
    },
    get: (Name) => {
      switch (Name) {
        case "pluginFactory":
          return Furnace;
        case "tools":
          return Context.tools;
        default:
          throw new Error(`unknown service: ${Name}`);
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
  const Returned = Coach.apply(Context, Raw);
  return {
    Context,
    Listeners,
    ListenerOptions,
    Lines,
    Warns,
    Returned,
    State: Context.__hookDshToolCoachState
  };
};
const Validate = (Raw) => Coach.Config({ ...Raw });
const ACCEPT = { kind: "accept" };
const ALLOW = { kind: "allow" };
const Agent = (Id) => ({ id: Id });
const AgentA = Agent("agent-a");
const Post = async (Run, Command, Who = AgentA, Name = "bash") => Run.Listeners["tools/post-execute"](
  {
    callId: "call_smoke",
    name: Name,
    arguments: { command: Command },
    agent: Who,
    signal: void 0
  },
  { isError: false, value: "", content: [] },
  async () => ACCEPT
);
const Pre = async (Run, Command, Who = AgentA, Name = "bash") => Run.Listeners["tools/pre-execute"](
  {
    callId: "call_smoke",
    name: Name,
    arguments: { command: Command },
    agent: Who,
    signal: void 0
  },
  async () => ALLOW
);
const Assemble = async (Run, Who = AgentA) => {
  const Assembly = {
    sections: [{ name: "base", text: "BASE" }],
    contexts: [{ name: "ctx", text: "CTX" }],
    tools: [{ name: "read", description: "d", parameters: {} }],
    variables: { v: "1" }
  };
  return Run.Listeners["system-prompt/assemble"](Assembly, { agent: Who }, async () => Assembly);
};
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));
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
  Check(Count, "selfcheck: the fake ctx registers the coach's apply-time wiring", () => {
    assert.equal(Object.keys(Run.Listeners).length, 6);
    assert.equal(Run.State.Module, "hook-dsh-tool-coach");
    assert.ok(
      Run.Lines.some((L) => L.startsWith("hook-dsh-tool-coach: activated"))
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
  ALLOW,
  Agent,
  AgentA,
  Assemble,
  CAT_ROW,
  Check,
  CheckAsync,
  Coach,
  DEFAULT_EXEMPTS,
  DEFAULT_PATTERNS,
  Detect,
  Finish,
  Furnace,
  JQ_EXEMPT,
  Ledger,
  LinesWith,
  LiveSchemas,
  Make,
  MakeCounter,
  NOTE_DENIED,
  NOTE_FIRST,
  NOTE_PERSISTENT,
  Post,
  Pre,
  Root,
  RowFor,
  SED_ROW,
  STATIC_TOOL_LINES,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
