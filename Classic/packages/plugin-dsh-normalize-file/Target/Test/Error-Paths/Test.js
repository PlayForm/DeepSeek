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
    const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
    Run1.Files.set(`key:${Fixture}`, All6);
    await Tool.execute({ file_path: Fixture }, Exec());
    const WritesBeforeNoop = Run1.Writes.length;
    {
      let MissingError = null;
      try {
        await Tool.execute({ file_path: "/tmp/normalize-file-smoke-missing.txt" }, Exec());
      } catch (E) {
        MissingError = E;
      }
      {
        const Sub = "a missing file rejects with the tool's context prefix";
        Check(Count, Sub, () => {
          assert.ok(
            MissingError !== null && MissingError.message.startsWith(
              "normalize-file: cannot read /tmp/normalize-file-smoke-missing.txt: "
            )
          );
        });
      }
      {
        const Sub = "the missing-file error keeps the backend's code";
        Check(Count, Sub, () => {
          assert.ok(MissingError !== null && MissingError.message.includes("FS_NOT_FOUND"));
        });
      }
      {
        const Sub = "a missing file: NO write";
        Check(Count, Sub, () => {
          assert.ok(Run1.Writes.length === WritesBeforeNoop);
        });
      }
      {
        const Sub = "a missing file: NO journal record";
        Check(Count, Sub, () => {
          assert.ok(
            Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1
          );
        });
      }
    }
    {
      let BinaryError = null;
      try {
        await Tool.execute({ file_path: "/tmp/normalize-file-smoke-image.bin" }, Exec());
      } catch (E) {
        BinaryError = E;
      }
      {
        const Sub = "a binary target rejects with the tool's context prefix";
        Check(Count, Sub, () => {
          assert.ok(
            BinaryError !== null && BinaryError.message.startsWith(
              "normalize-file: cannot read /tmp/normalize-file-smoke-image.bin: "
            )
          );
        });
      }
      {
        const Sub = "the binary error keeps the backend's FS_NOT_TEXT code (the mime check, tool-shaped)";
        Check(Count, Sub, () => {
          assert.ok(BinaryError !== null && BinaryError.message.includes("FS_NOT_TEXT"));
        });
      }
      {
        const Sub = "a binary target: NO write";
        Check(Count, Sub, () => {
          assert.ok(Run1.Writes.length === WritesBeforeNoop);
        });
      }
    }
    {
      const WritesBeforeAbort = Run1.Writes.length;
      const Aborted = new AbortController();
      Aborted.abort();
      let AbortError = null;
      try {
        await Tool.execute({ file_path: "/tmp/normalize-file-smoke-abort.txt" }, Exec(Aborted.signal));
      } catch (E) {
        AbortError = E;
      }
      {
        const Sub = "a pre-aborted signal rejects the call";
        Check(Count, Sub, () => {
          assert.ok(AbortError !== null && /aborted/.test(AbortError.message));
        });
      }
      {
        const Sub = "a pre-aborted signal writes NOTHING (no fs write after the abort)";
        Check(Count, Sub, () => {
          assert.ok(Run1.Writes.length === WritesBeforeAbort);
        });
      }
      {
        const Sub = "an aborted call: NO journal record";
        Check(Count, Sub, () => {
          assert.ok(
            Furnace.PendingJournal.filter((R) => R.event === "normalized").length === 1
          );
        });
      }
    }
  }
  return Finish(Count, "Error-Paths");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Error-Paths`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
