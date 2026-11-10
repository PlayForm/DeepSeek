import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
  Boot,
  Check,
  Events,
  Files,
  Finish,
  Furnace,
  LoggerLines,
  MakeCounter,
  Probe,
  Root,
  StorageRecords,
  Writes,
  find,
  ledgerLines,
  mkTarget,
  actor,
  settle
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  Boot();
  Probe.Mode = "bin";
  await settle();
  const Listener = Events.find((e) => e[0] === "fs/observed")[1];
  const projGates = Path.join(Root, "gates");
  FileSystem.mkdirSync(projGates);
  const tGates = mkTarget(projGates, "k-gates");
  const before = ledgerLines().length;
  {
    const Sub = "Gate: missing target \u2192 silent (Factory.Gate reason=target)";
    {
      Check(Count, Sub, () => {
        Listener(null, { kind: "present", version: "v1" }, actor);
        assert.equal(ledgerLines().length, before, "null target \u2192 silent");
      });
    }
  }
  {
    const Sub = "Gate: non-mutation actor tool \u2192 silent (reads emit too)";
    {
      Check(Count, Sub, () => {
        Listener(tGates, { kind: "present", version: "v1" }, { name: "grep" });
        assert.equal(ledgerLines().length, before, "non-mutation actor \u2192 silent");
      });
    }
  }
  {
    const Sub = "Gate: absent observation \u2192 silent";
    {
      Check(Count, Sub, () => {
        Listener(tGates, { kind: "absent" }, actor);
        assert.equal(ledgerLines().length, before, "absent observation \u2192 silent");
      });
    }
  }
  {
    const Sub = "Gate: non-package.json basename \u2192 silent (the module gate)";
    {
      Check(Count, Sub, () => {
        Listener(
          { targetKey: "k-cargo", displayPath: Path.join(projGates, "Cargo.toml") },
          { kind: "present", version: "v1" },
          actor
        );
        assert.equal(ledgerLines().length, before, "non-package.json basename \u2192 silent");
      });
    }
  }
  {
    const Sub = "Gate: Stash idempotence \u2192 silent (our own re-emits skip)";
    {
      Check(Count, Sub, () => {
        Probe.Stash.set(tGates.targetKey, "v1");
        Listener(tGates, { kind: "present", version: "v1" }, actor);
        assert.equal(ledgerLines().length, before, "Stash idempotence \u2192 silent");
        Probe.Stash.delete(tGates.targetKey);
      });
    }
  }
  {
    const Sub = "Gate: exclusion-first \u2192 `skipped (excluded) <path>` byte-identical";
    {
      Check(Count, Sub, () => {
        const projExcluded = Path.join(Root, ".git", "inner");
        FileSystem.mkdirSync(projExcluded, { recursive: true });
        Files[Path.join(projExcluded, "package.json")] = "{}";
        Listener(mkTarget(projExcluded, "k-exc"), { kind: "present", version: "v1" }, actor);
        assert.equal(
          find(`skipped (excluded) ${Path.join(projExcluded, "package.json")}`).length,
          1,
          "excluded line byte-identical"
        );
      });
    }
  }
  {
    const Sub = "Gate: the P5 `excluded` record for the excluded path";
    {
      Check(Count, Sub, () => {
        const projExcluded = Path.join(Root, ".git", "inner");
        assert.ok(
          StorageRecords.some(
            ([, r]) => r.event === "excluded" && r.path === Path.join(projExcluded, "package.json")
          ),
          "P5 excluded record"
        );
      });
    }
  }
  {
    const Sub = "Gate: excluded -> no write, nothing else logged";
    {
      Check(Count, Sub, () => {
        assert.equal(Writes.length, 0, "excluded -> no write");
      });
    }
  }
  {
    const Sub = "silence: a throwing listener is contained (`listener error (suppressed)`), never rethrown";
    {
      Check(Count, Sub, () => {
        Probe.Factory = void 0;
        assert.doesNotThrow(() => Listener(tGates, { kind: "present", version: "vX" }, actor));
        Probe.Factory = Furnace;
        assert.ok(
          LoggerLines.error.some(
            (m) => m.startsWith("hook-dsh-governor-package: listener error (suppressed): ")
          ),
          "listener error suppressed, logger-only"
        );
      });
    }
  }
  return Finish(Count, "Gate-Matrix");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Gate-Matrix`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
