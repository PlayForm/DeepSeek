import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Open from "../../../Target/Function/Open.js";
import Price from "../../../Target/Function/Price.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";
const SeedTier = (Database) => Database.prepare(
  "INSERT INTO Price (Provider, Model, Currency, InputRate, OutputRate, CacheReadRate, CacheWriteRate, ReasoningRate, EffectiveFrom, Source, TierFrom, TierTo) VALUES ('test', 'm', 'USD', ?, 1, ?, NULL, NULL, ?, 'test', ?, ?)"
);
const Usage = (Bucket, Tokens) => ({
  SessionId: "s",
  Turn: 1,
  Step: 1,
  Seq: 0,
  Provider: "test",
  Model: "m",
  InputTokens: Bucket === "input" ? Tokens : 0,
  OutputTokens: 0,
  CacheReadTokens: Bucket === "read" ? Tokens : 0,
  CacheWriteTokens: Bucket === "write" ? Tokens : 0,
  ReasoningTokens: null,
  TotalTokens: null,
  At: Date.parse("2026-02-01T00:00:00Z")
});
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-tier-"));
  try {
    const Config = Validate({ databasePath: join(Home, "ledger.db"), prices: [] });
    const Ledger = Open(Config);
    try {
      const At = Date.parse("2026-02-01T00:00:00Z");
      const Seed = SeedTier(Ledger.Database);
      Seed.run(2, 0.2, At, 0, 2e5);
      Seed.run(4, 0.4, At, 2e5, null);
      const Book = Price(Ledger.Database, Config);
      const Rate = Book.Resolve("test", "m", At);
      Check(Count, "T3: a prompt entirely below the threshold prices wholly at the first tier", () => {
        const Costed = Book.Cost(Usage("input", 1e5), Rate);
        assert.ok(Math.abs(Costed.Input - 0.2) <= 1e-9, `input ${Costed.Input}`);
        assert.ok(Math.abs(Costed.Total - 0.2) <= 1e-9, `total ${Costed.Total}`);
      });
      Check(Count, "T3: a prompt crossing the threshold prices the portion below at the first rate and only the excess at the second", () => {
        const Costed = Book.Cost(Usage("input", 3e5), Rate);
        assert.ok(Math.abs(Costed.Input - 0.8) <= 1e-9, `input ${Costed.Input}`);
      });
      Check(Count, "T3: a cached bucket crossing the same threshold splits the same way against its own rate", () => {
        const Costed = Book.Cost(Usage("read", 3e5), Rate);
        assert.ok(Math.abs(Costed.CacheRead - 0.08) <= 1e-9, `cache read ${Costed.CacheRead}`);
      });
      Check(Count, "T3: the sum of the portions equals the prompt tokens", () => {
        const Costed = Book.Cost(Usage("input", 3e5), Rate);
        const Second = (Costed.Input * 1e6 - 2 * 3e5) / (4 - 2);
        const First = 3e5 - Second;
        assert.ok(Math.abs(First - 2e5) <= 1e-9, `first portion ${First}`);
        assert.ok(Math.abs(Second - 1e5) <= 1e-9, `second portion ${Second}`);
        assert.ok(Math.abs(First + Second - 3e5) <= 1e-9, `portion sum ${First + Second}`);
      });
      Check(Count, "T3: the walk is marginal, never the cliff of the top rate over the whole prompt", () => {
        const Costed = Book.Cost(Usage("input", 3e5), Rate);
        assert.ok(Costed.Input < 1.2, `input ${Costed.Input} against the flat top-rate 1.2`);
      });
    } finally {
      Ledger.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Tier");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Tier`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
