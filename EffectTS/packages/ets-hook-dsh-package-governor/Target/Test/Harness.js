import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Governor from "../../Target/Library.js";
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
const NCU_BIN = "ncu";
const EXCLUDE = ["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"];
const TOOLS = ["write", "edit", "str_replace_editor", "raw-write"];
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "governor-smoke-"));
const Ledger = Path.join(Root, "governor.log");
const Provided = {};
const Events = [];
const Emitted = [];
const Effects = [];
const ServiceGets = [];
const LoggerLines = { info: [], error: [] };
const Reads = [];
const Writes = [];
const SpawnSpecs = [];
const JobStarts = [];
const JobRings = [];
const StorageRecords = [];
const Controllers = [];
const Detached = [];
const Domain = { Closed: false };
const Spawn = { Exits: [], Out: "" };
const Inflight = { DuringRead: -1 };
let WriteSeq = 0;
const fakeLogger = {
  info: (m) => LoggerLines.info.push(m),
  error: (m) => LoggerLines.error.push(m)
};
const MakeContext = (over = {}) => {
  const Context2 = {
    logger: fakeLogger,
    on: (name, fn) => {
      Events.push([name, fn]);
      return () => true;
    },
    emit: (name, ...args) => {
      Emitted.push([name, ...args]);
      for (const [n, fn] of [...Events]) if (n === name) fn(...args);
    },
    effect: (fn, label) => {
      const dispose = fn();
      Effects.push([label, dispose]);
      return () => Effects.splice(
        Effects.findIndex((e) => e[0] === label),
        1
      );
    },
    get: (name) => {
      ServiceGets.push(name);
      return Services[name] ?? Context2[name];
    },
    fs: {
      sandboxMode: void 0,
      readText: async (target, signal) => {
        Reads.push([target.displayPath, !!signal]);
        over.onRead?.(target);
        const file = over.files?.[target.displayPath];
        if (file === void 0) throw new Error("vanished");
        return file;
      },
      writeText: async (target, content, intent, signal, fence) => {
        Writes.push({
          path: target.displayPath,
          content,
          intent,
          signal: signal ?? null,
          fence: fence ?? null
        });
        over.files[target.displayPath] = content;
        return { version: `fresh-${++WriteSeq}` };
      },
      stat: async () => ({ version: "stat-v9" })
    },
    reflect: { provide: (name, value) => Provided[name] = value },
    // cordis plugin contexts inherit `root` (the shared event bus scope); the
    // fake ctx is its own root.
    get root() {
      return Context2;
    }
  };
  return Context2;
};
const Files = {};
const Services = {};
const Context = MakeContext({ files: Files });
Context.__spy = {
  onRead: () => {
  }
};
Context.fs.readText = async (target, signal) => {
  Reads.push([target.displayPath, !!signal]);
  if (typeof Probe !== "undefined" && Probe) Inflight.DuringRead = Probe.Inflight.size;
  const file = Files[target.displayPath];
  if (file === void 0) throw new Error("vanished");
  return file;
};
Services["subprocess"] = {
  resolveExecutable: async (bin) => `resolved:${bin}`,
  spawn: (spec) => {
    SpawnSpecs.push(spec);
    const exit = Spawn.Exits.length ? Spawn.Exits.shift() : 0;
    return {
      done: Promise.resolve({ exitCode: exit }),
      collected: {
        stdout: { readFrom: () => Spawn.Out ? { text: Spawn.Out } : void 0 },
        stderr: { readFrom: () => void 0 }
      }
    };
  }
};
Services["jobs"] = {
  attachController: (name) => {
    Controllers.push(name);
    return () => Detached.push(name);
  },
  start: (spec) => {
    JobStarts.push(spec);
    const ring = [];
    JobRings.push(ring);
    const hooks = spec.run({ append: (t) => ring.push(t) });
    hooks.done.catch(() => {
    });
    return "governor-update-1";
  }
};
Services["storageDomain"] = {
  open: async () => ({
    close: async () => {
      Domain.Closed = true;
    },
    table: () => ({ put: async (k, v) => StorageRecords.push([k, v]) })
  })
};
const ledgerLines = () => FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
const find = (needle) => ledgerLines().filter((l) => l.includes(needle));
const settle = async (turns = 8) => {
  for (let i = 0; i < turns; i++) await new Promise((r) => setImmediate(r));
};
const mkTarget = (dir, key) => ({
  targetKey: key,
  displayPath: Path.join(dir, "package.json")
});
const actor = { name: "edit" };
const Validate = (Raw) => Governor.Config({ ...Raw });
const Furnace = new FactoryClass(Context);
Context.pluginFactory = Furnace;
let Probe = null;
const Boot = () => {
  const Raw = Validate({ logFile: Ledger });
  Governor.apply(Context, Raw);
  Probe = Context.__hookDshGovernorPackageState;
  return Probe;
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
  const State = Boot();
  Check(Count, "selfcheck: the fake ctx registers the governor's apply-time wiring", () => {
    assert.ok(Events.some(([n]) => n === "fs/observed"));
    assert.equal(State.Factory, Furnace);
    assert.equal(State.Module, "hook-dsh-governor-package");
  });
  if (Count.N === 3 && Count.F === 1) {
    console.log("Harness selfcheck OK");
  } else {
    console.log(`Harness selfcheck BROKEN (N=${Count.N}, F=${Count.F})`);
    process.exitCode = 1;
  }
}
export {
  Boot,
  Check,
  CheckAsync,
  Context,
  Controllers,
  Detached,
  Domain,
  EXCLUDE,
  Effects,
  Emitted,
  Events,
  Files,
  Finish,
  Furnace,
  Inflight,
  JobRings,
  JobStarts,
  Ledger,
  LoggerLines,
  MakeContext,
  MakeCounter,
  NCU_BIN,
  Probe,
  Provided,
  Reads,
  Root,
  ServiceGets,
  Services,
  Spawn,
  SpawnSpecs,
  StorageRecords,
  TOOLS,
  Validate,
  Writes,
  actor,
  find,
  ledgerLines,
  mkTarget,
  settle
};
//# sourceMappingURL=Harness.js.map
