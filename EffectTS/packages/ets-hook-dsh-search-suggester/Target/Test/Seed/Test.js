import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
  AgentOf,
  CheckAsync,
  FakeGraph,
  Finish,
  Knowledge,
  Ledger,
  Make,
  MakeCounter,
  Post,
  rm,
  Setup,
  Validate
} from "../Harness.js";
const StrongVersion = (Id) => ({
  name: "grep",
  arguments: { pattern: "1.2.3 version", path: "package.json" },
  agent: AgentOf(Id)
});
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Run = Setup();
    await CheckAsync(Count, "S1: the canonical rows are seeded at load", async () => {
      const Row = Run.State.Knowledge.intents.Version["package.json"];
      assert.equal(Row.count, 1);
      assert.equal(Row.followed, 1);
      assert.equal(Row.seed, true);
      assert.equal(typeof Row.lastSeen, "number");
      assert.equal(Run.State.Knowledge.seed, true);
      assert.equal(typeof Run.State.Knowledge.seededAt, "number");
    });
    await CheckAsync(Count, "S1: the seed moves no stat and writes no file", async () => {
      assert.deepEqual(Run.State.Knowledge.stats, {
        emitted: 0,
        followed: 0,
        ignored: 0,
        dismissed: 0
      });
      assert.equal(FileSystem.existsSync(Knowledge), false);
    });
    await CheckAsync(Count, "S1: exactly the canonical tiers are seeded", async () => {
      const Sizes = Object.fromEntries(
        Object.entries(Run.State.Knowledge.intents).map(([Intent, Bucket]) => [
          Intent,
          Object.keys(Bucket ?? {}).length
        ])
      );
      assert.deepEqual(Sizes, {
        Version: 10,
        Path: 2,
        Ledger: 3,
        Config: 3,
        Dependency: 3,
        Test: 3,
        Symbol: 3,
        Doc: 2,
        Usage: 2,
        Owner: 3
      });
      assert.equal(Run.State.Knowledge.intents.Version["**/README.md"], void 0);
      assert.equal(Run.State.Knowledge.intents.Path["README.md"], void 0);
      assert.equal(Run.State.Knowledge.intents.Symbol["Target"], void 0);
    });
  }
  {
    rm();
    const Run = Make(Validate({ logFile: Ledger, enabled: true }), (Context) => {
      Context.workspaceGraph = FakeGraph([{ path: "package.json", kind: "File", version: "1" }]);
    });
    await CheckAsync(Count, "S2: a graph-proven row is seeded twice", async () => {
      const Row = Run.State.Knowledge.intents.Version["package.json"];
      assert.equal(Row?.count, 2);
      assert.equal(Row?.followed, 2);
      assert.equal(Row?.seed, true);
      assert.equal(Run.State.Knowledge.intents.Version["CHANGELOG.md"]?.count, 1);
    });
  }
  {
    rm();
    FileSystem.writeFileSync(
      Knowledge,
      JSON.stringify({
        schema: 1,
        intents: { Version: { "package.json": { count: 9, followed: 9, lastSeen: 5 } } },
        journal: [],
        dismissals: [],
        stats: { emitted: 0, followed: 0, ignored: 0, dismissed: 0 }
      }),
      "utf8"
    );
    const Run = Make(Validate({ logFile: Ledger, enabled: true }));
    await CheckAsync(Count, "S3: an existing row wins over the seed", async () => {
      assert.deepEqual(Run.State.Knowledge.intents.Version["package.json"], {
        count: 9,
        followed: 9,
        lastSeen: 5
      });
      assert.equal(Run.State.Knowledge.intents.Version["CHANGELOG.md"].seed, true);
    });
  }
  {
    rm();
    const Run = Setup();
    await CheckAsync(Count, "S4: the first real save persists the seeded knowledge", async () => {
      await Post(Run, StrongVersion("a"));
      const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
      assert.equal(Stored.seed, true);
      assert.equal(Stored.intents.Version["package.json"].seed, true);
      assert.equal(Stored.intents.Version["package.json"].count, 1);
      assert.equal(Stored.stats.emitted, 1);
    });
  }
  {
    rm();
    const NoLearn = Make(Validate({ logFile: Ledger, enabled: true, learn: false }));
    await CheckAsync(Count, "S5: learn=false keeps the deterministic cold start", async () => {
      assert.deepEqual(NoLearn.State.Knowledge.intents, {});
      assert.equal(NoLearn.State.Knowledge.seed, false);
    });
    rm();
    const NoSeed = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
    await CheckAsync(Count, "S5: seed=false keeps the deterministic cold start", async () => {
      assert.deepEqual(NoSeed.State.Knowledge.intents, {});
      assert.equal(NoSeed.State.Knowledge.seed, false);
    });
    rm();
    const Off = Make(Validate({ logFile: Ledger, enabled: false }));
    await CheckAsync(Count, "S5: a disabled mount does not seed", async () => {
      assert.deepEqual(Off.State.Knowledge.intents, {});
      assert.equal(Off.State.Knowledge.seed, false);
    });
  }
  return Finish(Count, "Seed");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Seed`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
