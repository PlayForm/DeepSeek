import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Drain from "../../../Target/Function/Drain.js";
import Open from "../../../Target/Function/Open.js";
import Rollup from "../../../Target/Function/Rollup.js";
import Plugin from "../../../Target/Library.js";
import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-refresh-"));
  try {
    const Config = Validate({
      databasePath: join(Home, "ledger.db"),
      prices: [{ provider: "p", model: "m", input: 1, output: 2 }]
    });
    const Ledger = Open(Config);
    const At = (Hours) => Date.parse("2026-10-27T00:00:00Z") + Hours * 36e5;
    const Events = [
      { seq: 0, type: "session", time: At(0), cwd: Home },
      {
        seq: 1,
        type: "assistant/message",
        time: At(1),
        data: {
          turn: 1,
          step: 1,
          usage: { inputTokens: 100, outputTokens: 50 },
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
          arguments: JSON.stringify({ file_path: join(Home, "a.ts"), content: "x\ny" })
        }
      },
      { seq: 3, type: "tool/result", time: At(3), data: { turn: 1, step: 1, message: { source: { callId: "c1" } } } },
      { seq: 4, type: "step/end", time: At(4), data: { turn: 1, step: 1 } }
    ];
    try {
      const Run2 = Make(Config);
      const Fold = Drain(Run2.Context, Ledger.Database, Config);
      Fold({ id: "refresh", cwd: Home }, Events);
      const Days = Ledger.Database.prepare("SELECT DISTINCT Day FROM Rollup").all();
      Check(Count, "T5: the flush writes no aggregate before the refresh runs", () => {
        assert.equal(Days.length, 0, "the drain alone leaves the rollup empty");
      });
      const Batch = Events.map((One) => One.time);
      const Written = Rollup(Ledger.Database)(Batch);
      Check(Count, "T5: the refresh covers the batch's own UTC day", () => {
        assert.ok(Written > 0, `the refresh wrote ${Written} rows`);
        const Covered = Ledger.Database.prepare(
          "SELECT DISTINCT Day FROM Rollup ORDER BY Day"
        ).all();
        assert.deepEqual(
          Covered.map((Row) => Row.Day),
          ["2026-10-27"],
          "exactly the batch's day is covered"
        );
        const Total = Ledger.Database.prepare("SELECT SUM(Cost) AS Cost FROM Rollup").get();
        assert.ok(Total.Cost > 0, "the aggregate carries the priced money");
      });
      const Empty = Rollup(Ledger.Database)([Date.parse("2020-01-01T00:00:00Z")]);
      Check(Count, "T5: a day with no calls writes nothing", () => {
        assert.equal(Empty, 0, "an empty day writes no row");
        const Days2 = Ledger.Database.prepare(
          "SELECT COUNT(*) AS Count FROM Rollup WHERE Day = '2020-01-01'"
        ).get();
        assert.equal(Days2.Count, 0, "no row is invented for the empty day");
      });
    } finally {
      Ledger.Close();
    }
    const Live = Validate({
      databasePath: join(Home, "live.db"),
      prices: [{ provider: "p", model: "m", input: 1, output: 2 }]
    });
    const Run = Make(Live);
    Plugin.apply(Run.Context, Live);
    for (const Event of Events) {
      Run.Listeners["session/event"]({ id: "live", cwd: Home }, Event);
    }
    Run.Listeners["session/flush"]({ id: "live", cwd: Home });
    Check(Count, "T5: the plugin's own flush refreshes the aggregate", () => {
      const Opened = Open(Live);
      try {
        const Days = Opened.Database.prepare(
          "SELECT DISTINCT Day FROM Rollup ORDER BY Day"
        ).all();
        assert.deepEqual(
          Days.map((Row) => Row.Day),
          ["2026-10-27"],
          "the registered flush listener refreshed exactly the batch's day"
        );
        const Calls = Opened.Database.prepare("SELECT COUNT(*) AS Count FROM Call").get();
        assert.equal(Calls.Count, 1, "the flush folded the priced call");
      } finally {
        Opened.Close();
      }
    });
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Refresh");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Refresh`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
