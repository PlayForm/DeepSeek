// Source/Test/Monitors-Persist/Test.ts - the storage tests: the P5-style
// open with the byte-exact domain spec, the record shapes, the pre-bind
// buffer and its cap, the absent facility (silent skip, honest degradation
// after a restart), the loud open failure, the recovery (provenance, the
// time-stale treatment) and the empty read (no fabricated clean).
import assert from "node:assert/strict";
import {
	Advance,
	Check,
	ClockBox,
	Finish,
	FireJobs,
	FireObserved,
	LinesWith,
	MakeCounter,
	MakeWave,
	FakeJobsHub,
	FakeShell,
	FakeStorage,
	OpenStorage,
	Validate,
	Ledger,
	rm,
	MonitorConfig,
	WaveAssemble,
} from "../Harness.js";
import type { MonitorRecord } from "../../../Target/Interface/Events.js";

/** A standard persist mount. */
const Setup = (Config: any = {}): { Jobs: any; Shell: any; Run: any } => {
	const Jobs = FakeJobsHub();
	const Shell = FakeShell();
	const Run = MakeWave(
		Validate({
			logFile: Ledger,
			enabled: true,
			...MonitorConfig({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] }),
			...Config,
		}),
		{ jobs: Jobs, shell: Shell },
	);
	return { Jobs, Shell, Run };
};

/** The stanza text of one assemble pass. */
const Stanza = async (Run: any): Promise<string> =>
	(await WaveAssemble(Run)).sections.find((S: any) => S.name === "live-containers")?.text ?? "";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the open captures the byte-exact domain spec.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const { Run } = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Check(Count, "P1: the domain spec is name/version/layout/invalidRecords/one checks table", () => {
			const Specification = Store.spec;
			assert.equal(Specification.name, "live_containers_monitors");
			assert.equal(Specification.version, 1);
			assert.equal(Specification.layout, "per-record");
			assert.equal(Specification.invalidRecords, "backup-and-skip");
			assert.ok(Specification.tables.checks !== undefined);
		});
		Check(Count, "P1: a successful open binds the sink and sets the persistence flag", () => {
			assert.equal(Run.State.MonitorsPersist, true);
			assert.ok(Run.State.MonitorDomain !== undefined);
		});
	}

	// Group P2: the record shapes through the sink.
	rm();
	{
		const { Jobs, Run } = Setup();
		const Store = FakeStorage();
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(2000);
		await Stanza(Run);
		const JobID = Jobs.started[0].id;
		FireJobs(Run, Jobs.settled(JobID, { owner: "agent-a", detail: "exit code: 0" }));
		Advance(600001);
		await Stanza(Run);
		await OpenStorage(Run, Store.facility);
		const Records = [...Store.records.values()] as MonitorRecord[];
		const Kinds = Records.map((R) => R.event);
		Check(Count, "P2: the pre-bind queue drains on the open (the enrolled record lands)", () => {
			assert.ok(Kinds.includes("monitor-enrolled"), `kinds: ${Kinds.join(",")}`);
			const Enrolled = Records.find((R) => R.event === "monitor-enrolled") as MonitorRecord;
			assert.equal(Enrolled.path, "/repo/src/App.ts");
			assert.equal(Enrolled.agent, "agent-a");
			assert.equal(Enrolled.version, "1");
			assert.equal(Enrolled.writer, "agent-a");
			assert.equal(Enrolled.checkSetId, "");
			assert.equal(Enrolled.exit, null);
			assert.equal(Enrolled.infra, null);
			assert.equal(Enrolled.tail, "");
			assert.equal(Enrolled.provenance, "live");
		});
		Check(Count, "P2: the settled check record carries the full result", () => {
			const CheckRecord = Records.find((R) => R.event === "monitor-check") as MonitorRecord;
			assert.equal(CheckRecord.checkSetId, "tsc");
			assert.equal(CheckRecord.exit, 0);
			assert.equal(CheckRecord.infra, null);
			assert.equal(CheckRecord.provenance, "live");
		});
		Check(Count, "P2: the retired record closes the lifecycle", () => {
			assert.ok(Kinds.includes("monitor-retired"), `kinds: ${Kinds.join(",")}`);
			const Retired = Records.find((R) => R.event === "monitor-retired") as MonitorRecord;
			assert.equal(Retired.writer, "");
			assert.equal(Retired.exit, null);
		});
	}

	// Group P3: the pre-bind cap (256, the factory Queue pattern).
	rm();
	{
		const { Run } = Setup();
		for (let Index = 0; Index < 300; Index += 1) {
			FireObserved(Run, `/repo/src/File${Index}.ts`, "1");
		}
		Check(Count, "P3: the pre-bind queue is capped at 256 records", () => {
			assert.equal(Run.State.MonitorsQueue.length, 256);
			assert.equal(Run.State.MonitorsPersist, false);
		});
	}

	// Group P4: the absent facility - honest degradation, never fabrication.
	rm();
	{
		const { Jobs, Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(2000);
		await Stanza(Run);
		FireJobs(Run, Jobs.settled(Jobs.started[0].id, { owner: "agent-a", detail: "exit code: 0" }));
		Check(Count, "P4: with no facility the clean result lives in memory only", () => {
			assert.equal(Run.State.MonitorsPersist, false);
			assert.ok(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts")?.checks.length === 1);
		});
		// The restart: a fresh state with no persisted records and no writes.
		const { Run: Reborn } = Setup();
		FireObserved(Reborn, "/repo/src/App.ts", "1");
		const Text = await Stanza(Reborn);
		Check(Count, "P4: after the lossy restart the band renders not run yet, never a clean", () => {
			assert.ok(Text.includes("not run yet (∅?)"), `missing in: ${Text.slice(0, 300)}`);
			assert.ok(!Text.includes("clean (∄) | checked"), "a fabricated clean appeared");
		});
	}

	// Group P5: the loud open failure.
	rm();
	{
		const { Run } = Setup();
		const Store = FakeStorage({ failOpen: true });
		await OpenStorage(Run, Store.facility);
		Check(Count, "P5: a failed open logs the byte-exact line and degrades", () => {
			assert.deepEqual(LinesWith(Run, "monitors storage open failed"), [
				"hook-dsh-live-containers: monitors storage open failed: storage unavailable",
			]);
			assert.equal(Run.State.MonitorsPersist, false);
			assert.equal(Run.State.MonitorsQueue.length, 0);
		});
	}

	// Group P6: the recovery.
	rm();
	{
		const { Jobs, Run } = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(2000);
		await Stanza(Run);
		FireJobs(Run, Jobs.settled(Jobs.started[0].id, { owner: "agent-a", detail: "exit code: 0" }));
		// The restart against the SAME store: the records survive the process.
		const { Run: Reborn } = Setup();
		await OpenStorage(Reborn, Store.facility);
		Check(Count, "P6: the recovered entry carries the persisted result with recovered provenance", () => {
			const Entry = Reborn.State.Monitors.get("agent-a")?.get("/repo/src/App.ts");
			assert.ok(Entry !== undefined);
			assert.equal(Entry.checks.length, 1);
			assert.equal(Entry.checks[0]?.provenance, "recovered");
			assert.equal(Entry.checks[0]?.exit, 0);
			assert.deepEqual(LinesWith(Reborn, "monitor recovered"), [
				"hook-dsh-live-containers: monitor recovered /repo/src/App.ts (1 checks)",
			]);
		});
		const Text = await Stanza(Reborn);
		Check(Count, "P6: the recovered band renders the not-re-checked clause", () => {
			assert.ok(
				Text.includes("clean (∄) (recovered) | checked"),
				`missing in: ${Text.slice(0, 400)}`,
			);
			assert.ok(Text.includes("| not re-checked this session"));
		});
	}

	// Group P7: the recovered time-stale treatment.
	rm();
	{
		const { Jobs, Run } = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(2000);
		await Stanza(Run);
		FireJobs(Run, Jobs.settled(Jobs.started[0].id, { owner: "agent-a", detail: "exit code: 0" }));
		const { Run: Reborn } = Setup();
		await OpenStorage(Reborn, Store.facility);
		Advance(300001);
		const Text = await Stanza(Reborn);
		Check(Count, "P7: a recovered result older than staleMs renders the STALE form", () => {
			assert.ok(
				Text.includes("~ STALE (not re-checked this session) | checked"),
				`missing in: ${Text.slice(0, 400)}`,
			);
		});
	}

	// Group P8: the empty read - no recovery, no fabrication.
	rm();
	{
		const { Run } = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		FireObserved(Run, "/repo/src/App.ts", "1");
		Check(Count, "P8: an empty store recovers nothing and the band stays honest", () => {
			assert.deepEqual(LinesWith(Run, "monitor recovered"), []);
			assert.equal(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts")?.checks.length, 0);
		});
	}
	return Finish(Count, "Monitors-Persist");
};

// Standalone entry: `node Target/Test/Monitors-Persist/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Monitors-Persist`);
}
