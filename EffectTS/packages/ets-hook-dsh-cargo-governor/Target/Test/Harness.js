import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Cargo from "../../Target/Library.js";
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "cargo-smoke-"));
const Provided = {};
const LoggerLines = { info: [], error: [] };
const fakeLogger = {
  info: (m) => LoggerLines.info.push(m),
  error: (m) => LoggerLines.error.push(m)
};
let ProbeState = null;
const MakeContext = (Over = {}) => {
  const captured = {
    events: [],
    emitted: [],
    effects: [],
    serviceGets: [],
    writes: [],
    reads: [],
    controllers: [],
    started: []
  };
  const services = Over.services ?? {};
  const files = Over.files ?? {};
  const store = { sandboxMode: Over.sandboxMode };
  const ctx = {
    logger: fakeLogger,
    reflect: {
      provide: (name, value) => {
        Provided[name] = value;
      }
    },
    on: (name, fn) => {
      captured.events.push([name, fn]);
      return () => true;
    },
    emit: (name, ...args) => {
      captured.emitted.push([name, ...args]);
    },
    effect: (fn, label) => {
      const dispose = fn();
      captured.effects.push([label, dispose]);
      return () => {
      };
    },
    // Attach's P5 factory probe (ctx.get "pluginFactory") must find the real
    // factory: the scenarios wire it as a ctx property
    // (`m.ctx.pluginFactory = Furnace`), so get falls through to the ctx
    // property when the services map lacks the name - without it the shared
    // sink is never bound and the pre-bind buffer never drains.
    get: (name) => {
      captured.serviceGets.push(name);
      return services[name] ?? ctx[name];
    },
    fs: {
      get sandboxMode() {
        return store.sandboxMode;
      },
      set sandboxMode(v) {
        store.sandboxMode = v;
      },
      readText: async (target, signal) => {
        captured.reads.push([target.displayPath, !!signal]);
        const file = files[target.displayPath];
        if (file === void 0) throw new Error("vanished");
        return file;
      },
      writeText: async (target, content, intent, signal, fence) => {
        captured.writes.push({
          path: target.displayPath,
          content,
          intent,
          signal: signal ?? null,
          fence: fence ?? null,
          inflight: ProbeState ? ProbeState.Inflight.size : -1
        });
        files[target.displayPath] = content;
        return { version: Over.freshVersion ?? "fresh-v2" };
      },
      stat: async () => ({ version: "stat-v9" })
    },
    // The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
    // so the fake ctx must be its own root - ctx.root.on records into the
    // same captured.events (a harness seam; zero assertion changes).
    get root() {
      return ctx;
    }
  };
  return { ctx, captured, files, services, store };
};
const Furnace = new FactoryClass({
  logger: fakeLogger,
  reflect: {
    provide: (name, value) => {
      Provided[name] = value;
    }
  },
  fs: { sandboxMode: void 0 }
});
const Group = (name) => {
  const dir = Path.join(Root, name);
  FileSystem.mkdirSync(dir, { recursive: true });
  return dir;
};
const LedgerFile = (name) => Path.join(Root, `${name}.log`);
const Ledger = (file) => FileSystem.existsSync(file) ? FileSystem.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => l.replace(/^\[[^\]]+\] /, "")) : [];
const Boot = (m, user = {}) => {
  const cfg = Validate({ logFile: m.ledger, updateCooldownMs: 0, ...user });
  ProbeState = null;
  const ret = Cargo.apply(m.ctx, cfg);
  ProbeState = m.ctx.__hookDshGovernorCargoState;
  m.listener = m.captured.events.filter((e) => e[0] === "fs/observed").at(-1)?.[1];
  return { cfg, ret, listener: m.listener };
};
const Fire = (m, t, version = "v1", actor = "edit") => m.listener?.(t, { kind: "present", version }, { name: actor });
const Registry = (dir, names) => FileSystem.writeFileSync(
  Path.join(dir, "registry.json"),
  JSON.stringify({ effectiveLatest: names })
);
const Policy = (dir, body) => FileSystem.writeFileSync(Path.join(dir, "update-policy.json"), JSON.stringify(body));
const SeamStub = (outcome = { exitCode: 0 }, stdoutText = "") => {
  const calls = [];
  return {
    calls,
    resolveExecutable: async (bin) => `/resolved/${bin}`,
    spawn: (req) => {
      calls.push(req);
      return {
        done: Promise.resolve(outcome),
        collected: {
          stdout: { readFrom: () => ({ text: stdoutText }) },
          stderr: { readFrom: () => ({ text: "" }) }
        }
      };
    }
  };
};
const Flush = async () => {
  for (let i = 0; i < 12; i += 1) await new Promise((r) => setImmediate(r));
};
const Validate = (Raw) => Cargo.Config({ ...Raw });
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  const m = MakeContext({ services: { subprocess: SeamStub() } });
  m.ctx.pluginFactory = Furnace;
  m.ledger = LedgerFile("selfcheck");
  Boot(m);
  Check(Count, "selfcheck: the fake ctx registers the cargo governor's apply-time wiring", () => {
    assert.ok(m.captured.events.some((e) => e[0] === "fs/observed"));
    assert.equal(m.ctx.pluginFactory, Furnace);
    assert.equal(ProbeState.Module, "hook-dsh-governor-cargo");
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
  Finish,
  Fire,
  Flush,
  Furnace,
  Group,
  Ledger,
  LedgerFile,
  LoggerLines,
  MakeContext,
  MakeCounter,
  Policy,
  ProbeState,
  Provided,
  Registry,
  Root,
  SeamStub,
  Validate
};
//# sourceMappingURL=Harness.js.map
