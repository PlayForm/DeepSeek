import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Open from "../../../Target/Function/Open.js";
import Price from "../../../Target/Function/Price.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";
const Wide = [
  { Provider: "test", Model: null, Kind: "batch", Multiplier: 0.5, EffectiveFrom: 0, EffectiveTo: null }
];
const Narrow = [
  { Provider: "test", Model: "m", Kind: "batch", Multiplier: 0.25, EffectiveFrom: 0, EffectiveTo: null }
];
const Late = [
  { Provider: "test", Model: null, Kind: "batch", Multiplier: 0.5, EffectiveFrom: Date.parse("2027-01-01T00:00:00Z"), EffectiveTo: null }
];
const Usage = (Provider, Mode) => ({
  SessionId: "s",
  Turn: 1,
  Step: 1,
  Seq: 0,
  Provider,
  Model: "m",
  InputTokens: 1e6,
  OutputTokens: 1e6,
  CacheReadTokens: null,
  CacheWriteTokens: null,
  ReasoningTokens: null,
  TotalTokens: null,
  At: Date.parse("2026-06-01T00:00:00Z"),
  Mode
});
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-modifier-"));
  try {
    const Config = Validate({
      databasePath: join(Home, "ledger.db"),
      prices: [
        { provider: "test", model: "m", input: 1, output: 2, effectiveFrom: "2026-01-01" },
        {
          provider: "cloudflare-workers-ai",
          model: "@cf/zai-org/glm-5.3-flash",
          input: 1,
          output: 1,
          effectiveFrom: "2026-01-01"
        }
      ]
    });
    const Ledger = Open(Config);
    try {
      const Book = Price(Ledger.Database, Config);
      const Rate = Book.Resolve("test", "m", Date.parse("2026-06-01T00:00:00Z"));
      Check(Count, "M3: a batch modifier halves the call's price, every bucket with it", () => {
        const Plain = Book.Cost(Usage("test", "standard"), Rate, []);
        const Costed = Book.Cost(Usage("test", "batch"), Rate, Wide);
        assert.ok(Math.abs(Plain.Total - 3) <= 1e-9, `plain total ${Plain.Total}`);
        assert.ok(Math.abs(Costed.Input - Plain.Input * 0.5) <= 1e-9, `input ${Costed.Input}`);
        assert.ok(Math.abs(Costed.Output - Plain.Output * 0.5) <= 1e-9, `output ${Costed.Output}`);
        assert.ok(Math.abs(Costed.Total - 1.5) <= 1e-9, `total ${Costed.Total}`);
      });
      Check(Count, "M3: a modifier outside its effective window does not apply", () => {
        const Costed = Book.Cost(Usage("test", "batch"), Rate, Late);
        assert.ok(Math.abs(Costed.Total - 3) <= 1e-9, `total ${Costed.Total}`);
      });
      Check(Count, "M3: a model-specific modifier beats a provider-wide one of the same kind", () => {
        const Costed = Book.Cost(Usage("test", "batch"), Rate, [...Wide, ...Narrow]);
        assert.ok(Math.abs(Costed.Total - 0.75) <= 1e-9, `total ${Costed.Total}`);
      });
      Check(Count, "M3: the modifier product multiplies the tier sum rather than replacing it", () => {
        const Both = [
          ...Wide,
          { Provider: "test", Model: null, Kind: "batch", Multiplier: 0.2, EffectiveFrom: 0, EffectiveTo: null }
        ];
        const Plain = Book.Cost(Usage("test", "batch"), Rate, []);
        const Costed = Book.Cost(Usage("test", "batch"), Rate, Both);
        assert.ok(Math.abs(Costed.Total - Plain.Total * 0.1) <= 1e-9, `total ${Costed.Total}`);
        assert.ok(Costed.Total > 0, "the product scales the priced sum, never zeroes it");
      });
      Check(Count, "M3: the shipped config rules reach the arithmetic through the default book", () => {
        const Cloud = Book.Resolve(
          "cloudflare-workers-ai",
          "@cf/zai-org/glm-5.3-flash",
          Date.parse("2026-06-01T00:00:00Z")
        );
        const Plain = Book.Cost(Usage("cloudflare-workers-ai", "standard"), Cloud);
        const Costed = Book.Cost(Usage("cloudflare-workers-ai", "batch"), Cloud);
        assert.ok(Math.abs(Costed.Total - Plain.Total * 0.5) <= 1e-9, `total ${Costed.Total}`);
        assert.ok(Math.abs(Plain.Total - 2) <= 1e-9, `plain total ${Plain.Total}`);
      });
    } finally {
      Ledger.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Modifier");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Modifier`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
