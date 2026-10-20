// Source/Test/Boards-And-Plants/Test.ts - the B-series tests: the planted
// boards (CAN-2) and the I5 lease - the five-row board, the [live-report]
// splice pickup, the stalled row, the failed row, the overflow, the lease
// expiry with the byte-exact [stale] declaration, the report reset, the
// coalescing, the close + withdrawal, the orphan STALE header, and the
// per-agent scoping.
import assert from "node:assert/strict";
import {
	AgentA,
	Advance,
	Check,
	ClockBox,
	Finish,
	FireJobs,
	FireSession,
	LinesWith,
	MakeCounter,
	MakeWave,
	WaveAssemble,
	Validate,
	Ledger,
	rm,
	live_plant,
	FakeJobsHub,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the board opens with the exact rows.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 5, memberIds: ["worker-1", "worker-2"] });
		const Out = await WaveAssemble(Run);
		const Text = Out.sections.at(-1).text;
		Check(Count, "B: plant opened + member enrolled ledger (byte-exact)", () => {
			assert.deepEqual(LinesWith(Run, "plant opened"), ["hook-dsh-live-containers: plant opened warp (expect 5)"]);
			assert.deepEqual(LinesWith(Run, "member enrolled warp"), [
				"hook-dsh-live-containers: member enrolled warp worker-1",
				"hook-dsh-live-containers: member enrolled warp worker-2",
			]);
		});
		Check(Count, "B: the five-row board renders the exact frame bytes", () => {
			assert.ok(Text.includes("--- LIVE PLANT warp (agent-board; expect 5) ---"));
			assert.ok(Text.includes("[running]   worker-1 - working"));
			assert.ok(Text.includes("[running]   worker-2 - working"));
			assert.ok(Text.includes("[none]      slot-3 - no agent enrolled"));
			assert.ok(Text.includes("[none]      slot-4 - no agent enrolled"));
			assert.ok(Text.includes("[none]      slot-5 - no agent enrolled"));
			assert.ok(Text.includes("total: 0 done / 2 running / 0 stale / 3 empty"));
			assert.ok(Text.includes("--- END LIVE PLANT warp ---"));
		});
	}
	// Group: the [live-report] splice pickup (G5, no parent tool call).
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 2, memberIds: ["worker-1"] });
		await WaveAssemble(Run);
		FireSession(Run, {
			type: "agent/inbox/spliced",
			data: { target: AgentA.id, start: 0, inserted: [{ content: [{ type: "text", text: '[live-report] warp worker-1 running editing Apply.ts' }] }] },
		});
		const Out = await WaveAssemble(Run);
		const Text = Out.sections.at(-1).text;
		Check(Count, "B: the report folds into the row at the next assembly", () => {
			assert.ok(Text.includes('[running]   worker-1 - working (last: "editing Apply.ts" 0s ago)'));
		});
		Check(Count, "B: the report ledger (byte-exact)", () => {
			assert.ok(LinesWith(Run, "report warp worker-1 (").length >= 1);
		});
	}
	// Group: the lease expiry (I5 A1) - 3 parent turns of silence.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		await WaveAssemble(Run); // turn 1
		await WaveAssemble(Run); // turn 2
		const Out = await WaveAssemble(Run); // turn 3
		let Text = Out.sections.at(-1).text;
		Check(Count, "B: the third silent turn has not expired the lease yet", () => {
			assert.ok(!Text.includes("[stale]"));
			assert.ok(Text.includes("total: 0 done / 1 running / 0 stale / 0 empty"));
		});
		const Out4 = await WaveAssemble(Run); // turn 4
		Text = Out4.sections.at(-1).text;
		Check(Count, "B: the fourth turn renders the byte-exact [stale] row (declared once)", () => {
			assert.ok(Text.includes("[stale]     worker-1 - unreported for 3 parent turns; re-dispatch or mark failed"));
			assert.ok(Text.includes("total: 0 done / 0 running / 1 stale / 0 empty"));
			assert.deepEqual(LinesWith(Run, "lease expired"), [
				"hook-dsh-live-containers: lease expired warp worker-1 (after 3 turns)",
			]);
		});
		const Out5 = await WaveAssemble(Run);
		Check(Count, "B: the declaration is emitted once (no per-turn nag)", () => {
			assert.ok(Out5.sections.at(-1).text.includes("[stale]"));
			assert.equal(LinesWith(Run, "lease expired").length, 1);
		});
	}
	// Group: a report folded every turn never expires the lease (I5 A2).
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		await WaveAssemble(Run);
		await WaveAssemble(Run);
		// A report folded before every subsequent assemble resets the window;
		// the member never expires no matter how many turns pass.
		for (let Index = 0; Index < 5; Index += 1) {
			Advance(1000);
			FireSession(Run, {
				type: "agent/inbox/spliced",
				data: { target: AgentA.id, start: 0, inserted: [{ content: [{ type: "text", text: "[live-report] warp worker-1 running still going" }] }] },
			});
			await WaveAssemble(Run);
		}
		const Out = await WaveAssemble(Run);
		Check(Count, "B: a report folded every turn never expires the lease", () => {
			assert.ok(!Out.sections.at(-1).text.includes("[stale]"));
			assert.equal(LinesWith(Run, "lease expired").length, 0);
		});
	}
	// Group: the coalescing window (I5 6.1).
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		FireSession(Run, {
			type: "agent/inbox/spliced",
			data: { target: AgentA.id, start: 0, inserted: [{ content: [{ type: "text", text: "[live-report] warp worker-1 running first" }] }] },
		});
		FireSession(Run, {
			type: "agent/inbox/spliced",
			data: { target: AgentA.id, start: 0, inserted: [{ content: [{ type: "text", text: "[live-report] warp worker-1 running second" }] }] },
		});
		const Out = await WaveAssemble(Run);
		Check(Count, "B: two reports in one coalescing window show the newest payload, count once", () => {
			assert.ok(Out.sections.at(-1).text.includes('[running]   worker-1 - working (last: "second" 0s ago)'));
			assert.equal(LinesWith(Run, "report warp worker-1 (").length, 2);
		});
	}
	// Group: the failed row from a kill-caused settlement (L6 carrier).
	rm();
	{
		const Jobs = FakeJobsHub();
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: Jobs });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		FireJobs(Run, {
			type: "settled",
			job: { id: "bash-deadbeef", kind: "bash", label: "worker-1", owner: "worker-1", status: "killed", detail: "signal: 15; user kill", startedAt: 0, output: { total: 0, earliest: 0 } },
			cause: "kill",
			awaited: false,
		});
		const Out = await WaveAssemble(Run);
		Check(Count, "B: a killed child renders the byte-exact [failed] row", () => {
			assert.ok(Out.sections.at(-1).text.includes("[failed]    worker-1 - signal: 15; user kill"));
		});
	}
	// Group: the overflow rows and the per-agent scoping.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1", "worker-2"] });
		const Out = await WaveAssemble(Run);
		Check(Count, "B: the overflow member renders [unboarded] and holds no lease", () => {
			assert.ok(Out.sections.at(-1).text.includes("[unboarded] worker-2 - overflow"));
			assert.ok(Out.sections.at(-1).text.includes("total: 0 done / 1 running / 0 stale / 0 empty"));
		});
	}
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		const AgentB = { id: "agent-b" };
		await live_plant(Run, AgentA, { id: "shared", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		await live_plant(Run, AgentB, { id: "shared", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-9"] });
		const OutA = await WaveAssemble(Run, AgentA);
		const OutB = await WaveAssemble(Run, AgentB);
		Check(Count, "B: multi-level - two agents hold identically named boards separately", () => {
			assert.ok(OutA.sections.at(-1).text.includes("worker-1"));
			assert.ok(!OutA.sections.at(-1).text.includes("worker-9"));
			assert.ok(OutB.sections.at(-1).text.includes("worker-9"));
		});
	}
	// Group: the board close + withdrawal (I5 7.2).
	rm();
	{
		const Jobs = FakeJobsHub();
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: Jobs });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 2, memberIds: ["worker-1", "worker-2"] });
		FireJobs(Run, {
			type: "settled",
			job: { id: "bash-a", kind: "bash", label: "w-1", owner: "worker-1", status: "completed", detail: "exit code: 0", startedAt: 0, output: { total: 0, earliest: 0 } },
			cause: "producer",
			awaited: false,
		});
		FireJobs(Run, {
			type: "settled",
			job: { id: "bash-b", kind: "bash", label: "w-2", owner: "worker-2", status: "completed", detail: "exit code: 0", startedAt: 0, output: { total: 0, earliest: 0 } },
			cause: "producer",
			awaited: false,
		});
		Advance(300001);
		const Out = await WaveAssemble(Run);
		Check(Count, "B: the closeMs rule closes the board with the byte-exact closing line", () => {
			assert.ok(Out.sections.at(-1).text.includes("board closed: 2/2 done in 300s"));
			assert.deepEqual(LinesWith(Run, "board closed"), ["hook-dsh-live-containers: board closed warp (2/2 in 300s)"]);
		});
		const Out2 = await WaveAssemble(Run);
		Check(Count, "B: the closing line rendered one request, then the board withdrew", () => {
			assert.ok(!Out2.sections.at(-1).text.includes("board closed"));
		});
	}
	// Group: the orphan STALE header (I5 2.4 / D2 scenario 6).
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "warp", plantType: "agent-board", expectAgents: 1, memberIds: ["worker-1"] });
		await WaveAssemble(Run);
		Advance(700000);
		const Out = await WaveAssemble(Run);
		Check(Count, "B: the orphan board declares the byte-exact STALE header on return", () => {
			assert.ok(Out.sections.at(-1).text.includes("--- LIVE PLANT warp (agent-board; expect 1; status: STALE - no parent requests for 700s) ---"));
		});
	}
	// Group: the todo-fill variant.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "todo", plantType: "todo-fill", expectAgents: 2 });
		FireSession(Run, {
			type: "agent/inbox/spliced",
			data: { target: AgentA.id, start: 0, inserted: [{ content: [{ type: "text", text: "[live-report] todo worker-1 todo 1 done" }] }] },
		});
		const Out = await WaveAssemble(Run);
		Check(Count, "B: the todo-fill rows fill from the todo report grammar", () => {
			assert.ok(Out.sections.at(-1).text.includes("[x] item-1 - by worker-1 (0s)"));
			assert.ok(Out.sections.at(-1).text.includes("[ ] item-2"));
		});
	}
	// Group: the aggregate variant.
	rm();
	{
		const Run = MakeWave(Validate({ logFile: Ledger, enabled: true }), { jobs: FakeJobsHub() });
		await live_plant(Run, AgentA, { id: "agg", plantType: "aggregate", expectAgents: 2, memberIds: ["worker-1"] });
		FireSession(Run, {
			type: "agent/inbox/spliced",
			data: { target: AgentA.id, start: 0, inserted: [{ content: [{ type: "text", text: "[live-report] agg worker-1 running files changed: 17" }] }] },
		});
		const Out = await WaveAssemble(Run);
		Check(Count, "B: the aggregate board renders the folded computed line", () => {
			assert.ok(Out.sections.at(-1).text.includes("worker-1: files changed: 17"));
		});
	}
	return Finish(Count, "Boards-And-Plants");
};

// Standalone entry: `node Target/Test/Boards-And-Plants/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Boards-And-Plants`);
}
