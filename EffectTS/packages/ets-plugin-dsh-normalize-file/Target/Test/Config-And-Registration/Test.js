import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  {
    const Raw1 = Validate({ logFile: Ledger });
    const Run1 = Make(Raw1);
    const Tool = Run1.Registered[0];
    {
      const Sub = "volatile cell: log arrives as { get }";
      Check(Count, Sub, () => {
        assert.ok(Raw1.log && typeof Raw1.log.get === "function");
      });
    }
    {
      const Sub = "volatile cell: logFile arrives as { get }";
      Check(Count, Sub, () => {
        assert.ok(typeof Raw1.logFile.get === "function");
      });
    }
    {
      const Sub = "volatile cell: replacement arrives as { get }";
      Check(Count, Sub, () => {
        assert.ok(typeof Raw1.replacement.get === "function");
      });
    }
    {
      const Sub = "minimal schema: no stream flags and no fs/observed fields (shared: false + two knobs)";
      Check(Count, Sub, () => {
        assert.ok(Raw1.normalizeReasoning === void 0 && Raw1.mutationTools === void 0);
      });
    }
    {
      const Sub = "no stream listener (the family's first listener-less flavor); the three listeners are the P10 volatile-update refresh and the two overpass arms (both opt-in, gated at runtime)";
      Check(Count, Sub, () => {
        assert.ok(
          Object.keys(Run1.Listeners).length === 3 && Run1.Listeners["loader/volatile-update"] !== void 0 && Run1.Listeners["tools/post-execute"] !== void 0 && Run1.Listeners["agent/pre-step"] !== void 0
        );
      });
    }
    {
      const Sub = "exactly one tool registered";
      Check(Count, Sub, () => {
        assert.ok(Run1.Registered.length === 1);
      });
    }
    {
      const Sub = "the tool registration is captured: the tool is named normalize-file";
      Check(Count, Sub, () => {
        assert.ok(Tool && Tool.name === "normalize-file");
      });
    }
    {
      const Sub = "input schema: file_path is a required string";
      Check(Count, Sub, () => {
        assert.ok(
          Tool.parameters.properties.file_path.type === "string" && Tool.parameters.required.includes("file_path")
        );
      });
    }
    {
      const Sub = "state carries the REAL factory instance";
      Check(Count, Sub, () => {
        assert.ok(Run1.State && Run1.State.Factory === Furnace);
      });
    }
    {
      const Sub = "volatile unwrap: logFile cell unwrapped to State.Ledger";
      Check(Count, Sub, () => {
        assert.ok(Run1.State.Ledger === "/tmp/normalize-file-smoke-ledger.log");
      });
    }
    {
      const Sub = "volatile unwrap: log cell unwrapped to State.Enabled=true";
      Check(Count, Sub, () => {
        assert.ok(Run1.State.Enabled === true);
      });
    }
    {
      const Sub = "volatile unwrap: replacement cell unwrapped to State.Replacement='-'";
      Check(Count, Sub, () => {
        assert.ok(Run1.State.Replacement === "-");
      });
    }
    {
      const Sub = "tool flavor: state carries no stream flags (no Reasoning/ToolArgs)";
      Check(Count, Sub, () => {
        assert.ok(!("Reasoning" in Run1.State) && !("ToolArgs" in Run1.State));
      });
    }
    {
      const Sub = "state module = plugin-dsh-normalize-file (the ledger prefix)";
      Check(Count, Sub, () => {
        assert.ok(Run1.State.Module === "plugin-dsh-normalize-file");
      });
    }
    {
      const Sub = "activation ledger line byte-exact";
      Check(Count, Sub, () => {
        assert.ok(
          Run1.Lines.includes(
            "plugin-dsh-normalize-file: activated (replacement=-, logFile=/tmp/normalize-file-smoke-ledger.log)"
          )
        );
      });
    }
    {
      const Sub = "apply journals NOTHING (the family's stream-flavor posture - only the tool's N>0 count is journaled, unlike the trio's activated record)";
      Check(Count, Sub, () => {
        assert.ok(Furnace.PendingJournal.length === 0);
      });
    }
    {
      const Sub = "no normalized journal record before any tool call";
      Check(Count, Sub, () => {
        assert.ok(Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 0);
      });
    }
  }
  {
    const Run1 = Make(Validate({ logFile: Ledger }));
    const Run6 = Make(Validate({ replacement: "$&", logFile: Ledger }));
    const First = Run1.State;
    const Second = Run6.State;
    {
      const Sub = "each apply builds a FRESH state (no module-level globals)";
      Check(Count, Sub, () => {
        assert.ok(First !== Second && First.Replacement === "-" && Second.Replacement === "$&");
      });
    }
  }
  return Finish(Count, "Config-And-Registration");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Config-And-Registration`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
