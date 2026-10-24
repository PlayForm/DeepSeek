import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
  AgentOf,
  CheckAsync,
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
    await CheckAsync(Count, "P1: an emit writes the knowledge file atomically", async () => {
      await Post(Run, StrongVersion("a"));
      assert.equal(FileSystem.existsSync(Knowledge), true);
      const Temp = Path.join(Path.dirname(Knowledge), `.${Path.basename(Knowledge)}.tmp`);
      assert.equal(FileSystem.existsSync(Temp), false);
    });
    await CheckAsync(Count, "P1: the knowledge file is mode 0600", async () => {
      assert.equal(FileSystem.statSync(Knowledge).mode & 511, 384);
    });
    await CheckAsync(Count, "P1: the JSON schema is the documented one", async () => {
      const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
      assert.deepEqual(Object.keys(Stored).sort(), [
        "dismissals",
        "intents",
        "journal",
        "schema",
        "seed",
        "seededAt",
        "stats"
      ]);
      assert.equal(Stored.schema, 1);
      assert.equal(Stored.seed, true);
      assert.deepEqual(Stored.dismissals, []);
      assert.deepEqual(Stored.stats, { emitted: 1, followed: 0, ignored: 0, dismissed: 0 });
      assert.equal(Stored.intents.Version["package.json"].seed, true);
      assert.equal(Stored.journal.length, 1);
      assert.equal(Stored.journal[0].intent, "Version");
      assert.equal(Stored.journal[0].outcome, "ignored");
      assert.equal(Stored.journal[0].kappa.toFixed(2), "0.92");
      assert.equal(Stored.journal[0].candidates.length, 7);
    });
  }
  {
    const Reload = Make(Validate({ logFile: Ledger, enabled: true }));
    await CheckAsync(Count, "P2: the saved knowledge reloads", async () => {
      assert.deepEqual(Reload.State.Knowledge.stats, {
        emitted: 1,
        followed: 0,
        ignored: 0,
        dismissed: 0
      });
      assert.equal(Reload.State.Knowledge.seed, true);
      assert.equal(Reload.State.Knowledge.intents.Version["package.json"].seed, true);
      assert.equal(Reload.State.Knowledge.journal.length, 1);
    });
  }
  {
    rm();
    FileSystem.writeFileSync(Knowledge, "not json at all", "utf8");
    const Run = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
    await CheckAsync(Count, "P3: a corrupt file degrades to the cold start", async () => {
      assert.deepEqual(Run.State.Knowledge.stats, {
        emitted: 0,
        followed: 0,
        ignored: 0,
        dismissed: 0
      });
      assert.deepEqual(Run.State.Knowledge.intents, {});
      assert.deepEqual(Run.State.Knowledge.dismissals, []);
      assert.equal(Run.Warns.length, 0);
    });
    await CheckAsync(Count, "P3: the cold start still emits from the static pack", async () => {
      const Out = await Post(Run, StrongVersion("a"));
      assert.equal(Out.additionalContexts[0].source.summary, "Version 0.92");
    });
    await CheckAsync(Count, "P3: the corrupt file is overwritten by the next save", async () => {
      const Stored = JSON.parse(FileSystem.readFileSync(Knowledge, "utf8"));
      assert.equal(Stored.schema, 1);
      assert.equal(Stored.stats.emitted, 1);
    });
  }
  {
    rm();
    FileSystem.writeFileSync(
      Knowledge,
      JSON.stringify({ schema: 2, intents: { Version: {} }, journal: [] }),
      "utf8"
    );
    const Run = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
    await CheckAsync(Count, "P4: a foreign schema degrades to the cold start", async () => {
      assert.deepEqual(Run.State.Knowledge.intents, {});
      assert.equal(Run.State.Knowledge.schema, 1);
    });
  }
  return Finish(Count, "Persistence");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Persistence`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
