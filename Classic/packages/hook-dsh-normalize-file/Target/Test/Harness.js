import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import NormalizeFile from "../../Target/Library.js";
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
const Ledger = "/tmp/normalize-file-smoke-ledger.log";
const Rm = () => {
  try {
    rmSync(Ledger);
  } catch {
  }
};
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const { apply, Config: Schema } = NormalizeFile;
const Validate = (Raw) => Schema({ ...Raw });
const Make = (Raw) => {
  const Listeners = {}, ListenerOptions = {}, Lines = [];
  const Registered = [], CommandsRegistered = [], Resolved = [], Reads = [], Writes = [], Intents = [], Observations = [];
  const Files = /* @__PURE__ */ new Map();
  const Context = {
    // The service accessor (typed via Interface/Factory's augmentation): the
    // REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
    pluginFactory: Furnace,
    // The listener capture: the plugin registers NO STREAM listener - the
    // overpass arms (both opt-in, gated at runtime) are asserted below.
    on: (Name, Listener, Options) => {
      Listeners[Name] = Listener;
      ListenerOptions[Name] = Options;
      return () => true;
    },
    get: (Name) => {
      switch (Name) {
        case "pluginFactory":
          return Furnace;
        // The human-command registry seam (the `normalize-overpass`
        // registration): records every registered definition.
        case "commands":
          return {
            register: (Definition) => {
              CommandsRegistered.push(Definition);
              return () => true;
            }
          };
        default:
          throw new Error(`unknown service: ${Name}`);
      }
    },
    logger: {
      info: (M) => {
        Lines.push(M);
      }
    },
    // The tool registry seam: records every registered definition.
    tools: {
      register: (Definition) => {
        Registered.push(Definition);
        return () => true;
      }
    },
    // The fs seam: resolve manufactures a stable target; readText serves the
    // in-memory file (or throws like the real backend: missing file, binary,
    // abort); writeText records the call, honors the abort signal like a real
    // backend, and reports create/update from its own in-memory prior state.
    fs: {
      sandboxMode: void 0,
      resolve: async (Path, Opts) => {
        Resolved.push({ path: Path, signal: Opts?.signal });
        return { targetKey: `key:${Path}`, displayPath: Path };
      },
      readText: async (Target, Signal) => {
        if (Signal?.aborted) throw new Error("aborted before read");
        Reads.push(Target.displayPath);
        if (Target.displayPath.endsWith(".bin")) {
          throw new Error("FS_NOT_TEXT: binary or non-UTF-8 content");
        }
        const Content = Files.get(Target.targetKey);
        if (Content === void 0) {
          throw new Error("FS_NOT_FOUND: no such file");
        }
        return Content;
      },
      writeText: async (Target, Content, Intent, Signal, Policy) => {
        if (Signal?.aborted) throw new Error("aborted before write");
        Writes.push({
          target: Target,
          content: Content,
          intent: Intent,
          signal: Signal,
          policy: Policy
        });
        const Before = Files.get(Target.targetKey) ?? null;
        Files.set(Target.targetKey, Content);
        return {
          operation: Before === null ? "create" : "update",
          version: `v${Writes.length}`,
          before: Before,
          after: Content
        };
      }
    },
    // The fs/write-intent waterfall: next() delegates to the unconditional
    // default (no observation policy in the smoke harness).
    waterfall: async (Name, Target, Actor, Next) => {
      Intents.push({ name: Name, target: Target, actor: Actor });
      return Next();
    },
    // The fs/observed emit: a synchronous recorder (the governance hooks'
    // trigger - the shared executor must fire it exactly like the built-in
    // write, with the call's exec as the actor).
    emit: (Name, Target, Observation, Actor) => {
      Observations.push({
        name: Name,
        target: Target,
        observation: Observation,
        actor: Actor
      });
    },
    // The ROOT seam: cordis plugin contexts inherit `root` - the shared write
    // executor's fs/observed emit goes through ctx.root (the built-in write's
    // own posture: its ctx IS the root). The fake ctx is its own root.
    get root() {
      return Context;
    }
  };
  apply(Context, Raw);
  return {
    Context,
    Listeners,
    ListenerOptions,
    Lines,
    Registered,
    CommandsRegistered,
    Resolved,
    Reads,
    Writes,
    Intents,
    Observations,
    Files,
    State: Context.__hookDshNormalizeFileState
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
  const Seamed = Make(Validate({ logFile: Ledger }));
  Check(Count, "selfcheck: the fake ctx registers the apply-time listeners", () => {
    assert.ok(Object.keys(Seamed.Listeners).length === 3);
    assert.ok(Seamed.Registered.length === 1);
    assert.ok(Seamed.State.Factory === Furnace);
    assert.equal(Seamed.State.Module, "hook-dsh-normalize-file");
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
  Furnace,
  Ledger,
  Make,
  MakeCounter,
  Rm,
  Validate
};
//# sourceMappingURL=Harness.js.map
