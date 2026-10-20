// Source/Test/Monitors-Jobs/Test.ts - the D-series runner tests: the
// dispatch through the SHIPPED G2 wrapper with the exact re-dispatch spec,
// the settle mapping (clean only from an observed exit 0 of the exact
// version), the problem tail, the head-keep capture, the killed and
// sandbox-denied mappings, the deadline kill, the fail-open paths and the
// teardown. Every ledger assertion is byte-exact.
import assert from "node:assert/strict";
import * as JobsModule from "../../../Target/Function/Jobs.js";
import {
	Advance,
	Check,
	ClockBox,
	Finish,
	FireJobs,
	FireObserved,
	FlipLive,
	LinesWith,
	MakeCounter,
	MakeWave,
	FakeJobsHub,
	FakeShell,
	Validate,
	Ledger,
	rm,
	MonitorConfig,
	WaveAssemble,
} from "../Harness.js";
import type { MonitorEntry } from "../../../Target/Interface/Events.js";

/** A standard jobs mount. */
const Setup = (Config: any = {}, BreakStart = false): { Jobs: any; Shell: any; Run: any } => {
	const Jobs = FakeJobsHub();
	if (BreakStart) {
		Jobs.registry = {
			...Jobs.registry,
			start: (Spec: any) => {
				void Spec;
				throw new Error("preflight refused");
			},
		};
	}
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

const Entry = (Run: any, Path = "/repo/src/App.ts"): MonitorEntry =>
	Run.State.Monitors.get("agent-a")?.get(Path) as MonitorEntry;

/** Enroll, cross the debounce window and run one assemble checkpoint. */
const Dispatch = async (Run: any, Path = "/repo/src/App.ts", Version = "1"): Promise<void> => {
	FireObserved(Run, Path, Version);
	Advance(2000);
	await WaveAssemble(Run);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group J1: the exact re-dispatch spec through the G2 wrapper.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const { Jobs, Shell, Run } = Setup();
		await Dispatch(Run);
		Check(Count, "J1: the monitor job carries the design's spec", () => {
			assert.equal(Jobs.started.length, 1);
			const Spec = Jobs.started[0].spec;
			assert.equal(Spec.kind, "monitor");
			assert.equal(Spec.label, "monitor tsc /repo/src/App.ts");
			assert.equal(Spec.owner, "agent-a");
			assert.equal(Spec.outputLimitBytes, 2048);
			assert.ok(Spec.toolCall.callId.startsWith("monitor-"));
		});
		Check(Count, "J1: the resolved shell spec preserves the governed path", () => {
			const Resolved = Shell.resolved[0];
			assert.equal(Resolved.command, "tsc --noEmit /repo/src/App.ts");
			assert.equal(Resolved.workdir, "/repo/src");
			assert.equal(Resolved.timeoutMs, 120000);
			assert.equal(Resolved.onExpiry, "none");
			assert.equal(Resolved.sandboxPolicy.mode, "workspace-write");
		});
		Check(Count, "J1: the dispatched line is byte-exact", () => {
			assert.deepEqual(LinesWith(Run, "monitor check dispatched"), [
				`hook-dsh-live-containers: monitor check dispatched /repo/src/App.ts tsc -> ${Jobs.started[0].id}`,
			]);
		});
	}

	// Group J2: the settle mapping - clean only for the exact version.
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", detail: "exit code: 0" }));
		Check(Count, "J2: an observed exit 0 folds a live clean result", () => {
			const Result = Entry(Run).checks[0];
			assert.ok(Result !== undefined);
			assert.equal(Result.exit, 0);
			assert.equal(Result.provenance, "live");
			assert.equal(Result.checkedVersion, "1");
		});
		Check(Count, "J2: the settled line is byte-exact", () => {
			assert.deepEqual(LinesWith(Run, "monitor check settled"), [
				`hook-dsh-live-containers: monitor check settled /repo/src/App.ts tsc (${JobId}, exit 0)`,
			]);
		});
	}

	// Group J3: the false-pass guard at the runner level.
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", detail: "exit code: 0" }));
		FireObserved(Run, "/repo/src/App.ts", "2");
		await WaveAssemble(Run);
		Check(Count, "J3: a settle-less version bump starts no re-run", () => {
			assert.equal(Jobs.started.length, 1, "no second job was started");
			assert.deepEqual(LinesWith(Run, "monitor check dispatched").length, 1);
		});
	}
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireObserved(Run, "/repo/src/App.ts", "2");
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", detail: "exit code: 0" }));
		const Text = await WaveAssemble(Run).then(
			(A: any) => A.sections.find((S: any) => S.name === "live-containers")?.text ?? "",
		);
		Check(Count, "J3: a settle for an older version renders the STALE form, never clean", () => {
			assert.ok(Text.includes("~ STALE (file changed after check)"), `missing in: ${Text.slice(0, 400)}`);
			assert.ok(!Text.includes("monitors: 1 (∄1"));
		});
	}

	// Group J4: the problem tail.
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		Run.State.MonitorJobs.get(JobId)?.tail.Append("stdout", "error TS2345: first\n");
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", detail: "exit code: 3" }));
		const Text = await WaveAssemble(Run).then(
			(A: any) => A.sections.find((S: any) => S.name === "live-containers")?.text ?? "",
		);
		Check(Count, "J4: a non-zero exit renders the problem with the captured head", () => {
			assert.ok(Text.includes("problem (!) | checked"), `missing in: ${Text.slice(0, 400)}`);
			assert.ok(Text.includes("tail (up to 2 KiB):\nerror TS2345: first"), `missing in: ${Text}`);
		});
		Check(Count, "J4: the settled line carries the non-zero exit", () => {
			assert.deepEqual(LinesWith(Run, "monitor check settled"), [
				`hook-dsh-live-containers: monitor check settled /repo/src/App.ts tsc (${JobId}, exit 3)`,
			]);
		});
	}

	// Group J5: the head-keep capture mode.
	rm();
	{
		const Head = new JobsModule.JobTail(true);
		Head.Append("stdout", "a".repeat(3000));
		Head.Append("stderr", "b".repeat(100));
		const Default = new JobsModule.JobTail();
		Default.Append("stdout", "c".repeat(3000));
		Default.Append("stderr", "d".repeat(100));
		Check(Count, "J5: the head-keep render keeps the earliest bytes; the default keeps the newest", () => {
			const HeadText = Head.Render();
			assert.ok(HeadText.length <= 2048);
			assert.ok(HeadText.startsWith("a"), "the head-keep render lost the earliest stdout bytes");
			assert.ok(!HeadText.includes("[stderr]"), "the head-keep render kept the tail over the head");
			const DefaultText = Default.Render();
			assert.ok(DefaultText.length <= 2048);
			assert.ok(DefaultText.includes("[stderr]"), "the default render must keep the newest stderr");
		});
	}

	// Group J6: the killed mapping.
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", status: "killed", detail: "signal: SIGTERM" }));
		Check(Count, "J6: a killed producer outcome maps to the infrastructure form", () => {
			assert.deepEqual(LinesWith(Run, "monitor check settled"), [
				`hook-dsh-live-containers: monitor check settled /repo/src/App.ts tsc (${JobId}, exit null)`,
			]);
			assert.equal(Entry(Run).checks[0]?.infra, "producer:signal: SIGTERM");
		});
	}

	// Group J7: the sandbox denial.
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireJobs(
			Run,
			Jobs.settled(JobId, {
				owner: "agent-a",
				status: "killed",
				detail: "[sandbox: file access denied under workspace-write mode]",
			}),
		);
		const Text = await WaveAssemble(Run).then(
			(A: any) => A.sections.find((S: any) => S.name === "live-containers")?.text ?? "",
		);
		Check(Count, "J7: a sandbox-denied check renders the denial, never a code problem", () => {
			assert.equal(Entry(Run).checks[0]?.infra, "sandbox");
			assert.ok(Text.includes("check denied (sandbox) (x) | checked"), `missing in: ${Text.slice(0, 400)}`);
			assert.ok(!Text.includes("problem (!)"));
		});
	}

	// Group J8: the deadline kill.
	rm();
	{
		const { Jobs, Run } = Setup({
			monitor: { ...MonitorConfig().monitor, checkTimeoutMs: 5000 },
		});
		await Dispatch(Run);
		Advance(6000);
		await WaveAssemble(Run);
		Check(Count, "J8: past checkTimeoutMs the registry receives the monitor-deadline kill", () => {
			assert.deepEqual(Jobs.killed, [
				{ id: Jobs.started[0].id, caller: "agent-a", reason: "monitor-deadline" },
			]);
		});
		FireJobs(Run, Jobs.settled(Jobs.started[0].id, { owner: "agent-a", cause: "kill", detail: "monitor-deadline" }));
		Check(Count, "J8: the deadline kill settles to the killed:monitor-deadline infra", () => {
			assert.equal(Entry(Run).checks[0]?.infra, "killed:monitor-deadline");
		});
	}

	// Group J9: the fail-open start paths.
	rm();
	{
		const { Run } = Setup({}, true);
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(2000);
		await WaveAssemble(Run);
		Check(Count, "J9: a start failure logs the byte-exact line and keeps the band honest", () => {
			assert.deepEqual(LinesWith(Run, "monitor check failed"), [
				"hook-dsh-live-containers: monitor check failed /repo/src/App.ts tsc (start)",
			]);
			assert.ok((Entry(Run)?.checks.length ?? 0) === 0);
		});
	}
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", detail: "exit code: 0" }));
		FireObserved(Run, "/repo/src/App.ts", "2");
		Run.State.Wave = {
			...Run.State.Wave,
			Jobs: {
				...(Run.State.Wave?.Jobs as any),
				start: () => {
					throw new Error("preflight refused");
				},
			},
		} as never;
		Advance(2000);
		const Text = await WaveAssemble(Run).then(
			(A: any) => A.sections.find((S: any) => S.name === "live-containers")?.text ?? "",
		);
		Check(Count, "J9: a later start failure keeps the last-known result and renders STALE", () => {
			assert.deepEqual(LinesWith(Run, "monitor check failed"), [
				"hook-dsh-live-containers: monitor check failed /repo/src/App.ts tsc (start)",
			]);
			assert.ok(
				Text.includes("~ STALE (file changed after check) | clean (∄)"),
				`missing in: ${Text.slice(0, 400)}`,
			);
		});
	}

	// Group J10: the teardown path.
	rm();
	{
		const { Jobs, Run } = Setup();
		await Dispatch(Run);
		const JobId = Jobs.started[0].id;
		FireJobs(Run, Jobs.settled(JobId, { owner: "agent-a", cause: "teardown" }));
		Check(Count, "J10: a teardown settle records nothing and logs the loss", () => {
			assert.deepEqual(LinesWith(Run, "monitor check lost"), [
				"hook-dsh-live-containers: monitor check lost /repo/src/App.ts tsc (teardown)",
			]);
			assert.ok((Entry(Run)?.checks.length ?? 0) === 0);
		});
	}

	// Group J11: the unknown check set at runtime (the volatile flip).
	rm();
	{
		const { Jobs, Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		FlipLive(Run, "checksets", {});
		Advance(2000);
		await WaveAssemble(Run);
		Check(Count, "J11: a flipped-away check set logs the unknown line and starts no job", () => {
			assert.deepEqual(LinesWith(Run, "monitor check unknown"), [
				"hook-dsh-live-containers: monitor check unknown tsc",
			]);
			assert.equal(Jobs.started.length, 0);
		});
	}

	// Group J12: the slow schedule.
	rm();
	{
		const { Jobs, Run } = Setup({
			watchlist: [{ glob: "**/Cargo.toml", checks: ["cargo"] }],
			monitor: { ...MonitorConfig().monitor, slowCheckIntervalMs: 1000 },
		});
		FireObserved(Run, "/repo/Cargo.toml", "1");
		await WaveAssemble(Run);
		Check(Count, "J12: the slow schedule dispatches once per interval at the assemble checkpoint", () => {
			assert.equal(Jobs.started.length, 1);
			assert.equal(Jobs.started[0].spec.label, "monitor cargo /repo/Cargo.toml");
		});
		await WaveAssemble(Run);
		Check(Count, "J12: within the interval no second job starts", () => {
			assert.equal(Jobs.started.length, 1);
		});
		Advance(1001);
		await WaveAssemble(Run);
		Check(Count, "J12: past the interval the next assemble dispatches again", () => {
			assert.equal(Jobs.started.length, 2);
		});
	}

	// Group J13: the fail-loud validation.
	rm();
	{
		let Message = "";
		try {
			Setup({ monitor: { ...MonitorConfig().monitor, checkTimeoutMs: 200000 } });
		} catch (Error) {
			Message = String((Error as Error).message);
		}
		Check(Count, "J13: checkTimeoutMs above the inline deadline fails loud at load", () => {
			assert.ok(
				Message.includes("monitor.checkTimeoutMs must be >= 1000 and <= 120000"),
				`wrong error: ${Message}`,
			);
		});
	}
	rm();
	{
		let Message = "";
		try {
			Setup({ watchlist: [{ glob: "**/*.ts", checks: ["ghost"] }] });
		} catch (Error) {
			Message = String((Error as Error).message);
		}
		Check(Count, "J13: a watchlist reference to an unknown check set fails loud at load", () => {
			assert.ok(
				Message.includes("watchlist references an unknown check set: ghost"),
				`wrong error: ${Message}`,
			);
		});
	}

	// Group J14: the per-check-set timeout cap.
	rm();
	{
		const { Jobs, Shell, Run } = Setup({
			checksets: {
				tsc: { glob: "**/*.ts", command: "tsc --noEmit {{path}}", fast: true, timeoutMs: 5000 },
			},
		});
		await Dispatch(Run);
		Check(Count, "J14: the set's own timeoutMs caps the dispatch deadline", () => {
			assert.equal(Jobs.started.length, 1);
			assert.equal(Shell.resolved[0].timeoutMs, 5000);
		});
	}

	// Group J15: the deep check bypasses the debounce.
	rm();
	{
		const { Jobs, Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		const Tool = (Run as any).tools["live_monitor_check"];
		const Result = await Tool.execute({ path: "/repo/src/App.ts" }, { agent: { id: "agent-a" } });
		Check(Count, "J15: the deep check dispatches immediately without crossing the window", () => {
			assert.equal(Jobs.started.length, 1);
			assert.equal((Result as any).started, true);
		});
	}
	return Finish(Count, "Monitors-Jobs");
};

// Standalone entry: `node Target/Test/Monitors-Jobs/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Monitors-Jobs`);
}
