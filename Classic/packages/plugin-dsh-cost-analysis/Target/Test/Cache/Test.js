import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import LedgerPlugin from "../../../../plugin-dsh-cost/Target/Library.js";
import LedgerDrain from "../../../../plugin-dsh-cost/Target/Function/Drain.js";
import LedgerOpen from "../../../../plugin-dsh-cost/Target/Function/Open.js";
import Analysis from "../../../Target/Function/Analysis.js";
import Reader from "../../../Target/Function/Open.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";
const LedgerConfig = (Home) => LedgerPlugin.Config({
  databasePath: join(Home, "ledger.db"),
  client: "fixture",
  prices: [{ provider: "p", model: "m", input: 1, output: 2, cacheRead: 0.1 }]
});
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-cache-"));
  try {
    const Priced = LedgerConfig(Home);
    const Read = Validate({ databasePath: join(Home, "ledger.db") });
    const Ledger = LedgerOpen(Priced);
    const At = (Offset) => Date.now() + Offset * 1e3;
    try {
      const Fold = LedgerDrain(Make(Priced).Context, Ledger.Database, Priced);
      const Events = [
        { seq: 0, type: "session", time: At(0), cwd: Home },
        {
          seq: 1,
          type: "assistant/message",
          time: At(1),
          data: {
            turn: 1,
            step: 1,
            usage: { inputTokens: 0, outputTokens: 10 },
            message: { source: { provider: "p", model: "m" } }
          }
        },
        {
          seq: 2,
          type: "tool/call",
          time: At(2),
          data: {
            turn: 1,
            step: 1,
            name: "read",
            callId: "c1",
            arguments: JSON.stringify({ file_path: join(Home, "a.ts") })
          }
        },
        { seq: 3, type: "tool/result", time: At(3), data: { turn: 1, step: 1, message: { source: { callId: "c1" } } } },
        { seq: 4, type: "step/end", time: At(4), data: { turn: 1, step: 1 } },
        {
          seq: 5,
          type: "assistant/message",
          time: At(5),
          data: {
            turn: 1,
            step: 2,
            usage: { inputTokens: 60, outputTokens: 10, cacheReadTokens: 40 },
            message: { source: { provider: "p", model: "m" } }
          }
        },
        { seq: 6, type: "step/end", time: At(6), data: { turn: 1, step: 2 } }
      ];
      Fold({ id: "s", cwd: Home }, Events);
    } finally {
      Ledger.Close();
    }
    const Opened = Reader(Read);
    try {
      const Views = Analysis(Opened.Database, Read);
      const Found = Views.Cache("file");
      const One = Found.find((Reading) => Reading.Key === join(Home, "a.ts"));
      Check(Count, "T5: the cache ratio sits between zero and one", () => {
        assert.ok(One !== void 0, "a.ts keeps a reading");
        const Ratio = One.Rows.find((Row) => Row.Metric === "cache_ratio");
        assert.ok(Ratio !== void 0, "a.ts carries the cache ratio");
        assert.equal(Ratio.Unit, "ratio");
        assert.ok(Ratio.Value > 0 && Ratio.Value < 1, `a.ts cache ratio ${Ratio.Value}`);
      });
      Check(Count, "T5: the ratio is the cached over the cached plus uncached tokens", () => {
        assert.ok(One !== void 0, "a.ts keeps a reading");
        const Ratio = One.Rows.find((Row) => Row.Metric === "cache_ratio");
        const Cached = One.Rows.find((Row) => Row.Metric === "cached_tokens");
        const Whole = One.Rows.find((Row) => Row.Metric === "input_tokens");
        assert.ok(Ratio !== void 0 && Cached !== void 0 && Whole !== void 0, "the three metrics exist");
        assert.equal(Cached.Unit, "tokens");
        assert.equal(Whole.Unit, "tokens");
        assert.equal(Cached.Value, 20, `cached tokens ${Cached.Value}`);
        assert.equal(Whole.Value, 50, `input tokens ${Whole.Value}`);
        assert.ok(Math.abs(Ratio.Value - Cached.Value / Whole.Value) <= 1e-12, `ratio ${Ratio.Value}`);
      });
    } finally {
      Opened.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Cache");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Cache`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
