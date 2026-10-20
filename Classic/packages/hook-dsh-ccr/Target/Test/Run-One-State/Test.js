import assert from "node:assert/strict";
import {
  Check,
  CheckAsync,
  Finish,
  MakeCounter,
  Make,
  Rm,
  Validate,
  Ledger,
  Furnace,
  TextBlock,
  Exec
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  const Raw1 = Validate({ logFile: Ledger });
  const Run1 = Make(Raw1);
  {
    const Sub = "the tools/post-execute listener is registered";
    Check(Count, Sub, () => {
      assert.ok(typeof Run1.Listeners["tools/post-execute"] === "function");
    });
  }
  {
    const Sub = "the listener PREPENDS (the gate runs before the other post-execute listeners)";
    Check(Count, Sub, () => {
      assert.ok(
        Run1.ListenerOptions["tools/post-execute"] !== void 0 && Run1.ListenerOptions["tools/post-execute"].prepend === true
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
    const Sub = "the tool registration is captured: the tool is named ccr_retrieve";
    Check(Count, Sub, () => {
      assert.ok(Run1.Registered[0] && Run1.Registered[0].name === "ccr_retrieve");
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
      assert.ok(Run1.State.Ledger === "/tmp/ccr-smoke-ledger.log");
    });
  }
  {
    const Sub = "volatile unwrap: log cell unwrapped to State.Enabled=true";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.Enabled === true);
    });
  }
  {
    const Sub = "volatile unwrap: thresholdBytes cell \u2192 State.Threshold=2048";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.Threshold === 2048);
    });
  }
  {
    const Sub = "volatile unwrap: previewMaxChars cell \u2192 State.PreviewMaximum=240";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.PreviewMaximum === 240);
    });
  }
  {
    const Sub = "volatile unwrap: multipliers cell \u2192 State.Multipliers (error \xD78)";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.Multipliers && Run1.State.Multipliers.error === 8);
    });
  }
  {
    const Sub = "state module = ccr (the ledger prefix)";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.Module === "ccr");
    });
  }
  {
    const Sub = "the store is memory-only by default";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.Store && Run1.State.Store.Path === "");
    });
  }
  {
    const Sub = "state targets copied from config";
    Check(Count, Sub, () => {
      assert.ok(Run1.State.Targets.length === 8);
    });
  }
  {
    const Sub = "under-threshold bash result: the downstream decision passes through unchanged";
    await CheckAsync(Count, Sub, async () => {
      const Listener = Run1.Listeners["tools/post-execute"];
      const Content = TextBlock("short bash output");
      const Result = { isError: false, value: { out: "short bash output" }, content: Content };
      const Decision = { kind: "accept" };
      const Out = await Listener(Exec("bash"), Result, async () => Decision);
      assert.ok(Out === Decision);
    });
  }
  {
    const Sub = "under-threshold result writes NO ledger line (no compress, no store)";
    await CheckAsync(Count, Sub, async () => {
      const Listener = Run1.Listeners["tools/post-execute"];
      const Content = TextBlock("short bash output");
      const Result = { isError: false, value: { out: "short bash output" }, content: Content };
      const Decision = { kind: "accept" };
      await Listener(Exec("bash"), Result, async () => Decision);
      assert.ok(
        !Run1.Lines.some((L) => L.includes("compressed") || L.includes("stored"))
      );
    });
  }
  return Finish(Count, "Run-One-State");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Run-One-State`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
