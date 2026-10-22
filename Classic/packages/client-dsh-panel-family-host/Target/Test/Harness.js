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
const MakeRoot = () => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "panel-host-smoke-"));
const Make = (Raw) => {
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
    provide: (Name, Value) => {
      Provided[Name] = Value ?? true;
      return () => true;
    }
  };
  const Run = {
    Context,
    Lines,
    Warns,
    Provided,
    Raw
  };
  Run.Returned = Plugin.apply(Context, Raw);
  Run.Service = Provided["panelFamilyHost"];
  return Run;
};
const Validate = (Raw) => Plugin.Config({ ...Raw });
const Put = (Dir, Name, Content) => {
  const File = Path.join(Dir, Name);
  FileSystem.writeFileSync(File, Content, "utf8");
  return File;
};
const Bytes = (File) => FileSystem.readFileSync(File);
const Names = (Dir) => FileSystem.readdirSync(Dir).sort();
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
  const Run = Make(Validate({ enabled: true, logRoot: MakeRoot() }));
  Check(Count, "selfcheck: the fake ctx registers the plugin's apply-time wiring", () => {
    assert.equal(Run.Returned, void 0);
    assert.ok(Run.Service !== void 0);
    assert.equal(typeof Run.Service.tail, "function");
    assert.equal(typeof Run.Service.stats, "function");
    assert.deepEqual(Run.Lines, ["host: activated (enabled=true)"]);
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Bytes,
  Check,
  CheckAsync,
  Finish,
  LinesWith,
  Make,
  MakeCounter,
  MakeRoot,
  Names,
  Plugin,
  Put,
  Validate
};
//# sourceMappingURL=Harness.js.map
