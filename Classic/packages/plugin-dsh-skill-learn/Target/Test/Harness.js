import FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Knobs_ from "../../Target/Function/Knobs.js";
import { Expand } from "../../Target/Function/Write.js";
const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "skill-learn-smoke-"));
process.env["HOME"] = Home;
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
  switch (true) {
    case Count.F !== 0:
      throw new Error(`${Name}: ${Count.F} failed check(s)`);
    default:
      break;
  }
  console.log(`${Count.N} PASS - ${Name}`);
  return Count.N;
};
const Settle = async () => {
  for (let Index = 0; Index < 4; Index++) {
    await new Promise((Resolve) => setImmediate(Resolve));
  }
};
const Absolute = (Given) => Path.isAbsolute(Given) ? Given : Path.join(Home, ".dsh", Given);
const Exists = (Given) => FileSystem.existsSync(Absolute(Given));
const Read = (Given) => FileSystem.readFileSync(Absolute(Given), "utf8");
const Knobs = (Overrides = {}) => Knobs_(Overrides);
const State = (Tag) => {
  const Root = Path.join(Home, ".dsh", "skill-learn", Tag);
  return {
    storagePath: Path.join(Root, "usage.json"),
    statePath: Path.join(Root, "state.json"),
    ledgerPath: Path.join(Root, "ledger.jsonl"),
    blobRoot: Path.join(Root, "blobs"),
    snapshotRoot: Path.join(Root, "snapshots"),
    reportsRoot: Path.join(Root, "reports")
  };
};
const Fail = (Code) => Object.assign(new Error(Code), { code: Code });
const FakeFs = (Options = {}) => {
  const Files = /* @__PURE__ */ new Map();
  const Calls = [];
  let Sequence = 0;
  let FailWrite = Options.failWrite;
  let FailEdit = Options.failEdit;
  const Key = (Given) => Path.resolve(Given);
  const Next = () => {
    Sequence += 1;
    return `v${Sequence}`;
  };
  const Log = (Method, Path_, Intent = "", Version = null, ReplaceAll = null, Old = null) => {
    Calls.push({ method: Method, path: Path_, intent: Intent, version: Version, replaceAll: ReplaceAll, oldString: Old });
  };
  const Fs_ = {
    Calls,
    Put: (Path_, Text_) => {
      Files.set(Key(Path_), { Text: Text_, Version: Next() });
    },
    Text: (Path_) => Files.get(Key(Path_))?.Text ?? null,
    Version: (Path_) => Files.get(Key(Path_))?.Version ?? null,
    Of: (Method) => Calls.filter((Call2) => Call2.method === Method),
    Clear: () => {
      Calls.length = 0;
    },
    resolve: async (Given) => {
      const Key_ = Key(Given);
      Log("resolve", Key_);
      return { targetKey: Key_, displayPath: Key_ };
    },
    stat: async (Target) => {
      const Key_ = Key(Target.displayPath);
      Log("stat", Key_);
      const Found = Files.get(Key_);
      if (Found !== void 0) {
        const Answer = { version: Found.Version, type: "file" };
        if (Options.bumpAfterStat === true) {
          Files.set(Key_, { Text: Found.Text, Version: Next() });
        }
        return Answer;
      }
      const Prefix = `${Key_}${Path.sep}`;
      for (const Absolute_ of Files.keys()) {
        if (Absolute_.startsWith(Prefix)) {
          return { version: "directory", type: "directory" };
        }
      }
      return void 0;
    },
    readText: async (Target) => {
      const Key_ = Key(Target.displayPath);
      Log("readText", Key_);
      const Found = Files.get(Key_);
      if (Found === void 0) {
        throw Fail("FS_NOT_OBSERVED");
      }
      return Found.Text;
    },
    listDir: async (Target) => {
      const Key_ = Key(Target.displayPath);
      Log("listDir", Key_);
      const Prefix = `${Key_}${Path.sep}`;
      const Names = /* @__PURE__ */ new Map();
      for (const Absolute_ of Files.keys()) {
        if (!Absolute_.startsWith(Prefix)) continue;
        const Parts = Absolute_.slice(Prefix.length).split(Path.sep);
        const Name = Parts[0] ?? "";
        if (Name === "") continue;
        Names.set(Name, Parts.length === 1 ? "file" : "directory");
      }
      if (Names.size === 0) {
        throw Fail("FS_NOT_OBSERVED");
      }
      return [...Names.entries()].map(([Name, Type]) => {
        const Child = Path.join(Key_, Name);
        return { name: Name, type: Type, target: { targetKey: Child, displayPath: Child } };
      });
    },
    writeText: async (Target, Content, Intent) => {
      const Key_ = Key(Target.displayPath);
      const Kind = Intent === void 0 ? "none" : Intent.kind;
      const Token = Intent !== void 0 && Intent.kind === "replaceIfVersion" ? Intent.version : null;
      Log("writeText", Key_, Kind, Token);
      if (FailWrite !== void 0) {
        const Code = FailWrite;
        FailWrite = void 0;
        throw Fail(Code);
      }
      const Found = Files.get(Key_);
      if (Kind === "createIfAbsent" && Found !== void 0) {
        throw Fail("FS_NOT_OBSERVED");
      }
      if (Kind === "replaceIfVersion") {
        if (Found === void 0) {
          throw Fail("FS_STALE_VERSION");
        }
        if (Token !== null && Found.Version !== Token) {
          throw Fail("FS_STALE_VERSION");
        }
      }
      const Before = Found?.Text ?? null;
      const Next_ = Next();
      Files.set(Key_, { Text: Content, Version: Next_ });
      return {
        operation: Before === null ? "create" : "update",
        version: Next_,
        before: Before,
        after: Content
      };
    },
    editText: async (Target, Edit, Expected) => {
      const Key_ = Key(Target.displayPath);
      const Token = Expected === void 0 ? null : Expected.version;
      Log("editText", Key_, "edit", Token, Edit.replaceAll, Edit.oldString);
      if (FailEdit !== void 0) {
        const Code = FailEdit;
        FailEdit = void 0;
        throw Fail(Code);
      }
      const Found = Files.get(Key_);
      if (Found === void 0) {
        throw Fail("FS_NOT_OBSERVED");
      }
      if (Token !== null && Found.Version !== Token) {
        throw Fail("FS_STALE_VERSION");
      }
      const Count = Edit.oldString === "" ? 0 : Found.Text.split(Edit.oldString).length - 1;
      if (Count === 0) {
        throw Fail("FS_EDIT_NOT_FOUND");
      }
      if (Count > 1 && !Edit.replaceAll) {
        throw Fail("FS_AMBIGUOUS_EDIT");
      }
      const After = Edit.replaceAll ? Found.Text.split(Edit.oldString).join(Edit.newString) : Found.Text.replace(Edit.oldString, Edit.newString);
      const Next_ = Next();
      Files.set(Key_, { Text: After, Version: Next_ });
      return { version: Next_, before: Found.Text, after: After };
    },
    contains: (Parent, Child) => {
      const Left = Key(Parent.displayPath);
      const Right = Key(Child.displayPath);
      Log("contains", Right);
      return Right === Left || Right.startsWith(`${Left}${Path.sep}`);
    },
    processPath: (Target) => Key(Target.displayPath)
  };
  for (const [Path_, Text_] of Object.entries(Options.files ?? {})) {
    Fs_.Put(Path_, Text_);
  }
  return Fs_;
};
const FakeSkills = (Options = {}) => {
  const Rows = [...Options.rows ?? []];
  const Loaded = /* @__PURE__ */ new Map();
  const Calls = [];
  const Base = Expand(Knobs().skillsRoot);
  const Skills_ = {
    Calls,
    Put: (Name, Content) => {
      Loaded.set(Name, {
        name: Name,
        description: "",
        content: Content,
        resourceBase: { path: Path.join(Base, Name) },
        path: Path.join(Base, Name, "SKILL.md")
      });
    },
    list: async () => {
      Calls.push("list");
      return Rows;
    },
    get: async (Name) => {
      Calls.push(`get:${Name}`);
      return Loaded.get(Name);
    },
    invalidateCache: () => {
      Calls.push("invalidateCache");
    }
  };
  for (const [Name, Content] of Object.entries(Options.skills ?? {})) {
    Skills_.Put(Name, Content);
  }
  return Skills_;
};
const FakeLLM = (Reply, Options = {}) => {
  const Calls = [];
  const Split = (Text_) => [
    { type: "text-delta", text: Text_.slice(0, 12) },
    { type: "text-delta", text: Text_.slice(12) }
  ];
  return {
    Calls,
    stream: (Request) => {
      Calls.push(Request);
      if (Options.fail === true) {
        throw new Error("provider exploded");
      }
      const Frames = Options.frames ?? (Options.silent === true ? [] : Split(Options.replies === void 0 ? Reply : Options.replies[Calls.length - 1] ?? Reply));
      return (async function* () {
        for (const Frame of Frames) yield Frame;
      })();
    }
  };
};
const FakeLogger = () => {
  const Lines = [];
  const Warns = [];
  const Errors = [];
  const Debugs = [];
  return {
    Lines,
    Warns,
    Errors,
    Debugs,
    info: (Format) => {
      Lines.push(String(Format));
    },
    warn: (Format) => {
      Warns.push(String(Format));
    },
    error: (Format) => {
      Errors.push(String(Format));
    },
    debug: (Format) => {
      Debugs.push(String(Format));
    }
  };
};
const Messages = (Logger_) => Logger_.Lines.map((Line) => Line.replace(/ \(logFile .*\)$/, ""));
const FakeAgent = (Options = {}) => {
  const Derived = Options.messages ?? [];
  const Claims = [];
  const Route = Options.provider === void 0 || Options.model === void 0 ? {} : { provider: Options.provider, model: Options.model };
  return {
    id: Options.id ?? "session-1",
    Claims,
    options: Route,
    session: {
      deriveMessages: () => {
        if (Options.deriveThrows === true) {
          throw new Error("the session is disposed");
        }
        return Derived;
      }
    },
    status: "idle",
    // NOT an async function: the harness throws SYNCHRONOUSLY when a turn or
    // another task owns the agent, and the gate reads that throw as `busy`.
    runMaintenance: (Task) => {
      if (Options.busy === true) {
        throw new Error("the agent is not idle");
      }
      Claims.push("claimed");
      return Task(new AbortController().signal);
    },
    whenIdle: async () => {
    }
  };
};
const Say = (Role, Text_) => ({
  role: Role,
  content: [{ type: "text", text: Text_ }]
});
const Call = (Names) => ({
  role: "assistant",
  content: Names.map((Name) => Name === null ? { type: "tool-call" } : { type: "tool-call", name: Name })
});
const Turn = (Text_, Names) => ({
  role: "assistant",
  content: [
    { type: "text", text: Text_ },
    ...Names.map((Name) => Name === null ? { type: "tool-call" } : { type: "tool-call", name: Name })
  ]
});
const Foreign = (Role, Blocks) => JSON.parse(JSON.stringify({ role: Role, content: Blocks }));
const CorpusView = (Configuration_, Seed2 = {}) => {
  const Bodies = Seed2.bodies ?? {};
  const Carried = Seed2.carried ?? {};
  const Support = Seed2.support ?? {};
  const Resolved = Seed2.resolved ?? {};
  const Records = Seed2.records ?? {};
  const Root = Expand(Configuration_.skillsRoot);
  return {
    resolve: (Name) => {
      const Given = Resolved[Name];
      if (Given !== void 0) return Given;
      return Bodies[Name] === void 0 ? null : Path.join(Root, Name, "SKILL.md");
    },
    body: (Name) => Bodies[Name] ?? null,
    carried: (Name) => Carried[Name] ?? null,
    support: (Name, FilePath) => Support[`${Name}/${FilePath}`] ?? null,
    record: (Name) => Records[Name] ?? null,
    contains: (Parent, Child) => {
      const Left = Path.resolve(Parent);
      const Right = Path.resolve(Child);
      return Right === Left || Right.startsWith(`${Left}${Path.sep}`);
    }
  };
};
const Seed = (Fs_, Name, Body) => {
  const Directory = Path.join(Home, ".dsh", "skills", Name);
  Fs_.Put(Path.join(Directory, "SKILL.md"), Body);
  return Directory;
};
const Make = (Options = {}) => {
  const Fs_ = FakeFs(Options.fs ?? {});
  const Skills_ = FakeSkills(Options.skills ?? {});
  const LLM_ = FakeLLM(Options.reply ?? "", Options.llm ?? {});
  const Logger_ = FakeLogger();
  const Working = {
    ensure: async (_Agent) => Path.join(Home, "work")
  };
  const get = (Name) => {
    switch (true) {
      case Name === "fs":
        return Fs_;
      case Name === "skills":
        return Skills_;
      case Name === "llm":
        return LLM_;
      case Name === "logger":
        return Logger_;
      case Name === "workingDirectory":
        return Working;
      default:
        return void 0;
    }
  };
  return { fs: Fs_, skills: Skills_, llm: LLM_, logger: Logger_, workingDirectory: Working, get };
};
export {
  Call,
  Check,
  CheckAsync,
  CorpusView,
  Exists,
  FakeAgent,
  FakeFs,
  FakeLLM,
  FakeLogger,
  FakeSkills,
  Finish,
  Foreign,
  Home,
  Knobs,
  Make,
  MakeCounter,
  Messages,
  Read,
  Say,
  Seed,
  Settle,
  State,
  Turn
};
//# sourceMappingURL=Harness.js.map
