import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import LedgerPlugin from "../../../../ets-plugin-dsh-cost/Target/Library.js";
import LedgerDrain from "../../../../ets-plugin-dsh-cost/Target/Function/Drain.js";
import LedgerOpen from "../../../../ets-plugin-dsh-cost/Target/Function/Open.js";
import LedgerRollup from "../../../../ets-plugin-dsh-cost/Target/Function/Rollup.js";
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
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-credit-"));
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
            usage: { inputTokens: 100, outputTokens: 10, cacheReadTokens: 40 },
            message: { source: { provider: "p", model: "m" } }
          }
        },
        {
          seq: 6,
          type: "tool/call",
          time: At(6),
          data: {
            turn: 1,
            step: 2,
            name: "write",
            callId: "c2",
            arguments: JSON.stringify({ file_path: join(Home, "c.ts"), content: "x" })
          }
        },
        { seq: 7, type: "tool/result", time: At(7), data: { turn: 1, step: 2, message: { source: { callId: "c2" } } } },
        { seq: 8, type: "step/end", time: At(8), data: { turn: 1, step: 2 } }
      ];
      Fold({ id: "s", cwd: Home }, Events);
      LedgerRollup(Ledger.Database)();
    } finally {
      Ledger.Close();
    }
    const Opened = Reader(Read);
    try {
      const Views = Analysis(Opened.Database, Read);
      const Found = Views.Credit("file");
      const Cached = join(Home, "a.ts");
      const Never = join(Home, "c.ts");
      const One = Found.find((Reading) => Reading.Key === Cached);
      const Two = Found.find((Reading) => Reading.Key === Never);
      Check(Count, "T1: the credit is positive for the file the surface carried", () => {
        assert.ok(One !== void 0, "a.ts keeps a reading");
        const Credit = One.Rows.find((Row) => Row.Metric === "credit");
        assert.ok(Credit !== void 0, "a.ts carries the credit metric");
        assert.equal(Credit.Unit, "USD");
        assert.ok(Credit.Value > 0, `a.ts credit ${Credit.Value}`);
      });
      Check(Count, "T1: the credit is zero for a file never in a surface", () => {
        assert.ok(Two !== void 0, "c.ts keeps a reading");
        const Credit = Two.Rows.find((Row) => Row.Metric === "credit");
        assert.ok(Credit !== void 0, "c.ts carries the credit metric");
        assert.equal(Credit.Value, 0, `c.ts credit ${Credit.Value}`);
      });
      Check(Count, "T1: the ratio rides along and the readings rank by credit", () => {
        assert.ok(One !== void 0 && Two !== void 0, "both readings exist");
        const Ratio = One.Rows.find((Row) => Row.Metric === "credit_ratio");
        assert.ok(Ratio !== void 0, "a.ts carries the credit ratio");
        assert.equal(Ratio.Unit, "ratio");
        assert.ok(Ratio.Value > 0, `a.ts credit ratio ${Ratio.Value}`);
        assert.equal(Found[0]?.Key, Cached, "the readings rank by credit descending");
      });
    } finally {
      Opened.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Credit");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Credit`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
