import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  {
    const Run1 = Make(Validate({ logFile: Ledger }));
    const Tool = Run1.Registered[0];
    const Exec = (Signal) => ({
      signal: Signal ?? new AbortController().signal,
      agent: void 0,
      callId: "call_smoke"
    });
    const All6 = "a\u2014b\u201Cc\u201D\u2026d\xA0e\u200Bf\uFF21g";
    const Normalized6 = 'a-b"c"...d efAg';
    const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
    Run1.Files.set(`key:${Fixture}`, All6);
    await Tool.execute({ file_path: Fixture }, Exec());
    const WritesBeforeNoop = Run1.Writes.length;
    {
      const Out2 = await Tool.execute({ file_path: Fixture }, Exec());
      {
        const Sub = "normalizing the already-normalized file: count 0, changed=false";
        Check(Count, Sub, () => {
          assert.ok(Out2.count === 0 && Out2.changed === false);
        });
      }
      {
        const Sub = "N=0 \u2192 NO write at all (no writeText call)";
        Check(Count, Sub, () => {
          assert.ok(Run1.Writes.length === WritesBeforeNoop);
        });
      }
      {
        const Sub = "N=0 \u2192 no fs/write-intent waterfall run";
        Check(Count, Sub, () => {
          assert.ok(Run1.Intents.length === 1);
        });
      }
      {
        const Sub = "N=0 \u2192 no fs/observed emit";
        Check(Count, Sub, () => {
          assert.ok(Run1.Observations.length === 1);
        });
      }
      await new Promise((R) => setTimeout(R, 10));
      {
        const Sub = "N=0 \u2192 NO count line (the ledger keeps exactly the first one)";
        Check(Count, Sub, () => {
          assert.ok(Run1.Lines.filter((L) => L.includes("normalized")).length === 1);
        });
      }
      {
        const Sub = "N=0 \u2192 NO journal record";
        Check(Count, Sub, () => {
          assert.ok(
            Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1
          );
        });
      }
      {
        const Sub = "N=0 \u2192 the file is left byte-identical";
        Check(Count, Sub, () => {
          assert.ok(Run1.Files.get(`key:${Fixture}`) === Normalized6);
        });
      }
      {
        const Sub = "N=0 \u2192 the outcome carries no before/after (nothing to diff)";
        Check(Count, Sub, () => {
          assert.ok(Out2.before === void 0 && Out2.after === void 0);
        });
      }
    }
    {
      const Clean = "/tmp/normalize-file-smoke-clean.txt";
      Run1.Files.set(`key:${Clean}`, "plain text, already clean\n");
      const Out3 = await Tool.execute({ file_path: Clean }, Exec());
      {
        const Sub = "a clean file: count 0, changed=false, path reported";
        Check(Count, Sub, () => {
          assert.ok(Out3.count === 0 && Out3.changed === false && Out3.path === Clean);
        });
      }
      {
        const Sub = "a clean file: NO write";
        Check(Count, Sub, () => {
          assert.ok(Run1.Writes.length === WritesBeforeNoop);
        });
      }
      {
        const Sub = "a clean file: NO journal record";
        Check(Count, Sub, () => {
          assert.ok(
            Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1
          );
        });
      }
    }
  }
  return Finish(Count, "No-Op-Rule");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - No-Op-Rule`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
