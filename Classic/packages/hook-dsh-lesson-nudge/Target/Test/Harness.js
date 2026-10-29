import assert from "node:assert/strict";
import { apply, Config, inject, name } from "../../Target/Library.js";
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
const FakeFactory = (Lines) => ({
  State: (_Context, Options, Specification) => {
    const State = { __module: Specification?.module ?? "unknown" };
    for (const [Key, Field] of Object.entries(Specification?.fields ?? {})) {
      const Raw = (Options ?? {})[Field];
      State[Key] = typeof Raw?.get === "function" ? Raw.get() : Raw;
    }
    return State;
  },
  Append: (State, Message) => {
    Lines.push(`${State.__module}: ${Message}`);
  }
});
const FakeLesson = (Options = {}) => {
  const Calls = { tick: [], snapshot: [], review: [] };
  const Lesson = {
    Calls,
    Due: Options.due !== false,
    Tick: (Agent) => {
      Calls.tick.push(Agent);
      return { due: Lesson.Due, count: 10 };
    },
    Snapshot: (Agent) => {
      Calls.snapshot.push(Agent);
      return Options.snapshot ?? [{ role: "user", text: "hello" }];
    },
    Review: async (Input) => {
      Calls.review.push(Input);
      return { outcome: Options.outcome ?? "proposed", applied: [], proposed: ["one"] };
    }
  };
  return Lesson;
};
const FakeAgent = (Id = "session-1") => {
  const Tasks = [];
  return {
    Tasks,
    session: { id: Id },
    options: { provider: "fake", model: "fake" },
    runMaintenance: (Task) => {
      Tasks.push(Task);
      return Promise.resolve().then(() => Task(new AbortController().signal));
    }
  };
};
const Make = (Knobs = {}, Attach) => {
  const Lines = [];
  const Warns = [];
  const Listeners = [];
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
    on: (Name, Fn) => {
      Listeners.push({ name: Name, fn: Fn });
      return () => true;
    },
    pluginFactory: FakeFactory(Lines)
  };
  const Run = { Context, Lines, Warns, Listeners };
  Attach?.(Context, Run);
  apply(Context, {
    enabled: true,
    logFile: "~/.dsh/playform/hook-dsh-lesson-nudge.log",
    maxReviewsPerSession: 3,
    policy: {
      read: "auto",
      index: "auto",
      record: "auto",
      suggest: "auto",
      write: "approve",
      commit: "approve",
      spawn: "approve",
      message: "auto"
    },
    ...Knobs
  });
  Run.State = Context.__hookDshLessonNudgeState;
  return Run;
};
const Status = (Run, Payload) => {
  for (const Listener of Run.Listeners) {
    if (Listener.name === "agent/status") {
      Listener.fn(Payload);
    }
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
  const Run = Make();
  Check(Count, "selfcheck: the real apply registers exactly one agent/status listener", () => {
    assert.equal(Run.Listeners.length, 1, "one listener");
    assert.equal(Run.Listeners[0]?.name, "agent/status", "on the idle edge");
  });
  Check(Count, "selfcheck: the activation line is the factory's ledger shape", () => {
    assert.deepEqual(Run.Lines, [`hook-dsh-lesson-nudge: activated (bundle=${"0.2.1"}, cap=3)`]);
  });
  Check(Count, "selfcheck: the loader contract exports are all present", () => {
    assert.equal(name, "hook-dsh-lesson-nudge", "the name");
    assert.deepEqual(inject, ["pluginFactory"], "the inject list");
    assert.equal(typeof apply, "function", "the apply function");
    assert.notEqual(Config, void 0, "the schema");
  });
  if (Count.N === 5 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Check,
  CheckAsync,
  Config,
  FakeAgent,
  FakeFactory,
  FakeLesson,
  Finish,
  Make,
  MakeCounter,
  Settle,
  Status,
  apply,
  inject,
  name
};
//# sourceMappingURL=Harness.js.map
