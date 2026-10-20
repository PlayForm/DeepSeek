import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import * as Pinner from "../../Target/Library.js";
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
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "pinner-smoke-"));
const Ledger = Path.join(Root, "ledger-main.log");
const LoggerLines = { info: [], error: [] };
const fakeLogger = {
  info: (m) => LoggerLines.info.push(m),
  error: (m) => LoggerLines.error.push(m)
};
const Race = { Armed: null };
const token = (p) => {
  const s = FileSystem.statSync(p);
  return `dev:${s.dev}:${s.size}:${s.mtimeNs}:${s.ctimeNs}`;
};
const MakeContext = () => {
  const ctx = {
    logger: fakeLogger,
    events: [],
    emitted: [],
    effects: [],
    serviceGets: [],
    services: {},
    reads: [],
    writes: [],
    on: (name, fn) => {
      ctx.events.push([name, fn]);
      return () => true;
    },
    emit: (name, ...args) => ctx.emitted.push([name, ...args]),
    effect: (fn, label) => {
      const dispose = fn();
      ctx.effects.push([label, dispose]);
      return () => {
        const i = ctx.effects.findIndex((e) => e[0] === label);
        if (i >= 0) ctx.effects.splice(i, 1);
      };
    },
    get: (name) => {
      ctx.serviceGets.push(name);
      return ctx.services[name];
    },
    reflect: {
      provide: (name, value) => {
        ctx.services[name] = value;
        ctx[name] = value;
      }
    },
    // The ROOT seam: the Wire registers on the root scope (`Context.root.on`),
    // so the fake ctx must be its own root - ctx.root.on records into the
    // same ctx.events capture (a harness seam; zero assertion changes).
    get root() {
      return ctx;
    }
  };
  ctx.fs = {
    sandboxMode: void 0,
    readText: async (target, signal) => {
      ctx.reads.push([target.displayPath, signal !== void 0]);
      return FileSystem.readFileSync(target.displayPath, "utf8");
    },
    writeText: async (target, content, intent, signal, fence) => {
      const current = FileSystem.existsSync(target.displayPath) ? token(target.displayPath) : null;
      if (intent?.kind === "replaceIfVersion" && current !== intent.version)
        throw new Error(`FS_STALE_VERSION: ${target.displayPath}`);
      FileSystem.writeFileSync(target.displayPath, content);
      ctx.writes.push({
        path: target.displayPath,
        content,
        intent,
        signal: signal ?? null,
        fence: fence ?? null
      });
      return { version: token(target.displayPath) };
    },
    stat: async (target) => {
      const version = token(target.displayPath);
      if (Race.Armed && Race.Armed.path === target.displayPath) {
        FileSystem.writeFileSync(Race.Armed.path, Race.Armed.content);
        Race.Armed = null;
      }
      return { version };
    }
  };
  return ctx;
};
const Write = (p, content) => {
  FileSystem.mkdirSync(Path.dirname(p), { recursive: true });
  FileSystem.writeFileSync(p, content);
  return p;
};
const Lines = (ledger) => FileSystem.existsSync(ledger) ? FileSystem.readFileSync(ledger, "utf8").split("\n").filter(Boolean) : [];
const LedgerHas = (ledger, fragment) => Lines(ledger).some((l) => l.endsWith(fragment));
const LedgerCount = (ledger, fragment) => Lines(ledger).filter((l) => l.endsWith(fragment)).length;
const Settle = async (st) => {
  for (let i = 0; i < 500; i++) {
    if (st.Inflight.size === 0) return;
    await new Promise((r) => setImmediate(r));
  }
  throw new Error("the detached continuation never settled");
};
const Wait = () => new Promise((r) => setImmediate(() => setImmediate(r)));
const Validate = (Raw) => Pinner.Config({ ...Raw });
const Boot = () => {
  const ctx = MakeContext();
  const Factory = new FactoryClass(ctx);
  const cfg = Validate({ log: true, logFile: Ledger });
  const Returned = Pinner.apply(ctx, cfg);
  const st = ctx.__hookDshPinnerPackageState;
  return {
    ctx,
    Factory,
    cfg,
    Returned,
    st,
    listener: ctx.events.find((e) => e[0] === "fs/observed")[1]
  };
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
  const World = Boot();
  Check(Count, "selfcheck: the real-token fs registers the pinner's apply-time wiring", () => {
    assert.ok(World.ctx.events.some((e) => e[0] === "fs/observed"));
    assert.equal(World.ctx.pluginFactory, World.Factory);
    assert.equal(World.st.Module, "hook-dsh-pinner-package");
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
  Ledger,
  LedgerCount,
  LedgerHas,
  Lines,
  LoggerLines,
  MakeContext,
  MakeCounter,
  Race,
  Root,
  Settle,
  Validate,
  Wait,
  Write,
  token
};
//# sourceMappingURL=Harness.js.map
