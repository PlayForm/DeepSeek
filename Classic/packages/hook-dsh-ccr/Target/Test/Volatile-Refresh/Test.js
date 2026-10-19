import assert from "node:assert/strict";
import {
  Check,
  Finish,
  MakeCounter,
  Make,
  Rm,
  Validate,
  Ledger
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  const Raw1 = Validate({ logFile: Ledger });
  const Run1 = Make(Raw1);
  {
    const Sub = "tools/post-execute plus the State builder's P10 loader/volatile-update refresh";
    Check(Count, Sub, () => {
      assert.ok(
        Object.keys(Run1.Listeners).length === 2 && Run1.Listeners["loader/volatile-update"] !== void 0
      );
    });
  }
  return Finish(Count, "Volatile-Refresh");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Volatile-Refresh`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
