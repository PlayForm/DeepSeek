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
const Columns = (Database, Table) => Database.prepare(`PRAGMA table_info(${Table})`).all().map(
  (One) => One.name
);
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-migrate-"));
  try {
    const Path = join(Home, "ledger.db");
    const Seed = new DatabaseSync(Path);
    Seed.exec(V1);
    Seed.prepare("INSERT INTO Session (SessionId, CreatedAt) VALUES ('s1', 0)").run();
    Seed.prepare("INSERT INTO File (FileId, Path) VALUES (1, '/w/a.ts')").run();
    Seed.close();
    const Ledger = Open(Validate({ databasePath: Path }));
    try {
      const Database = Ledger.Database;
      const Version = Database.prepare("PRAGMA user_version").get();
      Check(Count, "A3: the migration stamps the ledger version 2", () => {
        assert.equal(Version.user_version, 2);
      });
      Check(Count, "A1: the additive columns exist on Price, Call and Touch", () => {
        assert.ok(Columns(Database, "Price").includes("Window"), "Price.Window");
        assert.ok(Columns(Database, "Call").includes("CacheSaving"), "Call.CacheSaving");
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
      Ledger.Close();
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
