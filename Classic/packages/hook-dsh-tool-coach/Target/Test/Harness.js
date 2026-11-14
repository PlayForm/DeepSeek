import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Coach from "../../Target/Library.js";
import Detect from "../../Target/Function/Detect.js";
import { DefaultOf, ParamsOf, PrimaryOf } from "../../Target/Function/Fetch.js";
import { CATALOG } from "../../Target/Variable/Catalog.js";
import { DEFAULT_EXEMPTS, DEFAULT_PATTERNS } from "../../Target/Variable/Patterns.js";
import {
  CLASS_LEADS,
  NOTE_DENIED,
  NOTE_DENIED_TOOL,
  NOTE_FIRST,
  NOTE_PERSISTENT
} from "../../Target/Variable/Notes.js";
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
    parameters: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Path to read." },
        offset: { type: "number", description: "1-based first line to return. Defaults to 1." },
        limit: {
          type: "number",
          description: "Maximum number of lines to return. Defaults to 2000."
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "write",
    description: "Create or fully replace a UTF-8 text file.",
    parameters: { properties: { file_path: {} }, required: ["file_path"] }
  },
  {
    name: "edit",
    description: "Edit an existing UTF-8 text file by replacing literal text.",
    parameters: {
      properties: {
        file_path: { description: "Path to edit." },
        old_string: { description: "Literal text to replace." },
        new_string: { description: "Literal replacement text." },
        replace_all: {
          description: "Replace all matches. Defaults to false; when false, old_string must appear exactly once."
        }
      },
      required: ["file_path", "old_string", "new_string"]
    }
  },
  {
    name: "grep",
    description: "Search file contents with a ripgrep regular expression.",
    parameters: { properties: { pattern: {} }, required: ["pattern"] }
  },
  {
    name: "aaa_fixture",
    description: "Fixture tool that sorts first, so the top-up has a stable first row.",
    parameters: { properties: { x: {} } }
  },
  {
    name: "web_search",
    description: "Search the web for current information.",
    parameters: { properties: { queries: {} }, required: ["queries"] }
  },
  {
    name: "working_directory",
    description: "Read the current working directory, or change it with cd.",
    parameters: {
      properties: {
        cd: { description: "Existing directory to enter. Omit to read the current directory." }
      }
    }
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
const Agent = (ID) => ({ id: ID });
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
  CATALOG,
  CAT_ROW,
  CLASS_LEADS,
  Check,
  CheckAsync,
  Coach,
  DEFAULT_EXEMPTS,
  DEFAULT_PATTERNS,
  DefaultOf,
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
  NOTE_DENIED_TOOL,
  NOTE_FIRST,
  NOTE_PERSISTENT,
  ParamsOf,
  Post,
  Pre,
  PrimaryOf,
  Root,
  RowFor,
  SED_ROW,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
