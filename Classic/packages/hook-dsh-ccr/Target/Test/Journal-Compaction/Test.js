import assert from "node:assert/strict";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import {
  Check,
  CheckAsync,
  Finish,
  MakeCounter,
  Make,
  Rm,
  Validate,
  Ledger,
  JournalPath as Journal,
  TextBlock,
  Exec,
  NextAccept,
  TerminalText,
  HashOf,
  SizeOf
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Rm();
  const Run9 = Make(Validate({ logFile: Ledger, journalPath: Journal }));
  const Content9 = TextBlock(TerminalText("j".repeat(80), 40));
  {
    const Sub = "journalPath is wired into the store";
    Check(Count, Sub, () => {
      assert.ok(Run9.State.Store.Path === Journal);
    });
  }
  await Run9.Listeners["tools/post-execute"](
    Exec("bash"),
    { isError: false, value: {}, content: Content9 },
    NextAccept
  );
  {
    const Sub = "the journal: exactly one JSONL record after one store";
    Check(Count, Sub, () => {
      const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
      assert.ok(Lines.length === 1);
    });
  }
  {
    const Sub = "the journal record carries {hash, type, size, ttlAt}";
    Check(Count, Sub, () => {
      const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
      const Record = Lines.length > 0 ? JSON.parse(Lines[0]) : void 0;
      assert.ok(
        Record !== void 0 && Record.hash === HashOf(Content9) && Record.type === "terminal" && Record.size === SizeOf(Content9) && typeof Record.ttlAt === "number"
      );
    });
  }
  {
    const Sub = "the journal payload is the base64 of the content's JSON serialization";
    Check(Count, Sub, () => {
      const Lines = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
      const Record = Lines.length > 0 ? JSON.parse(Lines[0]) : void 0;
      assert.ok(
        Record !== void 0 && Buffer.from(Record.payload, "base64").toString("utf8") === JSON.stringify(Content9)
      );
    });
  }
  {
    const Sub = "boot compaction: the corrupt and expired records are dropped, one survives";
    Check(Count, Sub, () => {
      appendFileSync(Journal, "\n");
      appendFileSync(
        Journal,
        `${JSON.stringify({
          hash: "e".repeat(24),
          type: "terminal",
          size: 3,
          ttlAt: Date.now() - 1e3,
          payload: Buffer.from("[]", "utf8").toString("base64")
        })}
`
      );
      appendFileSync(Journal, "{not json at all\n");
      const Run9b = Make(Validate({ logFile: Ledger, journalPath: Journal }));
      void Run9b;
      const Surviving = existsSync(Journal) ? readFileSync(Journal, "utf8").trim().split("\n") : [];
      assert.ok(Surviving.length === 1);
    });
  }
  {
    const Sub = "the journal survives the fake restart: the entry is retrievable again";
    await CheckAsync(Count, Sub, async () => {
      const Run9b = Make(Validate({ logFile: Ledger, journalPath: Journal }));
      const Retrieved = await Run9b.Registered[0].execute(
        { hash: HashOf(Content9) },
        Exec("ccr_retrieve")
      );
      assert.ok(
        Retrieved.text === `${"make: starting\nexit code: 0\n"}${Array.from({ length: 40 }, (_, I) => `row ${I} ${"j".repeat(80)}`).join("\n")}`
      );
    });
  }
  Rm();
  {
    writeFileSync(Journal, "", "utf8");
    const Run9c = Make(Validate({ logFile: Ledger, journalPath: Journal }));
    const Sub = "boot compaction edge: an EMPTY journal file loads to an empty store (no crash)";
    Check(Count, Sub, () => {
      assert.ok(
        Run9c.State.Store.Stats().count === 0 && Run9c.State.Store.Stats().bytes === 0
      );
    });
  }
  {
    writeFileSync(
      Journal,
      `${JSON.stringify({
        hash: "a".repeat(24),
        type: "terminal",
        size: 3,
        ttlAt: Date.now() - 1e3,
        payload: Buffer.from("[]", "utf8").toString("base64")
      })}
${JSON.stringify({
        hash: "b".repeat(24),
        type: "file",
        size: 3,
        ttlAt: Date.now() - 2e3,
        payload: Buffer.from("[]", "utf8").toString("base64")
      })}
`,
      "utf8"
    );
    const Run9d = Make(Validate({ logFile: Ledger, journalPath: Journal }));
    const Sub = "boot compaction edge: an ALL-EXPIRED journal compacts to an empty store";
    Check(Count, Sub, () => {
      assert.ok(Run9d.State.Store.Stats().count === 0);
    });
  }
  {
    const Sub = "boot compaction edge: the all-expired file is rewritten empty";
    Check(Count, Sub, () => {
      assert.ok(readFileSync(Journal, "utf8").trim() === "");
    });
  }
  {
    const Fresh = "/tmp/ccr-smoke-journal-absent.jsonl";
    try {
      rmSync(Fresh);
    } catch {
    }
    const Run9e = Make(Validate({ logFile: Ledger, journalPath: Fresh }));
    const Sub = "boot compaction edge: a MISSING journal file is not created on boot (memory-only)";
    Check(Count, Sub, () => {
      assert.ok(Run9e.State.Store.Path === Fresh && !existsSync(Fresh));
    });
  }
  return Finish(Count, "Journal-Compaction");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Journal-Compaction`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
