import assert from "node:assert/strict";
import FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import LessonService from "../../Target/Library.js";
const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "lesson-smoke-home-"));
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
  if (Count.F !== 0) {
    throw new Error(`${Name}: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const Settle = async () => {
  for (let Index = 0; Index < 4; Index++) {
    await new Promise((Resolve) => setImmediate(Resolve));
  }
};
const Make = (Knobs = {}, Attach) => {
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Effects = [];
  const Disposers = [];
  const Context = {
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
      }
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
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value ?? true;
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  const Run = { Context, Lines, Warns, Provided, Effects, Disposers };
  Attach?.(Context, Run);
  Run.Service = new LessonService(Context, Knobs);
  return Run;
};
const FakeLlm = (Reply, Options = {}) => {
  const Calls = [];
  return {
    Calls,
    stream: (Request) => {
      Calls.push(Request);
      switch (true) {
        case Options.fail === true:
          throw new Error("provider exploded");
        case Options.silent === true:
          return (async function* () {
          })();
        default:
          return (async function* () {
            yield { type: "text-delta", index: 0, text: Reply.slice(0, 12) };
            yield { type: "text-delta", index: 0, text: Reply.slice(12) };
          })();
      }
    }
  };
};
const Seed = (Name, Body = `---
name: ${Name}
description: x
---

# ${Name}
`) => {
  const Directory = Path.join(Home, ".dsh", "skills", Name);
  FileSystem.mkdirSync(Directory, { recursive: true });
  FileSystem.writeFileSync(Path.join(Directory, "SKILL.md"), Body, "utf8");
  return Directory;
};
const Exists = (Relative) => FileSystem.existsSync(Path.join(Home, ".dsh", Relative));
const Read = (Relative) => FileSystem.readFileSync(Path.join(Home, ".dsh", Relative), "utf8");
const Messages = (Run) => Run.Lines.map((Line) => Line.replace(/ \(logFile .*\)$/, ""));
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  const Run = Make();
  Check(Count, "selfcheck: the fake ctx registers the service", () => {
    assert.equal(Run.Provided["lesson"], Run.Service);
    assert.equal(Run.Service.name, "lesson");
  });
  Check(Count, "selfcheck: the activation line names the corpus and the write posture", () => {
    assert.deepEqual(Messages(Run), [
      `lesson: activated (bundle=${"0.2.1"}, interval=10 turns, corpus=~/.dsh/skills, write=approve)`
    ]);
  });
  if (Count.N === 4 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Check,
  CheckAsync,
  Exists,
  FakeLlm,
  Finish,
  Home,
  LessonService,
  Make,
  MakeCounter,
  Messages,
  Read,
  Seed,
  Settle
};
//# sourceMappingURL=Harness.js.map
