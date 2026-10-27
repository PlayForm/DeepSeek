import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import Open from "../../../Target/Function/Open.js";
import { Check, Finish, MakeCounter, Validate } from "../Harness.js";
const V1 = `
CREATE TABLE Session (SessionId TEXT PRIMARY KEY, CreatedAt INTEGER NOT NULL) STRICT;
CREATE TABLE File (FileId INTEGER PRIMARY KEY, Path TEXT NOT NULL) STRICT;
CREATE TABLE Price (PriceId INTEGER PRIMARY KEY, Provider TEXT NOT NULL, Model TEXT NOT NULL, InputRate REAL NOT NULL, OutputRate REAL NOT NULL, EffectiveFrom INTEGER NOT NULL) STRICT;
CREATE TABLE Call (CallId INTEGER PRIMARY KEY, SessionId TEXT NOT NULL REFERENCES Session (SessionId), Turn INTEGER NOT NULL, Step INTEGER NOT NULL, Seq INTEGER NOT NULL, Provider TEXT NOT NULL, Model TEXT NOT NULL, InputTokens INTEGER NOT NULL, OutputTokens INTEGER NOT NULL, CostTotal REAL NOT NULL, Currency TEXT NOT NULL, SurfaceTokens INTEGER NOT NULL DEFAULT 0, At INTEGER NOT NULL) STRICT;
CREATE TABLE Allocation (AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId), FileId INTEGER REFERENCES File (FileId), DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL, Method TEXT NOT NULL, At INTEGER NOT NULL) STRICT;
CREATE TABLE Touch (TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId), SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL, CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId), Kind TEXT NOT NULL, Seq INTEGER NOT NULL, At INTEGER NOT NULL) STRICT;
PRAGMA user_version = 1;
`;
const V2 = `
CREATE TABLE Session (SessionId TEXT PRIMARY KEY, CreatedAt INTEGER NOT NULL) STRICT;
CREATE TABLE File (FileId INTEGER PRIMARY KEY, Path TEXT NOT NULL) STRICT;
CREATE TABLE Price (PriceId INTEGER PRIMARY KEY, Provider TEXT NOT NULL, Model TEXT NOT NULL, InputRate REAL NOT NULL, OutputRate REAL NOT NULL, EffectiveFrom INTEGER NOT NULL, Window TEXT NOT NULL DEFAULT 'any') STRICT;
CREATE TABLE Call (CallId INTEGER PRIMARY KEY, SessionId TEXT NOT NULL REFERENCES Session (SessionId), Turn INTEGER NOT NULL, Step INTEGER NOT NULL, Seq INTEGER NOT NULL, Provider TEXT NOT NULL, Model TEXT NOT NULL, InputTokens INTEGER NOT NULL, OutputTokens INTEGER NOT NULL, CostTotal REAL NOT NULL, Currency TEXT NOT NULL, SurfaceTokens INTEGER NOT NULL DEFAULT 0, CacheSaving REAL NOT NULL DEFAULT 0, At INTEGER NOT NULL) STRICT;
CREATE TABLE Allocation (AllocationId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId), FileId INTEGER REFERENCES File (FileId), DirectCost REAL NOT NULL, AmortizedCost REAL NOT NULL, ContextTokens INTEGER NOT NULL, SurfaceTokens INTEGER NOT NULL, Weight REAL NOT NULL, Method TEXT NOT NULL, At INTEGER NOT NULL) STRICT;
CREATE TABLE Touch (TouchId INTEGER PRIMARY KEY, CallId INTEGER NOT NULL REFERENCES Call (CallId), SessionId TEXT NOT NULL, Turn INTEGER NOT NULL, Step INTEGER NOT NULL, CallKey TEXT NOT NULL, Tool TEXT NOT NULL, FileId INTEGER NOT NULL REFERENCES File (FileId), Kind TEXT NOT NULL, Stage TEXT, Branch TEXT, ReadBeforeEdit INTEGER NOT NULL DEFAULT 0, Seq INTEGER NOT NULL, At INTEGER NOT NULL) STRICT;
CREATE TABLE Alias (AliasId INTEGER PRIMARY KEY, FileId INTEGER NOT NULL REFERENCES File (FileId), FromPath TEXT NOT NULL, ToPath TEXT NOT NULL, At INTEGER NOT NULL) STRICT;
CREATE TABLE Verdict (SessionId TEXT NOT NULL REFERENCES Session (SessionId), FileId INTEGER NOT NULL REFERENCES File (FileId), State TEXT NOT NULL, LinesAdded INTEGER NOT NULL DEFAULT 0, LinesRemoved INTEGER NOT NULL DEFAULT 0, At INTEGER NOT NULL, PRIMARY KEY (SessionId, FileId)) STRICT;
CREATE VIEW FileLifetime AS
SELECT f.FileId, f.Path, count(DISTINCT c.SessionId) AS Sessions,
       sum(a.DirectCost) AS Direct, sum(a.AmortizedCost) AS Amortized,
       sum(a.DirectCost + a.AmortizedCost) AS Cost
FROM File AS f
JOIN Allocation AS a ON a.FileId = f.FileId
JOIN Call AS c ON c.CallId = a.CallId
GROUP BY f.FileId;
PRAGMA user_version = 2;
`;
const Columns = (Database, Table) => Database.prepare(`PRAGMA table_info(${Table})`).all().map(
  (One) => One.name
);
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-migrate-"));
  try {
    const V1Path = join(Home, "v1.db");
    const V1Seed = new DatabaseSync(V1Path);
    V1Seed.exec(V1);
    V1Seed.prepare("INSERT INTO Session (SessionId, CreatedAt) VALUES ('s1', 0)").run();
    V1Seed.prepare("INSERT INTO File (FileId, Path) VALUES (1, '/w/a.ts')").run();
    V1Seed.close();
    const V1Ledger = Open(Validate({ databasePath: V1Path }));
    try {
      const Database = V1Ledger.Database;
      const Version = Database.prepare("PRAGMA user_version").get();
      Check(Count, "A3: the ladder stamps a v1 ledger version 3", () => {
        assert.equal(Version.user_version, 3);
      });
      Check(Count, "A1: the additive columns exist on Price, Call and Touch through both rungs", () => {
        assert.ok(Columns(Database, "Price").includes("Window"), "Price.Window");
        assert.ok(Columns(Database, "Price").includes("TierFrom"), "Price.TierFrom");
        assert.ok(Columns(Database, "Call").includes("CacheSaving"), "Call.CacheSaving");
        assert.ok(Columns(Database, "Call").includes("Mode"), "Call.Mode");
        assert.ok(Columns(Database, "Call").includes("Tier"), "Call.Tier");
        assert.ok(Columns(Database, "Touch").includes("Stage"), "Touch.Stage");
        assert.ok(Columns(Database, "Touch").includes("Branch"), "Touch.Branch");
        assert.ok(Columns(Database, "Touch").includes("ReadBeforeEdit"), "Touch.ReadBeforeEdit");
      });
      Check(Count, "A1: the Alias and Verdict tables and the FileLifetime view exist", () => {
        assert.ok(Columns(Database, "Alias").includes("FromPath"), "Alias.FromPath");
        assert.ok(Columns(Database, "Verdict").includes("State"), "Verdict.State");
        assert.ok(
          Database.prepare("SELECT FileId, Path, Sessions, Direct, Amortized, Cost FROM FileLifetime").all() !== void 0,
          "the FileLifetime view selects"
        );
      });
      Check(Count, "A3: the fresh DDL never re-runs and the v1 data survives", () => {
        const Session = Database.prepare("SELECT SessionId FROM Session WHERE SessionId = 's1'").get();
        assert.ok(Session !== void 0, "the v1 session row survived");
        const Rollup = Database.prepare(
          "SELECT COUNT(*) AS N FROM sqlite_master WHERE type = 'table' AND name = 'Rollup'"
        ).get();
        assert.equal(Rollup.N, 0, "the migration path did not run the fresh DDL");
      });
    } finally {
      V1Ledger.Close();
    }
    const V2Path = join(Home, "v2.db");
    const V2Seed = new DatabaseSync(V2Path);
    V2Seed.exec(V2);
    V2Seed.prepare("INSERT INTO Session (SessionId, CreatedAt) VALUES ('s2', 0)").run();
    V2Seed.prepare("INSERT INTO File (FileId, Path) VALUES (1, '/w/a.ts')").run();
    V2Seed.prepare("INSERT INTO Price (Provider, Model, InputRate, OutputRate, EffectiveFrom) VALUES ('p', 'm', 1, 2, 0)").run();
    V2Seed.prepare(
      "INSERT INTO Call (CallId, SessionId, Turn, Step, Seq, Provider, Model, InputTokens, OutputTokens, CostTotal, Currency, At) VALUES (1, 's2', 1, 1, 0, 'p', 'm', 10, 5, 0.01, 'USD', 0)"
    ).run();
    V2Seed.close();
    const V2Ledger = Open(Validate({ databasePath: V2Path }));
    try {
      const Database = V2Ledger.Database;
      const Version = Database.prepare("PRAGMA user_version").get();
      Check(Count, "A3: the v3 rung alone stamps a v2 ledger version 3", () => {
        assert.equal(Version.user_version, 3);
      });
      Check(Count, "A1: the factor columns exist on Price and Call", () => {
        assert.ok(Columns(Database, "Price").includes("TierFrom"), "Price.TierFrom");
        assert.ok(Columns(Database, "Price").includes("TierTo"), "Price.TierTo");
        assert.ok(Columns(Database, "Price").includes("Mode"), "Price.Mode");
        assert.ok(Columns(Database, "Price").includes("Region"), "Price.Region");
        assert.ok(Columns(Database, "Call").includes("Mode"), "Call.Mode");
        assert.ok(Columns(Database, "Call").includes("Region"), "Call.Region");
        assert.ok(Columns(Database, "Call").includes("Tier"), "Call.Tier");
      });
      Check(Count, "A1: the Modifier, Factor and CallFactor tables exist", () => {
        assert.ok(Columns(Database, "Modifier").includes("Multiplier"), "Modifier.Multiplier");
        assert.ok(Columns(Database, "Modifier").includes("EffectiveFrom"), "Modifier.EffectiveFrom");
        assert.ok(Columns(Database, "Factor").includes("Value"), "Factor.Value");
        assert.ok(Columns(Database, "CallFactor").includes("Weight"), "CallFactor.Weight");
        assert.ok(Columns(Database, "CallFactor").includes("FactorId"), "CallFactor.FactorId");
      });
      Check(Count, "A3: the v2 data survives with the new defaults filled", () => {
        const Price = Database.prepare(
          "SELECT Provider, TierFrom, Mode FROM Price WHERE Provider = 'p'"
        ).get();
        assert.ok(Price !== void 0, "the v2 price row survived");
        assert.equal(Price.TierFrom, 0, "the tier floor defaulted to zero");
        assert.equal(Price.Mode, "standard", "the price mode defaulted to standard");
        const Call = Database.prepare(
          "SELECT Provider, Mode, Region, Tier FROM Call WHERE CallId = 1"
        ).get();
        assert.ok(Call !== void 0, "the v2 call row survived");
        assert.equal(Call.Mode, "standard", "the call mode defaulted to standard");
        assert.equal(Call.Region, null, "the call region defaulted to any region");
        assert.equal(Call.Tier, null, "the call tier stayed unset");
      });
    } finally {
      V2Ledger.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Migrate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Migrate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
