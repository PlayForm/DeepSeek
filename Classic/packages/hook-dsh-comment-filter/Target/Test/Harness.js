import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import CommentFilter from "../../Target/Library.js";
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
const Ledger = "/tmp/comment-filter-smoke-ledger.log";
const Rm = () => {
  try {
    rmSync(Ledger);
  } catch {
  }
};
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const { apply, Config: Schema } = CommentFilter;
const Validate = (Raw) => Schema({ ...Raw });
const Make = (Raw) => {
  const Listeners = {}, ListenerOptions = {}, Lines = [];
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
        default:
          throw new Error(`unknown service: ${Name}`);
      }
    },
    logger: {
      info: (M) => {
        Lines.push(M);
      },
      warn: (M) => {
        Lines.push(M);
      }
    },
    // The emit seam: a synchronous recorder (the plugin emits nothing, but
    // the fake ctx must answer the API).
    emit: () => void 0,
    // The effect seam: run the callback now and hand back its disposer.
    effect: (Callback) => {
      const Disposer = Callback?.();
      return typeof Disposer === "function" ? Disposer : () => true;
    },
    // The ROOT seam: cordis plugin contexts inherit `root`; the fake ctx is
    // its own root.
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
    State: Context.__hookDshCommentFilterState
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
    assert.ok(typeof Seamed.Listeners["tools/post-execute"] === "function");
    assert.ok(typeof Seamed.Listeners["agent/pre-step"] === "function");
    assert.ok(Seamed.State.Factory === Furnace);
    assert.equal(Seamed.State.Module, "hook-dsh-comment-filter");
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
