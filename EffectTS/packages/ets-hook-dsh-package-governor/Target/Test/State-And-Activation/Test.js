import assert from "node:assert/strict";
import {
  Check,
  Controllers,
  Context,
  Effects,
  EXCLUDE,
  Events,
  Finish,
  Furnace,
  Ledger,
  ledgerLines,
  MakeCounter,
  NCU_BIN,
  Services,
  StorageRecords,
  TOOLS,
  settle
} from "../Harness.js";
import Governor from "../../../Target/Library.js";
const runTest = async () => {
  const Count = MakeCounter();
  Effects.length = 0;
  const Raw = Governor.Config({ logFile: Ledger });
  const Returned = Governor.apply(Context, Raw);
  const Probe = Context.__hookDshGovernorPackageState;
  {
    const Sub = "apply: returns nothing; the state exposed via ctx.__hookDshGovernorPackageState";
    {
      Check(Count, Sub, () => {
        assert.equal(Returned, void 0, "apply returns nothing");
        assert.ok(Probe, "ctx.__hookDshGovernorPackageState probe attached");
      });
    }
  }
  {
    const Sub = "State: Module + Tool \u2190 mutationTools (cell unwrapped by the factory)";
    {
      Check(Count, Sub, () => {
        assert.equal(Probe.Module, "hook-dsh-governor-package");
        assert.deepEqual(Probe.Tool, TOOLS, "Tool <- mutationTools (cell unwrapped)");
      });
    }
  }
  {
    const Sub = "State: module fields via the setup map (Strict/Wait/Limit/Binary/Mode)";
    {
      Check(Count, Sub, () => {
        assert.equal(Probe.Strict, false);
        assert.equal(Probe.Wait, 3e3);
        assert.equal(Probe.Limit, 3);
        assert.equal(Probe.Binary, NCU_BIN);
        assert.equal(Probe.Mode, "programmatic");
      });
    }
  }
  {
    const Sub = "State: shared mappings (Policy/policyFile, Ledger/logFile, Enabled/log, List/exclude)";
    {
      Check(Count, Sub, () => {
        assert.equal(Probe.Policy, "");
        assert.equal(Probe.PolicyName, "update-policy.json", "sidecar name for union discovery");
        assert.equal(Probe.Ledger, Ledger);
        assert.equal(Probe.Enabled, true);
        assert.deepEqual(Probe.List, EXCLUDE);
      });
    }
  }
  {
    const Sub = "State: P9 subprocess seam probed once at build";
    {
      Check(Count, Sub, () => {
        assert.equal(Probe.Subprocess, Services["subprocess"], "P9 subprocess probed at build");
      });
    }
  }
  {
    const Sub = "State: the injected factory service stored on State";
    {
      Check(Count, Sub, () => {
        assert.equal(Probe.Factory, Furnace, "the injected factory stored on State");
      });
    }
  }
  {
    const Sub = "State: fresh machinery + module gate collections (Stash/Inflight/Seams/Queue/Stamp/Set/Count)";
    {
      Check(Count, Sub, () => {
        assert.ok(
          Probe.Stash instanceof Map && Probe.Inflight instanceof Map && Probe.Seams instanceof Map && Probe.Queue.length === 0 && Furnace.PendingJournal.length === 1 && Probe.Stamp instanceof Map && Probe.Set instanceof Set && Probe.Count instanceof Map,
          "fresh machinery + module gate collections (+ the pre-bind buffered activated record)"
        );
        Probe.Mode = "bin";
      });
    }
  }
  {
    const Sub = "Attach: P1 controller + P2/P5 effects; Wire registered fs/observed";
    {
      Check(Count, Sub, () => {
        assert.deepEqual(
          Effects.map((e) => e[0]),
          [
            "hook-dsh-governor-package-jobs",
            "hook-dsh-governor-package-inflight",
            "hook-dsh-governor-package-storage"
          ],
          "factory.Attach registered P1/P2/P5 with the module labels"
        );
        assert.deepEqual(Controllers, ["hook-dsh-governor-package"], "P1: jobs controller attached");
        assert.equal(
          Events.filter((e) => e[0] === "fs/observed").length,
          1,
          "one fs/observed listener (Factory.Wire)"
        );
      });
    }
  }
  await settle();
  {
    const Sub = "activation: the P5 record drained into the opened domain";
    {
      Check(Count, Sub, () => {
        assert.equal(Probe.Queue.length, 0, "P5: pre-open queue drained into the stub domain");
        assert.equal(StorageRecords.length, 1);
        assert.equal(StorageRecords[0][1].event, "activated");
      });
    }
  }
  {
    const Sub = "activation: durable proof line byte-identical ([ISO] format + summary fields)";
    {
      Check(Count, Sub, () => {
        const lines = ledgerLines();
        assert.equal(lines.length, 1, "exactly one ledger line so far");
        assert.match(
          lines[0],
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] activated \(anywhere mode, logFile=/
        );
        assert.ok(
          lines[0].includes(
            `logFile=${Ledger}, updateMode=programmatic, ncuBin=${NCU_BIN}, exclude=[${EXCLUDE.join(
              ", "
            )}], policyFile=(discovery))`
          ),
          "activation proof composed byte-identically"
        );
      });
    }
  }
  return Finish(Count, "State-And-Activation");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - State-And-Activation`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
