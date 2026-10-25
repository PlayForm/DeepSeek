import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import FactoryClass from "../../Target/Library.js";
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
const TempRoot = (Prefix) => mkdtempSync(Path.join(OS.tmpdir(), Prefix));
const Make = (Factory, Raw = {}) => {
  if (Factory) {
    Factory.PendingJournal = [];
    Factory.SharedJournal = void 0;
    Factory.SharedJournals = void 0;
  }
  const Over = Raw.files ? Raw : { ...Raw, files: {} };
  const provided = {};
  const events = [];
  const emitted = [];
  const effects = [];
  const serviceGets = [];
  const services = {};
  const loggerLines = { info: [], error: [] };
  const reads = [];
  const writes = [];
  const stats = [];
  const appended = [];
  const fakeLogger = {
    info: (M) => loggerLines.info.push(M),
    error: (M) => loggerLines.error.push(M)
  };
  const Context = {
    logger: fakeLogger,
    on: (Name, Listener) => {
      events.push([Name, Listener]);
      return () => true;
    },
    emit: (Name, ...Args) => emitted.push([Name, ...Args]),
    effect: (Function, Label) => {
      const Dispose = Function();
      effects.push([Label, Dispose]);
      return () => effects.splice(
        effects.findIndex((E) => E[0] === Label),
        1
      );
    },
    get: (Name) => {
      serviceGets.push(Name);
      return services[Name];
    },
    fs: {
      sandboxMode: void 0,
      readText: async (Target, Signal) => {
        reads.push([Target.displayPath, !!Signal]);
        const File = Over.files?.[Target.displayPath];
        if (File === void 0) throw new Error("vanished");
        return File;
      },
      writeText: async (Target, Content, Intent, Signal, Fence) => {
        writes.push({
          path: Target.displayPath,
          content: Content,
          intent: Intent,
          signal: Signal ?? null,
          fence: Fence ?? null
        });
        Over.files[Target.displayPath] = Content;
        return { version: "fresh-v2" };
      },
      // The Continue chain pass's fresh-stat probe. The default returns the
      // CURRENT file version ("v1" - the unraced basis); a scenario that
      // models the file advancing overrides `stat` (the raced pass).
      stat: Raw.stat ?? (async (Target, Signal) => {
        stats.push([Target.displayPath, Signal !== void 0]);
        return { version: "v1" };
      })
    },
    reflect: { provide: (Name, Value) => provided[Name] = Value },
    // The public provide seam (the factory's trace registration): the real
    // Service base uses reflect.provide; `ctx.provide` is the mixed-in
    // public form the constructor calls for `ctx.trace`. The fake sets the
    // context property so a consumer probe resolves, and records it in the
    // same `provided` capture.
    provide: (Name, Value) => {
      provided[Name] = Value;
      Context[Name] = Value;
      return () => true;
    },
    // cordis plugin contexts inherit `root` (the shared event bus scope); the
    // fake ctx is its own root.
    get root() {
      return Context;
    }
  };
  return {
    Context,
    provided,
    events,
    emitted,
    effects,
    serviceGets,
    services,
    loggerLines,
    reads,
    writes,
    stats,
    appended
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
  const Seamed = Make(null, { files: {} });
  const Self = new FactoryClass(Seamed.Context);
  Check(Count, "selfcheck: the fake ctx registers the Service instance", () => {
    assert.equal(Seamed.provided["pluginFactory"], Self);
    assert.equal(Self.name, "pluginFactory");
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
  FactoryClass,
  Finish,
  Make,
  MakeCounter,
  TempRoot
};
//# sourceMappingURL=Harness.js.map
