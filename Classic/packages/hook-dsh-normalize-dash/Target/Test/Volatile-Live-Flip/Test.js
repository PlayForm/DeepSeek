import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Ledger } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    Rm();
    let FlipValue = "-";
    const RawV = {
      log: true,
      logFile: Ledger,
      replacement: { get: () => FlipValue },
      normalizeReasoning: true,
      normalizeToolArguments: false
    };
    const RunV = Make(RawV);
    const Activations = () => RunV.Lines.filter((L) => L.includes("activated (")).length;
    {
      const Sub = "P10: the refresh listener is registered";
      Check(Count, Sub, () => {
        assert.ok(RunV.Listeners["loader/volatile-update"] !== void 0);
      });
    }
    {
      const Sub = "P10: exactly one activation line after the mount";
      Check(Count, Sub, () => {
        assert.ok(Activations() === 1);
      });
    }
    {
      const Sub = "P10: the mount-time replacement is the default";
      Check(Count, Sub, () => {
        assert.ok(RunV.State.Replacement === "-");
      });
    }
    const StateRefV = RunV.State;
    FlipValue = "-*-";
    RunV.Listeners["loader/volatile-update"]([["replacement"]]);
    {
      const Sub = "P10: the volatile dispatch refreshed State.Replacement in place";
      Check(Count, Sub, () => {
        assert.ok(RunV.State.Replacement === "-*-");
      });
    }
    {
      const Sub = "P10: the State object identity is preserved (no rebuild)";
      Check(Count, Sub, () => {
        assert.ok(StateRefV === RunV.State);
      });
    }
    {
      const Sub = "P10: still exactly one activation line (NO remount, no re-apply)";
      Check(Count, Sub, () => {
        assert.ok(Activations() === 1);
      });
    }
    const ListenerV = RunV.Listeners["llm/stream"];
    const OutV = [];
    for await (const ChunkV of ListenerV(
      Object.freeze({ model: "x", messages: [] }),
      () => (async function* () {
        yield { type: "text-delta", index: 0, text: "a \u2014 b" };
      })()
    )) {
      OutV.push(ChunkV);
    }
    {
      const Sub = "P10: the NEXT stream normalizes with the NEW replacement without remount";
      Check(Count, Sub, () => {
        assert.ok(OutV[0].text === "a -*- b");
      });
    }
    {
      const Sub = "P10: the flipped stream still writes its normal count line";
      Check(Count, Sub, () => {
        assert.ok(RunV.Lines.some((L) => L.includes("normalized 1 dash char(s) in one stream")));
      });
    }
    {
      const Sub = "P10: the flipped stream added NO activation line";
      Check(Count, Sub, () => {
        assert.ok(Activations() === 1);
      });
    }
  }
  return Finish(Count, "Volatile-Live-Flip");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Volatile-Live-Flip`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
