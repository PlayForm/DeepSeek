import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Open from "../../../Target/Function/Open.js";
import Price from "../../../Target/Function/Price.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-price-"));
  try {
    const Config = Validate({
      databasePath: join(Home, "ledger.db"),
      prices: [
        { provider: "test", model: "m", input: 1, output: 2, cacheRead: 0.1, effectiveFrom: "2026-01-01" },
        { provider: "test", model: "m", input: 3, output: 4, cacheRead: 0.3, effectiveFrom: "2026-06-01" }
      ]
    });
    const Ledger = Open(Config);
    try {
      const Book = Price(Ledger.Database, Config);
      Check(Count, "P2: a call inside the first window prices at the first row", () => {
        const Rate = Book.Resolve("test", "m", Date.parse("2026-02-01T00:00:00Z"));
        assert.equal(Rate.InputRate, 1);
        assert.equal(Rate.OutputRate, 2);
        assert.equal(Rate.EffectiveFrom, Date.parse("2026-01-01T00:00:00Z"));
      });
      Check(Count, "P2: a call after the second row's date prices at the second row, not the newest", () => {
        const Rate = Book.Resolve("test", "m", Date.parse("2026-07-01T00:00:00Z"));
        assert.equal(Rate.InputRate, 3);
        assert.equal(Rate.OutputRate, 4);
        assert.equal(Rate.EffectiveFrom, Date.parse("2026-06-01T00:00:00Z"));
      });
      Check(Count, "P2: the boundary instant itself is in force for the new row", () => {
        const Rate = Book.Resolve("test", "m", Date.parse("2026-06-01T00:00:00Z"));
        assert.equal(Rate.InputRate, 3);
      });
      Check(Count, "P2: the cost arithmetic uses the resolved rates per million tokens", () => {
        const Rate = Book.Resolve("test", "m", Date.parse("2026-02-01T00:00:00Z"));
        const Costed = Book.Cost(
          {
            SessionId: "s",
            Turn: 1,
            Step: 1,
            Seq: 0,
            Provider: "test",
            Model: "m",
            InputTokens: 1e6,
            OutputTokens: 5e5,
            CacheReadTokens: 2e6,
            CacheWriteTokens: null,
            ReasoningTokens: null,
            TotalTokens: 35e5,
            At: 0
          },
          Rate
        );
        assert.equal(Costed.Input, 1);
        assert.equal(Costed.Output, 1);
        assert.equal(Costed.CacheRead, 0.2);
        assert.equal(Costed.CacheWrite, 0);
        assert.equal(Costed.Total, 2.2);
        assert.equal(Costed.Currency, "USD");
      });
    } finally {
      Ledger.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Price");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Price`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
