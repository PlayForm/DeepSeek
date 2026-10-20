import assert from "node:assert/strict";
import {
  Check,
  Finish,
  Furnace,
  MakeCounter,
  Ledger,
  Make,
  rm,
  Validate
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  rm();
  const Raw1 = Validate({ logFile: Ledger });
  const Run1 = Make(Raw1);
  {
    const Sub = "volatile cell: log arrives as { get }";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Raw1.log && typeof Raw1.log.get === "function",
          "volatile cell: log arrives as { get }"
        );
      });
    }
  }
  {
    const Sub = "volatile cell: logFile arrives as { get }";
    {
      Check(Count, Sub, () => {
        assert.ok(
          typeof Raw1.logFile.get === "function",
          "volatile cell: logFile arrives as { get }"
        );
      });
    }
  }
  {
    const Sub = "volatile cell: replacement arrives as { get }";
    {
      Check(Count, Sub, () => {
        assert.ok(
          typeof Raw1.replacement.get === "function",
          "volatile cell: replacement arrives as { get }"
        );
      });
    }
  }
  {
    const Sub = "config default normalizeReasoning=true";
    {
      Check(Count, Sub, () => {
        assert.ok(Raw1.normalizeReasoning === true, "config default normalizeReasoning=true");
      });
    }
  }
  {
    const Sub = "config default normalizeToolArguments=false";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Raw1.normalizeToolArguments === false,
          "config default normalizeToolArguments=false"
        );
      });
    }
  }
  {
    const Sub = "the llm/stream listener is registered";
    {
      Check(Count, Sub, () => {
        assert.ok(
          typeof Run1.Listeners["llm/stream"] === "function",
          "the llm/stream listener is registered"
        );
      });
    }
  }
  {
    const Sub = "llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Object.keys(Run1.Listeners).length === 4 && Run1.Listeners["loader/volatile-update"] !== void 0 && Run1.Listeners["tools/post-execute"] !== void 0 && Run1.Listeners["agent/pre-step"] !== void 0,
          "llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)"
        );
      });
    }
  }
  {
    const Sub = "state carries the REAL factory instance";
    {
      Check(Count, Sub, () => {
        assert.ok(Run1.State && Run1.State.Factory === Furnace, "state carries the REAL factory instance");
      });
    }
  }
  {
    const Sub = "volatile unwrap: logFile cell unwrapped to State.Ledger";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.State.Ledger === "/tmp/ellipsis-smoke-ledger.log",
          "volatile unwrap: logFile cell unwrapped to State.Ledger"
        );
      });
    }
  }
  {
    const Sub = "volatile unwrap: log cell unwrapped to State.Enabled=true";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.State.Enabled === true,
          "volatile unwrap: log cell unwrapped to State.Enabled=true"
        );
      });
    }
  }
  {
    const Sub = "volatile unwrap: replacement cell unwrapped to State.Replacement='...'";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.State.Replacement === "...",
          "volatile unwrap: replacement cell unwrapped to State.Replacement='...'"
        );
      });
    }
  }
  {
    const Sub = "plain fields: Reasoning=true, ToolArgs=false";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.State.Reasoning === true && Run1.State.ToolArgs === false,
          "plain fields: Reasoning=true, ToolArgs=false"
        );
      });
    }
  }
  {
    const Sub = "state module = hook-dsh-normalize-ellipsis (the ledger prefix)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.State.Module === "hook-dsh-normalize-ellipsis",
          "state module = hook-dsh-normalize-ellipsis (the ledger prefix)"
        );
      });
    }
  }
  {
    const Sub = "activation ledger line byte-exact";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Run1.Lines.includes(
            "hook-dsh-normalize-ellipsis: activated (replacement=..., reasoning=on, toolArgs=off, logFile=/tmp/ellipsis-smoke-ledger.log)"
          ),
          "activation ledger line byte-exact"
        );
      });
    }
  }
  return Finish(Count, "Config-And-State");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Config-And-State`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
