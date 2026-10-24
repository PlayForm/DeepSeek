import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import { Check, Finish, MakeCounter } from "../Harness.js";
import { Expand } from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Sub = "Expand: the tilde expansion (home, home/child, unchanged paths)";
    {
      Check(Count, Sub, () => {
        const Original = process.env["HOME"];
        const Home = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "expand-smoke-"));
        try {
          process.env["HOME"] = Home;
          assert.equal(Expand("~"), Home, "the bare tilde is the home");
          assert.equal(
            Expand("~/a/b"),
            Path.join(Home, "a/b"),
            "the home-prefixed path joins the home"
          );
          assert.equal(Expand("/abs"), "/abs", "absolute paths pass through");
          assert.equal(Expand("rel"), "rel", "relative paths pass through");
          assert.equal(Expand(""), "", "the empty path passes through");
        } finally {
          if (Original === void 0) {
            delete process.env["HOME"];
          } else {
            process.env["HOME"] = Original;
          }
        }
      });
    }
  }
  return Finish(Count, "Expand");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Expand`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
