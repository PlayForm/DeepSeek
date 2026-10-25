// Source/Test/Ledger-And-Journal/Test.ts - one singular test: the ledger
// Append semantics (the [ISO] file line, the module-prefixed logger line, the
// Enabled gate, the never-throws posture), the Journal sink (the pre-bind
// buffer, the per-State fallback, the silent containment), and the Attach
// effects (the P1 jobs controller, the P2 inflight disposal, the P5 storage
// open/drain/close and its loud failed-open ledger line).
// Runs standalone (`node Target/Test/Ledger-And-Journal/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/plugin-dsh-factory: the fake ctx + the REAL factory
// class, from the Harness.
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
	FactoryClass,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// The folder fixtures: the fake ctx + the REAL factory instance, the temp
	// root and the source suite's st1 State.
	const Fake = Make(null, { files: {} });
	const ctx = Fake.Context;
	const { effects, services, loggerLines } = Fake;
	const Root = TempRoot("factory-smoke-");
	const Ledger = Path.join(Root, "ledger.log");
	const factory: any = new FactoryClass(ctx);
	const volatileCell = { get: () => ["write", "edit"] };
	const st1: any = factory.State(
		ctx,
		{
			log: true,
			logFile: Ledger,
			policyFile: "",
			exclude: ["x"],
			mutationTools: volatileCell,
			strict: false,
			sections: ["dependencies"],
		},
		{ module: "smoke-flavor", fields: { Section: "sections", Strict: "strict" } },
	);
	// Group: 8 - Append: byte-identical ledger semantics.
	{
		const Sub = "Append: [ISO] line + logger prefix + Enabled gate + never throws";
		{
			Check(Count, Sub, () => {
				factory.Append(st1, "smoke ledger line");
				const lines = readFileSync(Ledger, "utf8").split("\n").filter(Boolean);
				assert.match(
					lines.at(-1) as string,
					/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] smoke ledger line$/,
				);
				assert.equal(loggerLines.info.at(-1), "smoke-flavor: smoke ledger line");
				const stOff: any = factory.State(ctx, { logFile: Ledger, log: false }, { module: "f" });
				const sizeBefore = statSync(Ledger).size;
				assert.doesNotThrow(() => factory.Append(stOff, "disabled line"));
				assert.equal(statSync(Ledger).size, sizeBefore, "Enabled=false \u2192 no file append");
				assert.doesNotThrow(() => factory.Append(stOff, "bad ledger path"), "never throws");
			});
		}
	}
	// Group: 9 - Journal: silent-skip + record paths.
	{
		const Sub =
			"Journal: pre-bind buffer sink + per-State fallback + storage failure contained (silent skip)";
		{
			Check(Count, Sub, () => {
				assert.doesNotThrow(() => factory.Journal(st1, "activated", "", "proof"));
				assert.equal(factory.PendingJournal.length, 1, "queued into the pre-bind buffer");
				assert.deepEqual(factory.PendingJournal[0], {
					event: "activated",
					path: "",
					detail: "proof",
					at: factory.PendingJournal[0].at,
				});
				assert.equal(st1.Queue.length, 0, "the per-State queue stays empty while the buffer is live");
				// the defensive fallback: buffer retired + no shared sink \u2192 per-State sink
				const BufferBackup = factory.PendingJournal;
				factory.PendingJournal = undefined;
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
	// Group: 14 - Attach: P1 jobs + P2 inflight disposal + P5 storage. The P5
	// journal stages are reset here the way the source suite resets them
	// (through makeCtx at the section boundaries): a stale pending buffer or
	// shared sink would leak the Journal group's record into this group's
	// drain.
	{
		const Sub = "Attach: P1 controller + P2 disposal + P5 open/drain/silent-skip/close";
		{
			await CheckAsync(Count, Sub, async () => {
				factory.PendingJournal = [];
				factory.SharedJournal = undefined;
				factory.SharedJournals = undefined;
				const controllers: any[] = [];
				const detached: any[] = [];
				services["jobs"] = {
					attachController: (name: unknown) => {
						controllers.push(name);
						return () => detached.push(name);
					},
				};
				const stA: any = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
				const flight = new AbortController();
				stA.Inflight.set("k1", { controller: flight });
				effects.length = 0;
				factory.Attach(ctx, { state: stA, name: "smoke-flavor" });
				const labels = effects.map((e: any[]) => e[0]);
				assert.deepEqual(labels, [
					"smoke-flavor-jobs",
					"smoke-flavor-inflight",
					"smoke-flavor-storage",
				]);
				assert.deepEqual(controllers, ["smoke-flavor"], "P1: jobs controller attached");
				const inflightEffect = effects.find((e: any[]) => e[0] === "smoke-flavor-inflight")[1];
				inflightEffect();
				assert.equal(flight.signal.aborted, true, "P2: unload aborts the in-flight pass");
				assert.equal(stA.Inflight.size, 0, "P2: map cleared");
				// P5 absent \u2192 silent skip, sink retired
				const stS: any = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
				effects.length = 0;
				factory.Attach(ctx, { state: stS, name: "smoke-flavor" });
				const storageDispose = effects.find((e: any[]) => e[0] === "smoke-flavor-storage")[1];
				stS.Journal("activated", "", "queued");
				assert.equal(stS.Queue.length, 0, "P5 absent: sink retired \u2014 no queue growth");
				storageDispose();
				// P5 present \u2192 stub domain opens, queue drains, records flow. The stub's
				// `open` CAPTURES the spec Function/Open passes to defineDomain (a small
				// harness seam, mirroring the scenario style above): the SHARED
				// package_governance v2 events table is asserted below - v2 BY DESIGN
				// (register item #8: the "normalized" event is a new event name, and a
				// new event name requires a new domain version).
				const records: any[] = [];
				let domainClosed = false;
				let domainSpec: any = null;
				services["storageDomain"] = {
					open: async (spec: unknown) => {
						domainSpec = spec;
						return {
							close: async () => {
								domainClosed = true;
							},
							table: () => ({
								put: async (k: unknown, v: unknown) => records.push([k, v]),
							}),
						};
					},
				};
				const stD: any = factory.State(ctx, { logFile: Ledger }, { module: "smoke-flavor" });
				stD.Journal("activated", "", "pre-open record");
				effects.length = 0;
				factory.Attach(ctx, { state: stD, name: "smoke-flavor" });
				await new Promise((r) => setImmediate(() => setImmediate(r)));
				assert.equal(stD.Queue.length, 0, "pre-open queue drained");
				assert.equal(
					domainSpec && domainSpec.name,
					"package_governance",
					"P5 spec: the SHARED package_governance domain",
				);
				assert.equal(
					domainSpec && domainSpec.version,
					2,
					"P5 spec: domain VERSION 2 (item #8 - 'normalized' is a new event name, so a version bump)",
				);
				assert.ok(
					domainSpec && domainSpec.tables && domainSpec.tables.events,
					"P5 spec: declares the events table",
				);
				assert.deepEqual(
					domainSpec.tables.events.valueSchema.shape.event.options,
					["activated", "governed", "dispatched", "update-failed", "excluded", "normalized"],
					"P5 spec: v2 event vocabulary ('normalized' included)",
				);
				// The v2 open contract (the P5 fix): per-record layout +
				// compatibleVersions [1] - the single-layout unit parser enforces exact
				// version equality, so the per-record backend's legacy bootstrap
				// migrates the pre-existing v1-stamped file instead of hard-failing
				// `version-mismatch` - and the corrupt-record policy so one bad stored
				// record can never brick the open.
				assert.equal(
					domainSpec.layout,
					"per-record",
					"P5 spec: per-record LAYOUT (the v1\u2192v2 self-migration path)",
				);
				assert.deepEqual(
					domainSpec.compatibleVersions,
					[1],
					"P5 spec: compatibleVersions [1] - the legacy v1 stamp migrates",
				);
				assert.equal(
					domainSpec.invalidRecords,
					"backup-and-skip",
					"P5 spec: backup-and-skip - one corrupt record cannot brick the open",
				);
				assert.equal(records.length, 1, "record flowed to the domain table");
				assert.equal(records[0][1].event, "activated");
				assert.equal(records[0][1].detail, "pre-open record");
				stD.Journal("governed", "/p.json", "fresh-v2");
				await new Promise((r) => setImmediate(r));
				assert.equal(records.length, 2, "live records flow after open");
				effects.find((e: any[]) => e[0] === "smoke-flavor-storage")[1]();
				await new Promise((r) => setImmediate(r));
				assert.equal(domainClosed, true, "P5 disposer closes the domain");
			});
		}
	}
	// Group: P5 open FAILURE \u2192 the loud ledger line (the P5 fix): a present
	// facility whose open rejects produces exactly one best-effort ledger line
	// ("storage journal open failed: <message>" - logger + the module's
	// durable ledger, via the factory's own Append) and NO throw: the failed
	// open never binds a sink or a domain handle, the best-effort posture
	// stays (the absent-facility silent skip above is a different, still
	// silent case - Open is never even called without a facility).
	{
		const Sub = "Attach: P5 failed open \u2192 loud ledger line, no throw, no sink bound";
		{
			await CheckAsync(Count, Sub, async () => {
				services["storageDomain"] = {
					open: async () => {
						throw new Error("version-mismatch");
					},
				};
				factory.SharedJournal = undefined;
				factory.SharedJournals = undefined;
				factory.PendingJournal = [];
				const failLedger = Path.join(Root, "fail-ledger.log");
				const stFail: any = factory.State(
					ctx,
					{ log: true, logFile: failLedger },
					{ module: "smoke-flavor" },
				);
				effects.length = 0;
				factory.Attach(ctx, { state: stFail, name: "smoke-flavor" });
				await new Promise((r) => setImmediate(() => setImmediate(r)));
				assert.equal(stFail.Domain, undefined, "P5 failed open: no domain handle bound");
				assert.equal(factory.SharedJournal, undefined, "P5 failed open: no shared sink bound");
				assert.ok(
					readFileSync(failLedger, "utf8").includes("storage journal open failed: version-mismatch"),
					"P5 failed open: the LOUD ledger line (best-effort, never rethrown)",
				);
			});
		}
	}
	{
		const Sub = "Attach: P5 journalDomain option \u2192 the State's own domain name";
		{
			await CheckAsync(Count, Sub, async () => {
				let optSpec: any = null;
				services["storageDomain"] = {
					open: async (spec: unknown) => {
						optSpec = spec;
						return {
							close: async () => {},
							table: () => ({ put: async () => {} }),
						};
					},
				};
				factory.SharedJournal = undefined;
				factory.SharedJournals = undefined;
				factory.PendingJournal = [];
				services["pluginFactory"] = factory;
				const stOpt: any = factory.State(
					ctx,
					{ logFile: Ledger },
					{ module: "smoke-flavor", journalDomain: "hook_dsh_package_pinner" },
				);
				assert.equal(
					stOpt.JournalDomain,
					"hook_dsh_package_pinner",
					"the journalDomain option transfers to State.JournalDomain",
				);
				effects.length = 0;
				factory.Attach(ctx, { state: stOpt, name: "smoke-flavor" });
				await new Promise((r) => setImmediate(() => setImmediate(r)));
				assert.equal(
					optSpec && optSpec.name,
					"hook_dsh_package_pinner",
					"P5 spec: the module's own distinct domain name (unit-name rule: lowercase/digits/underscores)",
				);
				assert.ok(
					factory.SharedJournals?.get("hook_dsh_package_pinner"),
					"the custom-domain open registers its sink in SharedJournals under its own domain key",
				);
				assert.equal(
					factory.SharedJournals?.get("package_governance"),
					undefined,
					"the custom-domain open does not register under the default domain key",
				);
				assert.equal(
					factory.SharedJournal,
					undefined,
					"a custom-domain open leaves the legacy SharedJournal slot unbound",
				);
				effects.find((e: any[]) => e[0] === "smoke-flavor-storage")[1]();
				await new Promise((r) => setImmediate(r));
			});
		}
	}
	return Finish(Count, "Ledger-And-Journal");
};

// Standalone entry: `node Target/Test/Ledger-And-Journal/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Ledger-And-Journal`);
}
