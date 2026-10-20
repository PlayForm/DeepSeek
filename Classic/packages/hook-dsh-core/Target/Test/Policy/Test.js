import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import { Check, Finish, MakeCounter, TempRoot } from "../Harness.js";
import { Policy } from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Root = TempRoot("core-smoke-");
  const Lines = [];
  const Append = (Message) => Lines.push(Message);
  const Defaults = { reject: [], verifyCommand: null };
  {
    const Sub = "Policy: absent file \u2192 built-in default + the byte-identical diagnostics";
    {
      Check(Count, Sub, () => {
        const P1 = Policy(Append, Path.join(Root, "nope.json"), Defaults);
        assert.equal(
          P1,
          Defaults,
          "absent file \u2192 the module's built-in default object"
        );
        assert.deepEqual(
          Lines,
          [
            `update: no policy at ${Path.join(Root, "nope.json")} \u2014 using built-in default`,
            "update: using built-in default policy"
          ],
          "the two byte-identical diagnostic lines"
        );
      });
    }
  }
  {
    const Sub = "Policy: readable file \u2192 the file's policy, silent";
    {
      Check(Count, Sub, () => {
        Lines.length = 0;
        FileSystem.writeFileSync(
          Path.join(Root, "policy.json"),
          JSON.stringify({ reject: ["chalk"], verifyCommand: "npm test" })
        );
        const P2 = Policy(Append, Path.join(Root, "policy.json"), Defaults);
        assert.deepEqual(
          P2,
          { reject: ["chalk"], verifyCommand: "npm test" },
          "readable file \u2192 its policy"
        );
        assert.equal(Lines.length, 0, "no diagnostics on the happy path");
      });
    }
  }
  {
    const Sub = "Policy: unreadable file \u2192 built-in default + the unreadable diagnostic";
    {
      Check(Count, Sub, () => {
        Lines.length = 0;
        FileSystem.writeFileSync(Path.join(Root, "bad.json"), "{ not json");
        const P3 = Policy(Append, Path.join(Root, "bad.json"), Defaults);
        assert.equal(P3, Defaults, "unreadable file \u2192 the built-in default");
        assert.deepEqual(
          Lines,
          [
            `update: unreadable policy at ${Path.join(Root, "bad.json")} \u2014 using built-in default`,
            "update: using built-in default policy"
          ],
          "the unreadable + default diagnostics"
        );
      });
    }
  }
  {
    const Sub = "Policy: the Quiet form skips every diagnostic";
    {
      Check(Count, Sub, () => {
        Lines.length = 0;
        const P4 = Policy(Append, Path.join(Root, "nope.json"), Defaults, true);
        assert.equal(P4, Defaults, "quiet \u2192 the built-in default");
        assert.equal(Lines.length, 0, "quiet \u2192 no diagnostic lines");
      });
    }
  }
  return Finish(Count, "Policy");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Policy`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
