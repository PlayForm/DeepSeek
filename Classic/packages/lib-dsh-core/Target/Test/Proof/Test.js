import assert from "node:assert/strict";
import { Proof } from "../../../Target/Library.js";
import { Check, Finish, MakeCounter } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Proof: the mount proof (live summary, disabled marker, pair grammar)";
    {
      Check(Count, Sub, () => {
        assert.equal(
          Proof(true, [
            ["bundle", "0.2.1"],
            ["cap", "3"]
          ]),
          "activated (bundle=0.2.1, cap=3)",
          "the live summary joins the pairs"
        );
        assert.equal(
          Proof(false, [["bundle", "0.2.1"]]),
          "disabled (enabled=false)",
          "the disabled marker is byte-exact"
        );
        assert.equal(
          Proof(true, [
            ["", "anywhere mode"],
            ["replacement", ""]
          ]),
          "activated (anywhere mode, replacement=)",
          "the bare segment and the empty-string value survive"
        );
        assert.equal(
          Proof(true, [["cap", void 0]]),
          "activated ()",
          "an absent pair is skipped"
        );
      });
    }
  }
  return Finish(Count, "Proof");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Proof`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
