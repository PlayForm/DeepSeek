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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pass-on-smoke-"));
const Ledger = Path.join(Root, "pass-on.log");
const Seed = (Relative, Content) => {
  const Full = Path.join(Root, Relative);
  FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
  FileSystem.writeFileSync(Full, Content);
  return Full;
};
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
const Validate = (Raw = {}) => Plugin.Config({
  ...Raw
});
const Make = (Raw = {}) => {
  const Provided = {};
  const Lines = [];
  const Emits = [];
  const Services = {};
  let Context;
  Context = {
    logger: {
      info: (Message) => {
        Lines.push(Message);
      },
      warn: (Message) => {
        Lines.push(Message);
      }
    },
    emit: (Name, ...Args) => {
      Emits.push([Name, ...Args]);
    },
    get: (Name) => Services[Name],
    reflect: {
      provide: (Name, Value) => {
        Provided[Name] = Value ?? true;
        Context[Name] = Value;
        return () => true;
      }
    }
  };
  const Config = Validate({ logFile: Ledger, root: Root, ...Raw });
  const Instance = new Plugin(Context, Config);
  return { Context, Provided, Lines, Emits, Services, Config, Instance, State: Instance.State };
};
const LinesWith = (Run, Needle) => Run.Lines.filter((Line) => Line.includes(Needle));
const LedgerWith = (Needle) => LedgerLines().filter((Line) => Line.includes(Needle));
const VersionOf = async (Full) => (await import("node:crypto")).createHash("sha256").update(FileSystem.readFileSync(Full)).digest("hex");
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
  const Run = Make({ enabled: false });
  Check(Count, "selfcheck: the fake ctx constructs the plugin instance", () => {
    assert.equal(Run.Provided.passOn, Run.Instance);
    assert.equal(Run.Instance.name, "passOn");
    assert.equal(Run.Instance.Prepare({ kind: "replace" }), null);
    assert.equal(Run.Lines.length, 0);
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
  Finish,
  Ledger,
  LedgerLines,
  LedgerWith,
  LinesWith,
  Make,
  MakeCounter,
  Plugin,
  Root,
  Seed,
  Validate,
  VersionOf,
  rm
};
//# sourceMappingURL=Harness.js.map
