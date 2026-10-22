import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import PatternService from "../../Target/Library.js";
const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pattern-smoke-home-"));
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
  await new Promise((Resolve) => setTimeout(Resolve, 20));
};
const Make = (Knobs = {}) => {
  const Lines = [];
  const Warns = [];
  const Provided = {};
  const Context = {
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Warns.push(M);
      }
    },
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value ?? true;
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  const Service = new PatternService(Context);
  if (Object.keys(Knobs).length > 0) {
    Service.Configure(Knobs);
  }
  return { Context, Service, Lines, Warns, Provided };
};
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
  Check(Count, "selfcheck: the fake ctx registers the service and seeds the catalog", () => {
    assert.equal(Run.Provided["pattern"], Run.Service);
    assert.equal(Run.Service.name, "pattern");
    assert.equal(Run.Service.List().length, 4);
    assert.deepEqual(Run.Lines, ["pattern: activated (seeded 4 patterns) (logFile ~/.dsh/pattern.log)"]);
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
  Home,
  Make,
  MakeCounter,
  Messages,
  PatternService,
  Settle
};
//# sourceMappingURL=Harness.js.map
