// Source/Test/Monitors-Engine/Test.ts - the M-series engine tests: the
// enrollment (watchlist-gated, the never-monitored negative), the
// classification (the most-specific glob wins, the catalog fallback), the
// debounce coalescing, the admission coalesce, the retirement, the overflow
// collapse and the per-glob opt-out. Every timing transition is a clock
// advance + a checkpoint; every ledger assertion is byte-exact.
import assert from "node:assert/strict";
import {
	AgentA,
	Check,
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
	Advance,
	MonitorConfig,
	ClockBox,
	WaveAssemble,
	live_monitor,
} from "../Harness.js";

/** A standard engine mount: the fake registry, the jobs and shell services,
 * and a wave-3 config on top of the defaults. */
const Setup = (Config: any = {}): { Jobs: any; Shell: any; Run: any } => {
	const Jobs = FakeJobsHub();
	const Shell = FakeShell();
	const Run = MakeWave(
		Validate({ logFile: Ledger, enabled: true, ...MonitorConfig(), ...Config }),
		{ jobs: Jobs, shell: Shell },
	);
	return { Jobs, Shell, Run };
};

/** The monitor stanza text of a wave-2 assembly. */
const StanzaOf = async (Run: any): Promise<string> => {
	const Assembly = await WaveAssemble(Run);
	const Section = Assembly.sections.find((S: any) => S.name === "live-containers");
	return Section === undefined ? "" : Section.text;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the enrollment through the fs/observed observer.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const { Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		const Entry = Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts");
		Check(Count, "E1: a watchlist-matching write enrolls the file with the entry's check sets", () => {
			assert.ok(Entry !== undefined);
			assert.deepEqual(Entry.sets, ["tsc", "format"]);
			assert.equal(Entry.lastVersion, "1");
			assert.equal(Entry.agentId, "agent-a");
		});
		Check(Count, "E1: the enrolled line is byte-exact", () => {
			assert.deepEqual(LinesWith(Run, "monitor enrolled"), [
				"hook-dsh-live-containers: monitor enrolled /repo/src/App.ts (by agent-a)",
			]);
		});
		Check(Count, "E1: the monitors on-state is proven by its own activation line", () => {
			assert.deepEqual(LinesWith(Run, "monitors enabled"), [
				"hook-dsh-live-containers: monitors enabled (1 watchlist entries)",
			]);
		});
	}

	// Group E2: the never-monitored negative.
	rm();
	{
		const { Run } = Setup();
		FireObserved(Run, "/repo/README.md", "1");
		Check(Count, "E2: a write to a non-watchlisted, non-enrolled file creates NO band", () => {
			assert.equal(Run.State.Monitors.get("agent-a")?.size ?? 0, 0);
			assert.deepEqual(LinesWith(Run, "monitor enrolled"), []);
		});
	}

	// Group E3: the classification.
	rm();
	{
		const { Run } = Setup({ watchlist: [] });
		await live_monitor(Run, AgentA, { path: "/repo/src/App.ts" });
		const Entry = Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts");
		Check(Count, "E3: the explicit path with an empty watchlist classifies from the catalog globs", () => {
			assert.ok(Entry !== undefined);
			assert.deepEqual(Entry.sets, ["tsc", "format"]);
		});
	}
	rm();
	{
		const { Run } = Setup({
			watchlist: [
				{ glob: "**/*.ts", checks: ["format"] },
				{ glob: "**/src/**", checks: ["tsc"] },
			],
		});
		FireObserved(Run, "/repo/src/App.ts", "1");
		Check(Count, "E3: the most-specific glob wins over the shorter match", () => {
			assert.deepEqual(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts")?.sets, ["tsc"]);
		});
	}
	rm();
	{
		const { Run } = Setup({
			watchlist: [
				{ glob: "**/*.ts", checks: ["tsc"] },
				{ glob: "**/*.ts", checks: ["format"] },
			],
		});
		FireObserved(Run, "/repo/src/App.ts", "1");
		Check(Count, "E3: tied globs fall to the later entry", () => {
			assert.deepEqual(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts")?.sets, ["format"]);
		});
	}

	// Group E4: the debounce coalescing.
	rm();
	{
		const { Jobs, Run } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] });
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(300);
		FireObserved(Run, "/repo/src/App.ts", "2");
		Advance(300);
		FireObserved(Run, "/repo/src/App.ts", "3");
		Check(Count, "E4: three edits within the window coalesce into ONE pending record", () => {
			const Entry = Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts");
			assert.equal(Entry?.pending.size, 1);
			assert.ok(Jobs.started.length === 0, "nothing dispatched inside the window");
		});
		Advance(1600);
		await StanzaOf(Run);
		Check(Count, "E4: the clock crossing the window dispatches exactly one job", () => {
			assert.equal(Jobs.started.length, 1);
			assert.deepEqual(LinesWith(Run, "monitor check dispatched"), [
				`hook-dsh-live-containers: monitor check dispatched /repo/src/App.ts tsc -> ${Jobs.started[0].id}`,
			]);
		});
	}

	// Group E5: the admission coalesce (coalesce-not-queue).
	rm();
	{
		const { Jobs, Run } = Setup({ monitor: { ...MonitorConfig().monitor, maxMonitorJobs: 1 } });
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(2000);
		await StanzaOf(Run);
		Check(Count, "E5: the first set dispatches, the second stays pending while the first is live", () => {
			assert.equal(Jobs.started.length, 1);
			const Entry = Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts");
			assert.ok(Entry?.pending.has("format"), "the second pending record stays");
		});
		FireJobs(Run, Jobs.settled(Jobs.started[0].id, { owner: "agent-a", detail: "exit code: 0" }));
		await StanzaOf(Run);
		Check(Count, "E5: the freed admission dispatches the second pending at the next checkpoint", () => {
			assert.equal(Jobs.started.length, 2);
		});
	}

	// Group E6: the retirement.
	rm();
	{
		const { Run } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] });
		FireObserved(Run, "/repo/src/App.ts", "1");
		Advance(600001);
		const Text = await StanzaOf(Run);
		Check(Count, "E6: past retireMs the closing line renders once", () => {
			assert.ok(
				Text.includes("--- MONITOR /repo/src/App.ts (retired; not touched for 600s) ---"),
				`missing the closing line in: ${Text.slice(0, 400)}`,
			);
		});
		Check(Count, "E6: the retired line is byte-exact in the ledger", () => {
			assert.deepEqual(LinesWith(Run, "monitor retired"), [
				"hook-dsh-live-containers: monitor retired /repo/src/App.ts",
			]);
		});
		const After = await StanzaOf(Run);
		Check(Count, "E6: the withdrawn band renders nothing on the next assembly", () => {
			assert.equal(After.includes("MONITORS (file checks"), false);
			assert.equal(Run.State.Monitors.get("agent-a")?.size ?? 0, 0);
		});
	}

	// Group E7: the overflow collapse.
	rm();
	{
		const { Run } = Setup({
			watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }],
			monitor: { ...MonitorConfig().monitor, maxMonitors: 1 },
		});
		FireObserved(Run, "/repo/src/Older.ts", "1");
		Advance(10);
		FireObserved(Run, "/repo/src/Newest.ts", "1");
		const Text = await StanzaOf(Run);
		Check(Count, "E7: the overflowed file renders the one-line collapsed form", () => {
			assert.ok(Text.includes("--- MONITOR /repo/src/Older.ts (collapsed, "), `missing in: ${Text.slice(0, 400)}`);
			assert.ok(Text.includes("bytes) ---"));
			assert.ok(Text.includes("monitors: 2 ("), `summary missing in: ${Text.slice(0, 200)}`);
		});
		Check(Count, "E7: the overflow ledger fires when the count changes", () => {
			assert.deepEqual(LinesWith(Run, "monitors overflow"), [
				"hook-dsh-live-containers: monitors overflow 1",
			]);
		});
	}

	// Group E8: the per-glob opt-out.
	rm();
	{
		const { Run } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] });
		FireObserved(Run, "/repo/src/App.ts", "1");
		await live_monitor(Run, AgentA, { off: "**/*.ts" });
		Check(Count, "E8: the opt-out retires the matches and logs the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "monitor off"), [
				"hook-dsh-live-containers: monitor off **/*.ts",
			]);
		});
		const Text = await StanzaOf(Run);
		Check(Count, "E8: the retired closing line renders at the next assembly", () => {
			assert.ok(Text.includes("(retired; not touched for"), `missing in: ${Text.slice(0, 300)}`);
		});
		FireObserved(Run, "/repo/src/App.ts", "2");
		Check(Count, "E8: a later write does NOT re-enroll an opted-out file", () => {
			assert.equal(Run.State.Monitors.get("agent-a")?.size ?? 0, 0);
		});
	}

	// Group: the volatile flips land without a remount.
	rm();
	{
		const { Run } = Setup({ monitors: "off" });
		FireObserved(Run, "/repo/src/App.ts", "1");
		Check(Count, "flips: with monitors off nothing enrolls (the IDLE-forever posture)", () => {
			assert.equal(Run.State.Monitors.get("agent-a")?.size ?? 0, 0);
		});
		FlipLive(Run, "monitors", "on");
		FireObserved(Run, "/repo/src/App.ts", "1");
		Check(Count, "flips: monitors off -> on enrolls without a remount", () => {
			assert.ok(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts") !== undefined);
		});
		FlipLive(Run, "watchlist", []);
		Advance(700000);
		await StanzaOf(Run);
		FlipLive(Run, "watchlist", [{ glob: "**/*.ts", checks: ["tsc"] }]);
		FireObserved(Run, "/repo/src/App.ts", "2");
		Check(Count, "flips: a watchlist entry change lands on the next observed event", () => {
			assert.ok(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts") !== undefined);
		});
	}
	return Finish(Count, "Monitors-Engine");
};

// Standalone entry: `node Target/Test/Monitors-Engine/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Monitors-Engine`);
}
