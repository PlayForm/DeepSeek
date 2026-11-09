import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import Seed from "../../Function/Seed.js";
import { Empty } from "../../Function/Persist.js";
import {
  Check,
  Finish,
  Knowledge,
  Ledger,
  Make,
  MakeCounter,
  rm,
  Setup,
  Validate
} from "../Harness.js";
const Family = [
  {
    id: "Version",
    priority: 1,
    threshold: 0.75,
    signals: [],
    familyGlobs: ["**/README.md"],
    targets: [
      { path: "package.json", kind: "manifest", prior: 1, reason: "the manifest" },
      { path: "CHANGELOG.md", kind: "doc", prior: 1, reason: "the changelog" },
      { path: "Source/Test/<Suite>/Test.ts", kind: "test", prior: 1, reason: "the placeholder" },
      { path: "README.md", kind: "doc", prior: 0.6, reason: "the fallback" },
      { path: "Target", kind: "family", prior: 1, reason: "the tail", family: true }
    ]
  }
];
const Graph = {
  revision: "r1",
  nodes: 1,
  root: 0,
  facts: /* @__PURE__ */ new Map([["package.json", { kinds: ["File"], depth: 1, recency: 1 }]])
};
const At = 17e8;
const runTest = async () => {
  const Count = MakeCounter();
  {
    const Store = Empty();
    const Seeded = Seed(Store, Family, void 0, At);
    Check(Count, "S1: the canonical rows are seeded with their markers", () => {
      assert.equal(Seeded, 2);
      assert.deepEqual(Store.intents.Version["package.json"], {
        count: 1,
        followed: 1,
        lastSeen: At,
        seed: true
      });
      assert.equal(Store.intents.Version["CHANGELOG.md"].seed, true);
      assert.equal(Store.seed, true);
      assert.equal(Store.seededAt, At);
    });
    Check(Count, "S1: the placeholder, the aggregate and the fallback stay cold", () => {
      assert.equal(Store.intents.Version["Source/Test/<Suite>/Test.ts"], void 0);
      assert.equal(Store.intents.Version["Target"], void 0);
      assert.equal(Store.intents.Version["README.md"], void 0);
      assert.equal(Store.intents.Version["**/README.md"], void 0);
      assert.deepEqual(Object.keys(Store.intents.Version).sort(), [
        "CHANGELOG.md",
        "package.json"
      ]);
    });
    Check(Count, "S1: the seed moves no stat", () => {
      assert.deepEqual(Store.stats, { emitted: 0, followed: 0, ignored: 0, dismissed: 0 });
    });
  }
  {
    const Store = Empty();
    Seed(Store, Family, Graph, At);
    Check(Count, "S2: a graph-proven row is seeded twice", () => {
      assert.equal(Store.intents.Version["package.json"].count, 2);
      assert.equal(Store.intents.Version["package.json"].followed, 2);
      assert.equal(Store.intents.Version["package.json"].seed, true);
      assert.equal(Store.intents.Version["CHANGELOG.md"].count, 1);
    });
  }
  {
    const Store = Empty();
    Store.intents.Version = {
      "package.json": { count: 9, followed: 9, lastSeen: 5 }
    };
    Seed(Store, Family, void 0, At);
    Check(Count, "S3: an existing row wins over the seed", () => {
      assert.deepEqual(Store.intents.Version["package.json"], {
        count: 9,
        followed: 9,
        lastSeen: 5
      });
      assert.equal(Store.intents.Version["CHANGELOG.md"].seed, true);
    });
    Check(Count, "S3: a second seed run moves no count", () => {
      const Before = JSON.stringify(Store.intents);
      Seed(Store, Family, void 0, At + 1);
      assert.equal(JSON.stringify(Store.intents), Before);
    });
  }
  {
    rm();
    Seed(Empty(), Family, void 0, At);
    Check(Count, "S4: the seed writes no knowledge file", () => {
      assert.equal(FileSystem.existsSync(Knowledge), false);
    });
  }
  {
    const Run = Setup();
    Check(Count, "S5: a workspace with no explicit pack seeds nothing", () => {
      assert.deepEqual(Run.State.Knowledge.intents, {});
      assert.equal(Run.State.Knowledge.seed, false);
      assert.equal(Run.State.Knowledge.seededAt, void 0);
    });
  }
  {
    rm();
    const NoLearn = Make(Validate({ logFile: Ledger, enabled: true, learn: false }));
    Check(Count, "S6: learn=false keeps the deterministic cold start", () => {
      assert.deepEqual(NoLearn.State.Knowledge.intents, {});
      assert.equal(NoLearn.State.Knowledge.seed, false);
    });
    rm();
    const NoSeed = Make(Validate({ logFile: Ledger, enabled: true, seed: false }));
    Check(Count, "S6: seed=false keeps the deterministic cold start", () => {
      assert.deepEqual(NoSeed.State.Knowledge.intents, {});
      assert.equal(NoSeed.State.Knowledge.seed, false);
    });
    rm();
    const Off = Make(Validate({ logFile: Ledger, enabled: false }));
    Check(Count, "S6: a disabled mount does not seed", () => {
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
