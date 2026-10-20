// Source/Test/Failsafes-Engine/Test.ts - the F-series tests: the hang
// detector and its kill gate, the meta-budget, the retry loop, the drift
// guard, the wave-2 section collapse, and the failsafes-off posture.
import assert from "node:assert/strict";
import {
	AgentA,
	Advance,
	Check,
	ClockBox,
	Execute,
	Exec,
	Finish,
	LinesWith,
	MakeCounter,
	MakeWave,
	Pre,
	WaveAssemble,
	live_plant,
	Validate,
	Ledger,
	rm,
	FakeJobsHub as FakeJobs,
	FakeShell,
} from "../Harness.js";

const DetachConfig = {
	mode: "long-running",
	allRequiresConfirm: false,
	longRunningMarkers: ["cargo build"],
	minHistoricalMs: 20000,
	historyWindow: 5,
	selectedTools: [],
	selectedPatterns: [],
	maxLivePerAgent: 5,
	minLatencyMs: 2000,
	liveTimeoutMs: 600000,
	dedup: true,
	retryFailsafeCount: 3,
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group F1: the hang detector.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Jobs = FakeJobs();
		const Shell = FakeShell();
		const Run = MakeWave(
			Validate({
				logFile: Ledger,
				enabled: true,
				failsafes: "on",
				hangBudgetMs: 5000,
				hangAction: "warn-only",
				detach: DetachConfig,
			}),
			{ jobs: Jobs, shell: Shell },
		);
		await Pre(Run, Exec("cargo build"));
		await WaveAssemble(Run); // seeds the hang watch at the current clock
		const JobId = Jobs.started[0].id;
		Advance(6000);
		await WaveAssemble(Run);
		Check(Count, "F1: zero output past hangBudgetMs logs the byte-exact line (warn-only: no kill)", () => {
			assert.deepEqual(LinesWith(Run, "failsafe hang"), [
				`hook-dsh-live-containers: failsafe hang ${JobId} (6s no output)`,
			]);
			assert.equal(Jobs.killed.length, 0);
		});
	}
	rm();
	{
		const Jobs = FakeJobs();
		const Run = MakeWave(
			Validate({
				logFile: Ledger,
				enabled: true,
				failsafes: "on",
				hangBudgetMs: 5000,
				hangAction: "kill",
				detach: DetachConfig,
			}),
			{ jobs: Jobs, shell: FakeShell() },
		);
		await Pre(Run, Exec("cargo build"));
		await WaveAssemble(Run); // seeds the hang watch
		Advance(6000);
		await WaveAssemble(Run);
		Check(Count, "F1: hangAction kill goes through the registry with reason live-hang", () => {
			assert.deepEqual(Jobs.killed, [{ id: Jobs.started[0].id, caller: "agent-a", reason: "live-hang" }]);
		});
	}
	// Group F2: the meta-budget.
	rm();
	{
		const Jobs = FakeJobs();
		const Run = MakeWave(
			Validate({
				logFile: Ledger,
				enabled: true,
				failsafes: "on",
				failsafesPerTurn: 1,
				detach: DetachConfig,
			}),
			{ jobs: Jobs, shell: FakeShell() },
		);
		await WaveAssemble(Run); // establish turn 1
		const First = Exec("cargo build");
		const Second = Exec("cargo build --release");
		await Pre(Run, First);
		await Pre(Run, Second);
		Check(Count, "F2: the second detach of the turn passes through with the meta-budget line", () => {
			assert.equal(Jobs.started.length, 1);
			assert.deepEqual(LinesWith(Run, "failsafe meta-budget"), [
				"hook-dsh-live-containers: failsafe meta-budget (1)",
			]);
		});
		await WaveAssemble(Run); // turn 2 re-arms
		await Pre(Run, Exec("cargo build --bin x"));
		Check(Count, "F2: the next turn re-arms the budget (the transform works again)", () => {
			assert.equal(Jobs.started.length, 2);
		});
	}
	// Group F3: the retry loop (failsafes on).
	rm();
	{
		const Jobs = FakeJobs();
		const Run = MakeWave(
			Validate({
				logFile: Ledger,
				enabled: true,
				failsafes: "on",
				detach: { ...DetachConfig, retryFailsafeCount: 3 },
			}),
			{ jobs: Jobs, shell: FakeShell() },
		);
		await Pre(Run, Exec("cargo build"));
		await Pre(Run, Exec("cargo build"));
		await Pre(Run, Exec("cargo build"));
		const Tagged = Exec("cargo build");
		await Pre(Run, Tagged);
		const Result = await Execute(Run, Tagged, async () => ({ isError: false, value: {}, content: [] }));
		Check(Count, "F3: the 4th dedup hit extends the marker (byte-exact) and logs the loop", () => {
			const Text = (Result as any).value.stdout.text;
			const JobId = Jobs.started[0].id;
			assert.ok(Text.includes(`[live] already running as ${JobId} (3rd attempt) - use job_output.`));
			assert.deepEqual(LinesWith(Run, "failsafe retry-loop"), [
				"hook-dsh-live-containers: failsafe retry-loop cargo build",
			]);
		});
	}
	// Group F4: the drift guard.
	rm();
	{
		const Run = MakeWave(
			Validate({ logFile: Ledger, enabled: true, failsafes: "on" }),
			{ jobs: FakeJobs() },
		);
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		for (let Index = 0; Index < 220; Index += 1) {
			Run.Listeners["agent/pre-step"](
				{ agent: AgentA, messages: [{ source: { kind: "user" } }] },
				async () => ({}),
			);
		}
		const Out = await WaveAssemble(Run);
		Check(Count, "F4: the drift guard renders the WARN line inside the section", () => {
			assert.ok(Out.sections.at(-1).text.includes("WARN: messages=220 exceeds 200 while a live board is open"));
			assert.deepEqual(LinesWith(Run, "failsafe drift"), [
				"hook-dsh-live-containers: failsafe drift (messages)",
			]);
		});
	}
	// Group F5: the wave-2 section collapse.
	rm();
	{
		const Run = MakeWave(
			Validate({
				logFile: Ledger,
				enabled: true,
				sectionBudgetBytes: 100,
				blocks: [],
			}),
			{ jobs: FakeJobs() },
		);
		await live_plant(Run, AgentA, { id: "first-board-long-name", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		await live_plant(Run, AgentA, { id: "second-board-long-name", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-2"] });
		const Out = await WaveAssemble(Run);
		Check(Count, "F5: the wave-2 parts collapse oldest-first with the ledger line", () => {
			const Text = Out.sections.at(-1).text;
			assert.ok(Text.includes("LIVE (collapsed,"));
			assert.ok(Text.includes("second-board-long-name"));
			assert.ok(LinesWith(Run, "failsafe section-collapse").length >= 1);
		});
	}
	// Group F6: the failsafes-off posture.
	rm();
	{
		const Jobs = FakeJobs();
		const Run = MakeWave(
			Validate({
				logFile: Ledger,
				enabled: true,
				failsafes: "off",
				hangBudgetMs: 5000,
				hangAction: "kill",
				failsafesPerTurn: 1,
				detach: DetachConfig,
			}),
			{ jobs: Jobs, shell: FakeShell() },
		);
		await WaveAssemble(Run);
		await Pre(Run, Exec("cargo build"));
		await Pre(Run, Exec("cargo build --release"));
		Advance(6000);
		await WaveAssemble(Run);
		Check(Count, "F6: with failsafes off, no hang kill and no meta-budget enforcement", () => {
			assert.equal(Jobs.started.length, 2);
			assert.equal(Jobs.killed.length, 0);
			assert.deepEqual(LinesWith(Run, "failsafe hang"), []);
			assert.deepEqual(LinesWith(Run, "failsafe meta-budget"), []);
		});
		Check(Count, "F6: the channel-1 scenarios produce NO model-visible artifact", () => {
			assert.equal(LinesWith(Run, "failsafe hang").length, 0);
			assert.equal(LinesWith(Run, "failsafe meta-budget").length, 0);
			assert.equal(LinesWith(Run, "failsafe drift").length, 0);
			assert.equal(LinesWith(Run, "failsafe retry-loop").length, 0);
			assert.equal(LinesWith(Run, "failsafe section-collapse").length, 0);
			assert.equal(LinesWith(Run, "failsafe stall").length, 0);
		});
	}
	// Group F6b: the retry loop with failsafes off stays plain.
	rm();
	{
		const Jobs = FakeJobs();
		const Run = MakeWave(
			Validate({ logFile: Ledger, enabled: true, failsafes: "off", detach: DetachConfig }),
			{ jobs: Jobs, shell: FakeShell() },
		);
		await Pre(Run, Exec("cargo build"));
		await Pre(Run, Exec("cargo build"));
		await Pre(Run, Exec("cargo build"));
		const Tagged = Exec("cargo build");
		await Pre(Run, Tagged);
		const Result = await Execute(Run, Tagged, async () => ({ isError: false, value: {}, content: [] }));
		Check(Count, "F6: failsafes off - no retry-loop line and no marker extension", () => {
			const Text = (Result as any).value.stdout.text;
			assert.ok(!Text.includes("(3rd attempt)"));
			assert.deepEqual(LinesWith(Run, "failsafe retry-loop"), []);
		});
	}
	return Finish(Count, "Failsafes-Engine");
};

// Standalone entry: `node Target/Test/Failsafes-Engine/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Failsafes-Engine`);
}
