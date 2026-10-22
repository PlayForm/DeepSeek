import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import Plugin from "../../Target/Library.js";
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
const Finish = (Count, Name) => {
  if (Count.F !== 0) {
    throw new Error(`${Name}: ${Count.F} failed check(s)`);
  }
  return Count.N;
};
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "feedback-smoke-"));
const Ledger = Path.join(Root, "feedback.log");
const rm = () => {
  try {
    FileSystem.rmSync(Ledger);
  } catch {
  }
};
const JournalLines = () => (() => {
  try {
    return FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).map((Line) => JSON.parse(Line));
  } catch {
    return [];
  }
})();
const JournalEvents = () => JournalLines().map((Line) => Line.event);
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Make = (Raw) => {
  const Listeners = {};
  const Lines = [];
  const Provided = {};
  const Context = {
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Lines.push(`WARN: ${M}`);
      }
    },
    on: (Name, Listener) => {
      Listeners[Name] = Listener;
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
  const Service = new Plugin(Context, Raw);
  const Run = {
    Context,
    Service,
    Listeners,
    Lines,
    Provided,
    Raw,
    State: Service.State
  };
  return Run;
};
const Fire = (Run, Event) => {
  Run.Listeners["session/event"](void 0, Event);
};
const Block = (Overrides = {}) => ({
  agentId: "agent-a",
  task: "write the smoke",
  session: "session-child",
  liked: "the harness was clear",
  disliked: "the registry lagged",
  deltas: [],
  transferred: [],
  readStatus: "unread",
  at: 1e3,
  ...Overrides
});
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
  Check(Count, "selfcheck: the constructor registers the service and the listener", () => {
    assert.ok(Run.Provided["feedback"] !== void 0);
    assert.ok(Run.Listeners["session/event"] !== void 0);
    assert.equal(Run.State.Config.enabled, true);
    Run.Service.Record(Block());
    assert.equal(JournalEvents()[0], "recorded");
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Block,
  Check,
  Finish,
  Fire,
  JournalEvents,
  JournalLines,
  Ledger,
  Make,
  MakeCounter,
  Plugin,
  Root,
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
