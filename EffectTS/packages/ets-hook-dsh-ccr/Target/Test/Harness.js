import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { rmSync } from "node:fs";
import CCR from "../../Target/Library.js";
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
const Ledger = "/tmp/ccr-smoke-ledger.log";
const JournalPath = "/tmp/ccr-smoke-journal.jsonl";
const Rm = () => {
  try {
    rmSync(Ledger);
  } catch {
  }
  try {
    rmSync(JournalPath);
  } catch {
  }
};
const Furnace = new FactoryClass({
  reflect: { provide: () => void 0 }
});
const { Config: Schema } = CCR;
const Validate = (Raw) => Schema({ ...Raw });
const Make = (Raw) => {
  const Listeners = {};
  const ListenerOptions = {};
  const Lines = [];
  const Warns = [];
  const Registered = [];
  const Context = {
    // The service accessor (typed via Interface/Factory's augmentation): the
    // REAL factory instance, guaranteed present by
    // `inject: ["pluginFactory", "tools"]`.
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
        Warns.push(M);
      }
    },
    // The tool registry seam: records every registered definition.
    tools: {
      register: (Definition) => {
        Registered.push(Definition);
        return () => true;
      }
    },
    // The ROOT seam: cordis plugin contexts inherit `root`.
    get root() {
      return Context;
    }
  };
  CCR.apply(Context, Raw);
  return {
    Context,
    Listeners,
    ListenerOptions,
    Lines,
    Warns,
    Registered,
    State: Context.__ccrState
  };
};
const HashOf = (Content) => createHash("sha256").update(JSON.stringify(Content)).digest("hex").slice(0, 24);
const SizeOf = (Content) => Buffer.byteLength(JSON.stringify(Content), "utf8");
const TextBlock = (Text) => [{ type: "text", text: Text }];
const Exec = (Name) => ({
  callId: "call_smoke",
  name: Name,
  arguments: {},
  signal: new AbortController().signal
});
const NextAccept = async () => ({ kind: "accept" });
const TerminalText = (Fill, Rows) => {
  const Body = [];
  for (let I = 0; I < Rows; I += 1) Body.push(`row ${I} ${Fill}`);
  return `make: starting
exit code: 0
${Body.join("\n")}`;
};
const PlainText = (Bytes) => "x".repeat(Math.max(0, Bytes - 2));
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Count = MakeCounter();
  Check(Count, "selfcheck: a passing assertion counts as PASS", () => {
    assert.equal(1, 1);
  });
  Check(Count, "selfcheck: a failing assertion counts as FAIL (expected)", () => {
    assert.equal(1, 2);
  });
  Rm();
  const Seamed = Make(Validate({ logFile: Ledger }));
  Check(Count, "selfcheck: the fake ctx registers the apply-time listeners", () => {
    assert.ok(typeof Seamed.Listeners["tools/post-execute"] === "function");
    assert.ok(Seamed.State.Factory === Furnace);
    assert.equal(Seamed.State.Module, "ccr");
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
  Exec,
  Finish,
  Furnace,
  HashOf,
  JournalPath,
  Ledger,
  Make,
  MakeCounter,
  NextAccept,
  PlainText,
  Rm,
  SizeOf,
  TerminalText,
  TextBlock,
  Validate
};
//# sourceMappingURL=Harness.js.map
