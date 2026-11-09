import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import LedgerPlugin from "../../../../ets-plugin-dsh-cost/Target/Library.js";
import LedgerDrain from "../../../../ets-plugin-dsh-cost/Target/Function/Drain.js";
import LedgerOpen from "../../../../ets-plugin-dsh-cost/Target/Function/Open.js";
import Analysis from "../../../Target/Function/Analysis.js";
import Reader from "../../../Target/Function/Open.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";
const LedgerConfig = (Home) => LedgerPlugin.Config({
  databasePath: join(Home, "ledger.db"),
  client: "fixture",
  prices: [{ provider: "p", model: "m", input: 1, output: 2 }]
});
const Allocated = (Database, Path) => {
  const Row = Database.prepare(
    "SELECT COALESCE(SUM(Allocation.DirectCost + Allocation.AmortizedCost), 0) AS Cost FROM Allocation JOIN File ON File.FileId = Allocation.FileId WHERE File.Path = ?"
  ).get(Path);
  const Cost = Number(Row?.Cost);
  return Number.isFinite(Cost) ? Cost : 0;
};
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-analysis-lines-"));
  try {
    const Priced = LedgerConfig(Home);
    const Read = Validate({ databasePath: join(Home, "ledger.db") });
    const Ledger = LedgerOpen(Priced);
    const At = (Offset) => Date.now() + Offset * 1e3;
    let Cost = 0;
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
            name: "write",
            callId: "c1",
            arguments: JSON.stringify({
              file_path: join(Home, "a.ts"),
              content: "one\ntwo\nthree"
            })
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
            usage: { inputTokens: 0, outputTokens: 10 },
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
            name: "edit",
            callId: "c2",
            arguments: JSON.stringify({
              file_path: join(Home, "a.ts"),
              old_string: "two",
              new_string: "TWO\n!"
            })
          }
        },
        { seq: 7, type: "tool/result", time: At(7), data: { turn: 1, step: 2, message: { source: { callId: "c2" } } } },
        { seq: 8, type: "step/end", time: At(8), data: { turn: 1, step: 2 } }
      ];
      Fold({ id: "s", cwd: Home }, Events);
      Cost = Allocated(Ledger.Database, join(Home, "a.ts"));
    } finally {
      Ledger.Close();
    }
    const Opened = Reader(Read);
    try {
      const Views = Analysis(Opened.Database, Read);
      const Found = Views.Lines("file");
      const One = Found.find((Reading) => Reading.Key === join(Home, "a.ts"));
      Check(Count, "T3: the lines added and removed are the hunks' sums", () => {
        assert.ok(One !== void 0, "a.ts keeps a reading");
        const Added = One.Rows.find((Row) => Row.Metric === "lines_added");
        const Removed = One.Rows.find((Row) => Row.Metric === "lines_removed");
        assert.ok(Added !== void 0 && Removed !== void 0, "both line metrics exist");
        assert.equal(Added.Unit, "lines");
        assert.equal(Removed.Unit, "lines");
        assert.equal(Added.Value, 5, `lines added ${Added.Value}`);
        assert.equal(Removed.Value, 1, `lines removed ${Removed.Value}`);
      });
      Check(Count, "T3: the hunks are counted per file", () => {
        assert.ok(One !== void 0, "a.ts keeps a reading");
        const Hunks = One.Rows.find((Row) => Row.Metric === "hunks");
        assert.ok(Hunks !== void 0, "the hunk metric exists");
        assert.equal(Hunks.Unit, "hunks");
        assert.equal(Hunks.Value, 2, `hunks ${Hunks.Value}`);
      });
      Check(Count, "T3: the cost per added line is the allocated cost over the added lines", () => {
        assert.ok(One !== void 0, "a.ts keeps a reading");
        const Per = One.Rows.find((Row) => Row.Metric === "cost_per_added_line");
        assert.ok(Per !== void 0, "the cost per added line exists");
        assert.equal(Per.Unit, "USD/line");
        assert.ok(Math.abs(Per.Value - Cost / 5) <= 1e-12, `cost per added line ${Per.Value}`);
      });
    } finally {
      Opened.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Lines");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Lines`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
