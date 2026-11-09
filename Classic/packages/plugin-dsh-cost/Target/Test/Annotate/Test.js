import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Annotate from "../../../Target/Function/Annotate.js";
import Open from "../../../Target/Function/Open.js";
import { CheckAsync, Finish, Make, MakeCounter, Validate } from "../Harness.js";
const MakeStore = () => {
  const Files = /* @__PURE__ */ new Map();
  let Tick = 0;
  const Write = async (Target, Content, Expected) => {
    const One = Files.get(Target.targetKey);
    if (Expected?.kind === "replaceIfVersion") {
      if (One === void 0) {
        throw new Error(`cannot write "${Target.displayPath}": file no longer exists`);
      }
      if (One.Version !== Expected.version) {
        throw new Error(`cannot write "${Target.displayPath}": file changed since it was read`);
      }
    }
    const Before = One === void 0 ? null : One.Content;
    const Version = `v${Tick += 1}`;
    Files.set(Target.targetKey, { Content, Version });
    return { operation: One === void 0 ? "create" : "update", version: Version, before: Before, after: Content };
  };
  return {
    Files,
    Fs: {
      resolve: async (Path) => ({ targetKey: Path, displayPath: Path }),
      stat: async (Target) => {
        const One = Files.get(Target.targetKey);
        return One === void 0 ? void 0 : { version: One.Version, type: "file", size: One.Content.length };
      },
      readText: async (Target) => {
        const One = Files.get(Target.targetKey);
        if (One === void 0) {
          throw new Error(`cannot read "${Target.displayPath}": no such file`);
        }
        return One.Content;
      },
      writeText: Write
    }
  };
};
const Seed = (Database, Home, Path, Model, Direct, Amortized, Turn, Step, At) => {
  Database.prepare("INSERT OR IGNORE INTO Client (Name) VALUES ('default')").run();
  const Client = Database.prepare("SELECT ClientId AS ClientId FROM Client WHERE Name = 'default'").get();
  Database.prepare("INSERT OR IGNORE INTO Project (ClientId, Name, Root) VALUES (?, 'sample', ?)").run(
    Client.ClientId,
    Home
  );
  const Project = Database.prepare("SELECT ProjectId AS ProjectId FROM Project WHERE Root = ?").get(Home);
  Database.prepare("INSERT OR IGNORE INTO Session (SessionId, ProjectId, CreatedAt) VALUES ('s1', ?, ?)").run(
    Project.ProjectId,
    At
  );
  Database.prepare("INSERT OR IGNORE INTO File (ProjectId, Path, FirstSeenAt) VALUES (?, ?, ?)").run(
    Project.ProjectId,
    Path,
    At
  );
  const File = Database.prepare("SELECT FileId AS FileId FROM File WHERE ProjectId = ? AND Path = ?").get(
    Project.ProjectId,
    Path
  );
  Database.prepare(
    "INSERT INTO Call (SessionId, Turn, Step, Seq, Provider, Model, InputTokens, OutputTokens, CostInput, CostOutput, CostCacheRead, CostCacheWrite, CostReasoning, CostTotal, Currency, SurfaceTokens, At) VALUES ('s1', ?, ?, ?, 'p', ?, 0, 0, 0, 0, 0, 0, 0, ?, 'USD', 0, ?)"
  ).run(Turn, Step, Step, Model, Direct + Amortized, At);
  const Call = Database.prepare("SELECT CallId AS CallId FROM Call WHERE SessionId = 's1' AND Turn = ? AND Step = ?").get(
    Turn,
    Step
  );
  Database.prepare(
    "INSERT INTO Allocation (CallId, FileId, DirectCost, AmortizedCost, ContextTokens, SurfaceTokens, Weight, Method, At) VALUES (?, ?, ?, ?, 0, 0, 0, 'bytes/context', ?)"
  ).run(Call.CallId, File.FileId, Direct, Amortized, At);
};
const runTest = async () => {
  const Count = MakeCounter();
  const Home = await mkdtemp(join(tmpdir(), "dsh-cost-annotate-"));
  try {
    const Sample = join(Home, "sample.ts");
    const Config = Validate({
      databasePath: join(Home, "ledger.db"),
      annotate: { enabled: true, marker: "dsh-cost", maxLines: 8 }
    });
    const Ledger = Open(Config);
    try {
      const Store = MakeStore();
      Store.Files.set(Sample, { Content: "export const Value = 1;\n// a trailing note\n", Version: "v0" });
      Seed(Ledger.Database, Home, Sample, "m1", 3.1022, 6.7799, 1, 1, Date.parse("2026-10-21T10:00:00Z"));
      Seed(Ledger.Database, Home, Sample, "m2", 0, 2.5362, 1, 2, Date.parse("2026-10-27T10:00:00Z"));
      const Run = Make(Config, Store.Fs);
      const AnnotateFile = Annotate(Run.Context, Ledger.Database, Config);
      await CheckAsync(Count, "T5: the block is appended once, after one blank line", async () => {
        const One = await AnnotateFile(Sample);
        assert.equal(One.Written, true, One.Reason);
        const Text = Store.Files.get(Sample)?.Content ?? "";
        assert.equal(Text.split("dsh-cost:begin").length - 1, 1, "exactly one begin marker");
        assert.ok(Text.includes("12.4183"), "the total is rendered");
        assert.ok(Text.includes("// a trailing note"), "the trailing note survives");
        assert.ok(Text.includes("\n\n// dsh-cost:begin"), "one blank line before the block");
        assert.ok(Text.endsWith("// dsh-cost:end\n"), "the block closes the file");
      });
      await CheckAsync(Count, "T5: a second run with the same numbers changes nothing", async () => {
        const One = await AnnotateFile(Sample);
        assert.equal(One.Written, false, One.Reason);
        assert.equal(One.Reason, "unchanged");
        assert.equal((Store.Files.get(Sample)?.Content ?? "").split("dsh-cost:begin").length - 1, 1);
      });
      await CheckAsync(Count, "T5: a changed total replaces the block in place, the note survives", async () => {
        Ledger.Database.prepare("UPDATE Allocation SET AmortizedCost = AmortizedCost + 1").run();
        const One = await AnnotateFile(Sample);
        assert.equal(One.Written, true, One.Reason);
        assert.equal(One.Reason, "replaced");
        const Text = Store.Files.get(Sample)?.Content ?? "";
        assert.equal(Text.split("dsh-cost:begin").length - 1, 1, "still exactly one block");
        assert.ok(Text.includes("// a trailing note"), "the note survives the replacement");
        assert.ok(Text.indexOf("// a trailing note") < Text.indexOf("// dsh-cost:begin"), "the note stays ahead");
        assert.ok(Text.includes("14.4183"), "the new total is in the block");
      });
      await CheckAsync(Count, "T5: an unknown extension is skipped, never guessed", async () => {
        const Other = join(Home, "mystery.unknownext");
        Store.Files.set(Other, { Content: "x\n", Version: "v0" });
        const One = await AnnotateFile(Other);
        assert.equal(One.Written, false);
        assert.ok(One.Reason.includes("unknown extension"), One.Reason);
      });
    } finally {
      Ledger.Close();
    }
  } finally {
    await rm(Home, { recursive: true, force: true });
  }
  return Finish(Count, "Annotate");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Annotate`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
