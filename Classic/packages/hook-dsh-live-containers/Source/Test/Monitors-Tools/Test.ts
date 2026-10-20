// Source/Test/Monitors-Tools/Test.ts - the tool surface tests: live_monitor
// (enroll with the effective classification, the per-glob opt-out, the list,
// the parent-into-child target agent) and live_monitor_check (the deep path,
// the output text with the job id, the admission-full pending form).
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	FireObserved,
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
	live_monitor,
	CallTool,
	WaveAssemble,
} from "../Harness.js";

/** A standard tools mount. */
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

/** The rendered text of a tool result. */
const Rendered = (Run: any, Name: string, Value: any): string =>
	(Run.tools[Name].output.render as (args: unknown, value: unknown) => { text: string }[])(null, Value)[0]!.text;

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group T1: the enrollment.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const { Run } = Setup({ watchlist: [] });
		const Value = await live_monitor(Run, { id: "agent-a" }, { path: "/repo/src/App.ts" });
		Check(Count, "T1: the explicit enrollment classifies from the catalog and logs byte-exact", () => {
			assert.equal((Value as any).action, "enrolled");
			assert.deepEqual((Value as any).count, 2);
			assert.deepEqual(LinesWith(Run, "monitor enrolled"), [
				"hook-dsh-live-containers: monitor enrolled /repo/src/App.ts (by agent-a)",
			]);
		});
		Check(Count, "T1: the rendered text is byte-exact", () => {
			assert.equal(
				Rendered(Run, "live_monitor", Value),
				"monitored /repo/src/App.ts (2 checks) - the band renders in the live section.",
			);
		});
	}

	// Group T2: the parent-into-child target agent.
	rm();
	{
		const { Run } = Setup({ watchlist: [] });
		await live_monitor(Run, { id: "agent-a" }, { path: "/repo/src/App.ts", agent: "child-1" });
		Check(Count, "T2: the enrollment lands in the named session's monitor set", () => {
			assert.ok(Run.State.Monitors.get("child-1")?.get("/repo/src/App.ts") !== undefined);
			assert.equal(Run.State.Monitors.get("agent-a")?.size ?? 0, 0);
			assert.deepEqual(LinesWith(Run, "monitor enrolled"), [
				"hook-dsh-live-containers: monitor enrolled /repo/src/App.ts (by agent-a)",
			]);
		});
	}

	// Group T3: the opt-out.
	rm();
	{
		const { Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		FireObserved(Run, "/repo/src/Other.ts", "1");
		const Value = await live_monitor(Run, { id: "agent-a" }, { off: "**/*.ts" });
		Check(Count, "T3: the opt-out retires both matches and logs the byte-exact line", () => {
			assert.equal((Value as any).count, 2);
			assert.deepEqual(LinesWith(Run, "monitor off"), [
				"hook-dsh-live-containers: monitor off **/*.ts",
			]);
			assert.deepEqual(Run.State.MonitorOptOuts.get("agent-a"), ["**/*.ts"]);
		});
		await WaveAssemble(Run);
		Check(Count, "T3: the closing lines render at the next assembly", () => {
			assert.equal(LinesWith(Run, "monitor retired").length, 2);
		});
	}

	// Group T4: the list.
	rm();
	{
		const { Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		const Value = await live_monitor(Run, { id: "agent-a" }, { list: true });
		Check(Count, "T4: the list renders the enrolled files with their primary outcomes", () => {
			const Lines = (Value as any).lines as string[];
			assert.equal(Lines.length, 1);
			assert.ok(Lines[0]?.startsWith("/repo/src/App.ts - not run yet ("));
		});
	}

	// Group T5: the deep check.
	rm();
	{
		const { Jobs, Run } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc", "format"] }] });
		FireObserved(Run, "/repo/src/App.ts", "1");
		const Value = await CallTool(Run, "live_monitor_check", { path: "/repo/src/App.ts" });
		Check(Count, "T5: the deep check starts one job per set and reports the job ids", () => {
			assert.equal((Value as any).started, true);
			assert.equal(Jobs.started.length, 2);
			assert.deepEqual((Value as any).jobs, Jobs.started.map((S: any) => S.id));
		});
		Check(Count, "T5: the rendered text is byte-exact", () => {
			const Ids = Jobs.started.map((S: any) => S.id).join(", ");
			assert.equal(
				Rendered(Run, "live_monitor_check", Value),
				`[monitor] deep check started /repo/src/App.ts (2 checks) - job_output ${Ids} for the full tail.`,
			);
		});
	}

	// Group T6: the deep check pending form.
	rm();
	{
		const { Jobs, Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		// Fill the admission: a fake live monitor job.
		Run.State.MonitorJobs.set("fake-1", {
			agentId: "agent-a",
			path: "/repo/src/Other.ts",
			pathKey: "/repo/src/Other.ts",
			setId: "tsc",
			startedAt: ClockBox.Now,
			checkedVersion: "1",
			writer: "agent-a",
			tail: { Render: () => "" },
		});
		Run.State.MonitorJobs.set("fake-2", { ...Run.State.MonitorJobs.get("fake-1"), path: "/x" });
		Run.State.MonitorJobs.set("fake-3", { ...Run.State.MonitorJobs.get("fake-1"), path: "/y" });
		const Value = await CallTool(Run, "live_monitor_check", { path: "/repo/src/App.ts" });
		Check(Count, "T6: at full admission the deep check coalesces and answers the pending form", () => {
			assert.equal(Jobs.started.length, 0);
			assert.equal((Value as any).started, false);
			assert.equal((Value as any).count, 1);
			assert.ok(Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts")?.pending.has("tsc"));
		});
		Check(Count, "T6: the pending rendered text is byte-exact", () => {
			assert.equal(
				Rendered(Run, "live_monitor_check", Value),
				"[monitor] deep check pending /repo/src/App.ts (1 checks) - admission full; the band updates when it runs.",
			);
		});
	}

	// Group T7: the deep check bypasses a pending debounce.
	rm();
	{
		const { Jobs, Run } = Setup();
		FireObserved(Run, "/repo/src/App.ts", "1");
		// No clock advance: the debounce window has not elapsed.
		const Value = await CallTool(Run, "live_monitor_check", { path: "/repo/src/App.ts" });
		Check(Count, "T7: the deep check dispatches despite the unelapsed window", () => {
			assert.equal((Value as any).started, true);
			assert.equal(Jobs.started.length, 1);
		});
		Advance(600000);
		await WaveAssemble(Run);
	}
	return Finish(Count, "Monitors-Tools");
};

// Standalone entry: `node Target/Test/Monitors-Tools/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Monitors-Tools`);
}
