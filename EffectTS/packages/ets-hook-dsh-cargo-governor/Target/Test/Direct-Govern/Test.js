import assert from "node:assert/strict";
import * as Path from "node:path";
import {
  Boot,
  CheckAsync,
  Finish,
  Furnace,
  Flush,
  Group,
  Ledger,
  LedgerFile,
  MakeContext,
  MakeCounter,
  ProbeState,
  Registry,
  SeamStub
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  {
    const dir = Group("direct");
    const file = Path.join(dir, "Cargo.toml");
    const m = MakeContext({
      services: { subprocess: SeamStub() },
      files: { [file]: '[dependencies]\nserde = "1.0"\nrand = "0.8.0"\n' }
    });
    m.ctx.pluginFactory = Furnace;
    m.ledger = LedgerFile("direct");
    Boot(m);
    Registry(dir, { serde: "1.0.0" });
    const t = { targetKey: "k-direct", displayPath: file };
    const writesBefore = m.captured.writes.length;
    await Furnace.Govern(t, "cargo", { name: "edit" }, "v-direct");
    await Flush();
    const lines = Ledger(m.ledger);
    const write = m.captured.writes.at(-1);
    const writeCount = m.captured.writes.length;
    const governedLine = lines.includes(`governed ${file} \u2192 fresh-v2`);
    const stashed = ProbeState.Stash.get("k-direct");
    const dispatchedCount = lines.filter((l) => l.startsWith("update stage dispatched")).length;
    await CheckAsync(
      Count,
      "direct-govern: cargo \u2014 Stash seed + Continue, guarded write, ledger byte-identical, no update stage",
      async () => {
        assert.equal(writeCount, writesBefore + 1, "cargo step: the chain pass wrote");
        assert.deepEqual(
          write.intent,
          { kind: "replaceIfVersion", version: "stat-v9" },
          "cargo step: guarded write at the CURRENT (fresh-stat) version \u2014 the chain pass stats before the write (the sequential-fold fix); on a real backend an unraced pass stats exactly the observed version"
        );
        assert.ok(
          write.content.includes('serde = "1.0.0"'),
          "cargo step: chain pin rewritten to the resolved form"
        );
        assert.ok(
          write.content.includes('rand = "0.8.0"'),
          "cargo step: public dep untouched by the chain pass"
        );
        assert.ok(
          governedLine,
          "cargo step: `governed <path> \u2192 <version>` byte-identical"
        );
        assert.equal(
          stashed,
          "fresh-v2",
          "cargo step: the Stash seeded, then advanced by the write"
        );
        assert.equal(
          dispatchedCount,
          0,
          "cargo step: NO update stage (the chain + normalization pass only)"
        );
      }
    );
    const beforeLines = lines.length;
    await Furnace.Govern(t, ["bogus"], { name: "edit" }, "v-x");
    await Flush();
    const afterBogus = Ledger(m.ledger).length;
    m.files[file] = '[dependencies]\nserde = "1.0"\nrand = "0.8.0"\n';
    await Furnace.Govern(t, true, { name: "edit" }, "v-direct3");
    await Flush();
    const combined = Ledger(m.ledger);
    const lastGoverned = combined.map((l) => l.includes(`governed ${file} \u2192 `)).lastIndexOf(true);
    const dispatched = combined.map(
      (l) => l === `update stage dispatched for ${dir} (cargo via cargo, built-in default policy)`
    ).lastIndexOf(true);
    const governedCount = combined.filter((l) => l.includes(`governed ${file} \u2192 `)).length;
    const combinedWrite = m.captured.writes.filter((w) => w.path === file).at(-1);
    await CheckAsync(
      Count,
      "direct-govern: cargo sequential fold \u2014 `true` runs the cargo step then the update step, in order (deterministic)",
      async () => {
        assert.equal(afterBogus, beforeLines, "selection: unknown step names run nothing");
        assert.ok(
          lastGoverned >= 0 && dispatched > lastGoverned,
          "selection: the cargo chain pass's `governed` line precedes the update step's dispatch (sequential fold order)"
        );
        assert.ok(
          governedCount >= 2,
          "selection: `true` ran the chain pass again"
        );
        assert.ok(
          combinedWrite.content.includes('serde = "1.0.0"'),
          "selection: the fold left the chain pin in the canonical form (deterministic final state)"
        );
      }
    );
  }
  {
    const dir = Group("fold");
    const file = Path.join(dir, "Cargo.toml");
    const m = MakeContext({
      services: { subprocess: SeamStub() },
      files: { [file]: '[dependencies]\nserde = "1.0"\nrand = "0.8"\n' }
    });
    m.ctx.pluginFactory = Furnace;
    m.ledger = LedgerFile("fold");
    Boot(m);
    Registry(dir, { serde: "1.0.0" });
    const t = { targetKey: "k-fold", displayPath: file };
    const stSim = Furnace.State(
      m.ctx,
      { log: true, logFile: m.ledger },
      { module: "hook-dsh-governor-cargo", policyFileName: "pin-policy.json" }
    );
    Furnace.RegisterGovern(
      "Cargo.toml",
      "fold-sim",
      (tt, a, v) => Furnace.Continue(stSim, tt, a, dir, null, v, (text) => {
        if (typeof text !== "string" || text.includes("# fold-sim")) return null;
        return {
          next: text + "# fold-sim\n",
          count: 1,
          message: `fold-sim appended in ${file}`
        };
      })
    );
    const writesBeforeFold = m.captured.writes.length;
    await Furnace.Govern(t, ["cargo", "fold-sim"], { name: "edit" }, "v-fold-cargo");
    await Flush();
    const foldWrites = m.captured.writes.slice(writesBeforeFold);
    const finalHasSerde = m.files[file].includes('serde = "1.0.0"');
    const finalHasMarker = m.files[file].includes("# fold-sim");
    const foldLedger = Ledger(m.ledger);
    const govIdx = foldLedger.map((l) => l.includes(`governed ${file} \u2192 `)).lastIndexOf(true);
    const simIdx = foldLedger.map((l) => l.includes("fold-sim appended")).lastIndexOf(true);
    Furnace.RegisterGovern("Cargo.toml", "fold-sim", () => {
    });
    await CheckAsync(
      Count,
      "direct-govern: two-chain-writer fold (cargo + sim) \u2014 both writes land at the fresh-stat version, final state converged",
      async () => {
        assert.equal(foldWrites.length, 2, "fold: BOTH chain-writing steps wrote");
        assert.deepEqual(
          foldWrites[0].intent,
          { kind: "replaceIfVersion", version: "stat-v9" },
          "fold step 1 (cargo): guarded at the fresh-stat CURRENT version"
        );
        assert.deepEqual(
          foldWrites[1].intent,
          { kind: "replaceIfVersion", version: "stat-v9" },
          "fold step 2 (sim): guarded at the fresh-stat CURRENT version \u2014 NOT the stale observed 'v-fold-cargo'"
        );
        assert.notEqual(
          foldWrites[1].intent.version,
          "v-fold-cargo",
          "the observed version handed to the fold is never the later step's write basis"
        );
        assert.ok(finalHasSerde, "fold: the cargo step's chain pin landed");
        assert.ok(finalHasMarker, "fold: the sim step landed on the file as the cargo step left it");
        assert.ok(
          govIdx >= 0 && simIdx > govIdx,
          "fold: both lines appear in the fold's registered order (cargo's `governed`, then the sim's)"
        );
      }
    );
  }
  {
    const dir = Group("direct-update");
    const file = Path.join(dir, "Cargo.toml");
    const m = MakeContext({
      services: { subprocess: SeamStub() },
      files: { [file]: '[dependencies]\nrand = "0.8"\n' }
    });
    m.ctx.pluginFactory = Furnace;
    m.ledger = LedgerFile("direct-update");
    Boot(m);
    const t = { targetKey: "k-direct2", displayPath: file };
    await Furnace.Govern(t, "update", { name: "edit" }, "v-direct2");
    await Flush();
    const lines = Ledger(m.ledger);
    const chainWrites = m.captured.writes.filter((w) => w.path === file).length;
    const stashed = ProbeState.Stash.get("k-direct2");
    await CheckAsync(
      Count,
      "direct-govern: update \u2014 the update stage alone through the Dispatch envelope, gates and ledger byte-identical",
      async () => {
        assert.ok(
          lines.some(
            (l) => l === `update stage dispatched for ${dir} (cargo via cargo, built-in default policy)`
          ),
          "update step: `update stage dispatched \u2026` line byte-identical"
        );
        assert.ok(
          lines.includes("update: using built-in default policy"),
          "update step: the policy diagnostics belong to the job"
        );
        assert.ok(
          lines.includes("update: DONE \u2014 pins bumped per policy"),
          "update step: the run completed"
        );
        assert.equal(
          chainWrites,
          0,
          "update step: no chain write from the update step"
        );
        assert.equal(
          stashed,
          "stat-v9",
          "update step: the Stash seeded, then advanced by the U\u2082 refresh"
        );
      }
    );
  }
  return Finish(Count, "Direct-Govern");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Direct-Govern`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
