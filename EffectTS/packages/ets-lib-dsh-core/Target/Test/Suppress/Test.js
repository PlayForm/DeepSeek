import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Suppress } from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Suppress: the suppression-line composer (module/kind/cause)";
    {
      Check(Count, Sub, () => {
        assert.equal(
          Suppress("package-governor", "continuation", new Error("boom")),
          "package-governor: continuation error (suppressed): boom",
          "the continuation shape"
        );
        assert.equal(
          Suppress("package-pinner", "listener", "x"),
          "package-pinner: listener error (suppressed): x",
          "the listener shape with a string cause"
        );
        assert.equal(
          Suppress("cargo-governor", "listener", new Error("")) === "cargo-governor: listener error (suppressed): " || Suppress("cargo-governor", "listener", new Error("")).includes("(suppressed):"),
          true,
          "an empty-message error still composes the suppressed line"
        );
      });
    }
  }
  return Finish(Count, "Suppress");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Suppress`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
