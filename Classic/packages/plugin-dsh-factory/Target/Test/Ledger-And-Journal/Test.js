import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import * as Path from "node:path";
import {
  Check,
  CheckAsync,
  Finish,
  MakeCounter,
  Make,
  TempRoot,
  FactoryClass
} from "../Harness.js";
const runTest = async () => {
  const Count = MakeCounter();
  const Fake = Make(null, { files: {} });
  const ctx = Fake.Context;
  const { effects, services, loggerLines } = Fake;
  const Root = TempRoot("factory-smoke-");
  const Ledger = Path.join(Root, "ledger.log");
  const factory = new FactoryClass(ctx);
  const volatileCell = { get: () => ["write", "edit"] };
  const st1 = factory.State(
    ctx,
    {
      log: true,
      logFile: Ledger,
      policyFile: "",
      exclude: ["x"],
      mutationTools: volatileCell,
      strict: false,
      sections: ["dependencies"]
    },
    { module: "smoke-flavor", fields: { Section: "sections", Strict: "strict" } }
  );
  {
    const Sub = "Append: [ISO] line + logger prefix + Enabled gate + never throws";
    {
      Check(Count, Sub, () => {
        factory.Append(st1, "smoke ledger line");
        const lines = readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
        assert.match(
          lines.at(-1),
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] smoke ledger line$/
        );
        assert.equal(loggerLines.info.at(-1), "smoke-flavor: smoke ledger line");
        const stOff = factory.State(ctx, { logFile: Ledger, log: false }, { module: "f" });
        const sizeBefore = statSync(Ledger).size;
        assert.doesNotThrow(() => factory.Append(stOff, "disabled line"));
        assert.equal(statSync(Ledger).size, sizeBefore, "Enabled=false \u2192 no file append");
        assert.doesNotThrow(() => factory.Append(stOff, "bad ledger path"), "never throws");
      });
    }
  }
  {
    const Sub = "Journal: pre-bind buffer sink + per-State fallback + storage failure contained (silent skip)";
    {
      Check(Count, Sub, () => {
        assert.doesNotThrow(() => factory.Journal(st1, "activated", "", "proof"));
        assert.equal(factory.PendingJournal.length, 1, "queued into the pre-bind buffer");
        assert.deepEqual(factory.PendingJournal[0], {
          event: "activated",
          path: "",
          detail: "proof",
          at: factory.PendingJournal[0].at
        });
        assert.equal(st1.Queue.length, 0, "the per-State queue stays empty while the buffer is live");
        const BufferBackup = factory.PendingJournal;
        factory.PendingJournal = void 0;
        assert.doesNotThrow(() => {
          st1.Journal = () => {
            throw new Error("storage broke");
          };
          factory.Journal(st1, "governed", "/p", "v");
        });
        factory.PendingJournal = BufferBackup;
      });
    }
  }
  {
    const Sub = "Attach: P1 controller + P2 disposal + P5 open/drain/silent-skip/close";
    {
      await CheckAsync(Count, Sub, async () => {
        factory.PendingJournal = [];
        factory.SharedJournal = void 0;
        const controllers = [];
        const detached = [];
        services["jobs"] = {
          attachController: (name) => {
            controllers.push(name);
            return () => detached.push(name);
          }
        };
        const stA = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
        const flight = new AbortController();
        stA.Inflight.set("k1", { controller: flight });
        effects.length = 0;
        factory.Attach(ctx, { state: stA, name: "smoke-flavor" });
        const labels = effects.map((e) => e[0]);
        assert.deepEqual(labels, [
          "smoke-flavor-jobs",
          "smoke-flavor-inflight",
          "smoke-flavor-storage"
        ]);
        assert.deepEqual(controllers, ["smoke-flavor"], "P1: jobs controller attached");
        const inflightEffect = effects.find((e) => e[0] === "smoke-flavor-inflight")[1];
        inflightEffect();
        assert.equal(flight.signal.aborted, true, "P2: unload aborts the in-flight pass");
        assert.equal(stA.Inflight.size, 0, "P2: map cleared");
        const stS = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
        effects.length = 0;
        factory.Attach(ctx, { state: stS, name: "smoke-flavor" });
        const storageDispose = effects.find((e) => e[0] === "smoke-flavor-storage")[1];
        stS.Journal("activated", "", "queued");
        assert.equal(stS.Queue.length, 0, "P5 absent: sink retired \u2014 no queue growth");
        storageDispose();
        const records = [];
        let domainClosed = false;
        let domainSpec = null;
        services["storageDomain"] = {
          open: async (spec) => {
            domainSpec = spec;
            return {
              close: async () => {
                domainClosed = true;
              },
              table: () => ({
                put: async (k, v) => records.push([k, v])
              })
            };
          }
        };
        const stD = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
        stD.Journal("activated", "", "pre-open record");
        effects.length = 0;
        factory.Attach(ctx, { state: stD, name: "smoke-flavor" });
        await new Promise((r) => setImmediate(() => setImmediate(r)));
        assert.equal(stD.Queue.length, 0, "pre-open queue drained");
        assert.equal(
          domainSpec && domainSpec.name,
          "package_governance",
          "P5 spec: the SHARED package_governance domain"
        );
        assert.equal(
          domainSpec && domainSpec.version,
          2,
          "P5 spec: domain VERSION 2 (item #8 - 'normalized' is a new event name, so a version bump)"
        );
        assert.ok(
          domainSpec && domainSpec.tables && domainSpec.tables.events,
          "P5 spec: declares the events table"
        );
        assert.deepEqual(
          domainSpec.tables.events.valueSchema.shape.event.options,
          ["activated", "governed", "dispatched", "update-failed", "excluded", "normalized"],
          "P5 spec: v2 event vocabulary ('normalized' included)"
        );
        assert.equal(
          domainSpec.layout,
          "per-record",
          "P5 spec: per-record LAYOUT (the v1\u2192v2 self-migration path)"
        );
        assert.deepEqual(
          domainSpec.compatibleVersions,
          [1],
          "P5 spec: compatibleVersions [1] - the legacy v1 stamp migrates"
        );
        assert.equal(
          domainSpec.invalidRecords,
          "backup-and-skip",
          "P5 spec: backup-and-skip - one corrupt record cannot brick the open"
        );
        assert.equal(records.length, 1, "record flowed to the domain table");
        assert.equal(records[0][1].event, "activated");
        assert.equal(records[0][1].detail, "pre-open record");
        stD.Journal("governed", "/p.json", "fresh-v2");
        await new Promise((r) => setImmediate(r));
        assert.equal(records.length, 2, "live records flow after open");
        effects.find((e) => e[0] === "smoke-flavor-storage")[1]();
        await new Promise((r) => setImmediate(r));
        assert.equal(domainClosed, true, "P5 disposer closes the domain");
      });
    }
  }
  {
    const Sub = "Attach: P5 failed open \u2192 loud ledger line, no throw, no sink bound";
    {
      await CheckAsync(Count, Sub, async () => {
        services["storageDomain"] = {
          open: async () => {
            throw new Error("version-mismatch");
          }
        };
        factory.SharedJournal = void 0;
        factory.PendingJournal = [];
        const failLedger = Path.join(Root, "fail-ledger.log");
        const stFail = factory.State(
          ctx,
          { log: true, logFile: failLedger },
          { module: "smoke-flavor" }
        );
        effects.length = 0;
        factory.Attach(ctx, { state: stFail, name: "smoke-flavor" });
        await new Promise((r) => setImmediate(() => setImmediate(r)));
        assert.equal(stFail.Domain, void 0, "P5 failed open: no domain handle bound");
        assert.equal(factory.SharedJournal, void 0, "P5 failed open: no shared sink bound");
        assert.ok(
          readFileSync(failLedger, "utf8").includes("storage journal open failed: version-mismatch"),
          "P5 failed open: the LOUD ledger line (best-effort, never rethrown)"
        );
      });
    }
  }
  return Finish(Count, "Ledger-And-Journal");
};
const InvokedDirectly = process.argv[1] !== void 0 && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
  const Pass = await runTest();
  console.log(`${Pass} PASS - Ledger-And-Journal`);
}
export {
  runTest
};
//# sourceMappingURL=Test.js.map
