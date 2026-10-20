import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import Invisible from "../../Target/Library.js";
import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
const { apply, Config: Schema } = Invisible;
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
const Furnace = new FactoryClass(
  { reflect: { provide: () => void 0 } }
);
const Ledger = "/tmp/invisible-smoke-ledger.log";
const rm = () => {
  try {
    FileSystem.rmSync(Ledger);
  } catch {
  }
};
const Validate = (Raw) => Schema({ ...Raw });
const Make = (Raw) => {
  const Listeners = {};
  const ListenerOptions = {};
  const Lines = [];
  const CommandsRegistered = [];
  const Context = {
    // The service accessor (typed via Interface/Factory's augmentation): the
    // REAL factory instance, guaranteed present by `inject: ["pluginFactory"]`.
    pluginFactory: Furnace,
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
    }
  };
  apply(Context, Raw);
  return {
    Context,
    Listeners,
    ListenerOptions,
    Lines,
    CommandsRegistered,
    State: Context.__hookDshInvisibleState
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
  if (Count.N === 2 && Count.F === 1) {
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
  Validate,
  rm
};
//# sourceMappingURL=Harness.js.map
