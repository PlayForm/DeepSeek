// Source/Test/Observers-And-Waterfalls/Test.ts - the observers and the
// waterfalls: the fs/observed stale-halt observer (synchronous cell flipper
// with the govern marker skip and the silence invariant), the advisory bash
// intercept and the pre-step pass-through waterfalls (next() first, the
// downstream decision returned unchanged), the deadline overflow with the
// jobs hub and its typed jobId handle (and the halted degradation without
// one), and the presentation purity.
import assert from "node:assert/strict";
import * as Present from "../../../Target/Function/Present.js";
import {
	Check,
	CheckAsync,
	Exec,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount over the given file fixture. */
const Setup = (
	Files: Record<string, string>,
	Raw: Record<string, unknown> = {},
	Attach?: (Context: any, Run: any) => void,
): any => {
	rm();
	return Make(Validate({ ...Raw, enabled: true, logFile: Ledger }), Files, Attach);
};

/** Open a machine holding the given files with one replace op. */
const Open = async (Run: any, With: string, Search = "one"): Promise<any> =>
	Run.Tool.execute(
		{
			action: "open",
			files: Object.keys(Run.Fs.files),
			searches: [`s=${Search}`],
			ops: [`file=* search=s op=replace with=${With}`],
		},
		Exec(),
	);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group O1: the fs/observed stale-halt observer.
	{
		const Run = Setup({ "a.txt": "one\n" });
		await Open(Run, "UNO");
		Check(Count, "O1: an external touch with a moved version flips the cell to halted stale, byte-exactly", () => {
			Run.RootListeners["fs/observed"](
				{ displayPath: "a.txt", targetKey: "key:a.txt" },
				{ kind: "present", version: "v9" },
				{ agent: { id: "agent-b" } },
			);
			const Cell = Run.State.Machines.get("agent-a").get("mach-1").files.get("a.txt");
			assert.equal(Cell.status, "halted");
			assert.equal(Cell.haltReason, "stale");
			assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition halted a.txt stale"));
		});
		Check(Count, "O1: the observer skips our own govern-marked writes and unchanged versions in silence", () => {
			const Before = Run.Lines.length;
			Run.RootListeners["fs/observed"](
				{ displayPath: "a.txt", targetKey: "key:a.txt" },
				{ kind: "present", version: "v9" },
				{ govern: true, agent: { id: "agent-a" } },
			);
			Run.RootListeners["fs/observed"](
				{ displayPath: "a.txt", targetKey: "key:a.txt" },
				{ kind: "present", version: "v1" },
				{ agent: { id: "agent-b" } },
			);
			Run.RootListeners["fs/observed"](
				{ displayPath: "elsewhere.txt", targetKey: "key:elsewhere.txt" },
				{ kind: "present", version: "v2" },
				{ agent: { id: "agent-b" } },
			);
			assert.equal(Run.Lines.length, Before);
		});
		Check(Count, "O1: the observer is a pure cell flipper - zero additional fs calls, and the presentation is stable", () => {
			const Before = {
				resolves: Run.Fs.resolves.length,
				stats: Run.Fs.stats.length,
				reads: Run.Fs.reads.length,
				writes: Run.Fs.writes.length,
			};
			Run.RootListeners["fs/observed"](
				{ displayPath: "a.txt", targetKey: "key:a.txt" },
				{ kind: "present", version: "v9" },
				{ agent: { id: "agent-b" } },
			);
			assert.equal(Run.Fs.resolves.length, Before.resolves);
			assert.equal(Run.Fs.stats.length, Before.stats);
			assert.equal(Run.Fs.reads.length, Before.reads);
			assert.equal(Run.Fs.writes.length, Before.writes);
			const Machine = Run.State.Machines.get("agent-a")?.get("mach-1");
			// Two assemblies of the same idle machine are byte-identical - the
			// silence invariant as a property of the renderer.
			assert.equal(
				JSON.stringify(Present.Cells(Machine)),
				JSON.stringify(Present.Cells(Machine)),
			);
		});
	}

	// Group O2: the advisory bash intercept.
	{
		const Run = Setup({ "a.txt": "one\n" }, { interceptBash: true });
		await Open(Run, "UNO");
		await CheckAsync(Count, "O2: a bash command mentioning a held file gets the advisory offer and the byte-exact line", async () => {
			const Next = async () => ({ kind: "allow" as const });
			const Exec_: any = { name: "bash", args: { command: "cat a.txt" }, agent: { id: "agent-a" } };
			const Decision = await Run.CtxListeners["tools/pre-execute"](Exec_, Next);
			assert.deepEqual(Decision, { kind: "allow" });
			assert.equal(
				Exec_.batchEditOffer,
				"batch_edit advisory: your bash call touches held file(s) a.txt - consider action=commit on the open machine (advisory only, nothing was denied)",
			);
			assert.ok(
				Run.Lines.includes("plugin-dsh-batch-edit: advisory intercept bash on a held file"),
			);
		});
		await CheckAsync(Count, "O2: an unrelated command passes through untouched", async () => {
			const Before = Run.Lines.length;
			const Exec_: any = { name: "bash", args: { command: "ls /tmp" }, agent: { id: "agent-a" } };
			await Run.CtxListeners["tools/pre-execute"](Exec_, async () => ({ kind: "allow" }));
			assert.equal(Exec_.batchEditOffer, undefined);
			assert.equal(Run.Lines.length, Before);
		});
	}

	// Group O3: the pre-step waterfall.
	{
		const Run = Setup({ "a.txt": "one\n" });
		await CheckAsync(Count, "O3: the pre-step listener awaits next() first and passes the decision through unchanged", async () => {
			const Decision = { kind: "continue" };
			const Out = await Run.CtxListeners["agent/pre-step"]({ agent: { id: "agent-a" } }, async () => Decision);
			assert.equal(Out, Decision);
			assert.equal(Run.Warns.length, 0);
		});
	}

	// Group O4: the deadline overflow and the jobs hub.
	{
		const Jobs: { specs: any[] } = { specs: [] };
		const Run = Setup(
			{ "1.txt": "one\n", "2.txt": "one\n", "3.txt": "one\n" },
			{ deadlineMs: 1000 },
			(Context: any, R: any) => {
				R.Services["jobs"] = {
					start: (Spec: any) => {
						Jobs.specs.push(Spec);
						return "job-9";
					},
				};
				void Context;
			},
		);
		await Open(Run, "UNO");
		await CheckAsync(Count, "O4: the deadline overflow continues the remainder as ONE background job with the typed jobId", async () => {
			const RealNow = Date.now;
			let Calls = 0;
			Date.now = () => (Calls++ < 3 ? 0 : 5000);
			try {
				const Out = await Run.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
				assert.equal(Out.jobId, "job-9");
				assert.equal(Jobs.specs.length, 1);
				assert.equal(Jobs.specs[0].kind, "batch-edit-continue");
				assert.equal(Jobs.specs[0].label, "batch mach-1");
				assert.equal(Jobs.specs[0].owner, "agent-a");
				// The first two files were applied inline (the fake fs versions
				// increment per write: v2 then v3); the third rides the job.
				assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition applied 1.txt version v1 -> v2"));
				assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition applied 2.txt version v1 -> v3"));
				const Result = await Jobs.specs[0].run();
				assert.deepEqual(Result, { status: "completed", detail: "batch mach-1 continued" });
				assert.ok(Run.Lines.includes("plugin-dsh-batch-edit: transition applied 3.txt version v1 -> v4"));
				assert.equal(Run.Fs.files["3.txt"], "UNO\n");
			} finally {
				Date.now = RealNow;
			}
		});
		const Run2 = Setup({ "1.txt": "one\n", "2.txt": "one\n", "3.txt": "one\n" }, { deadlineMs: 1000 });
		await Open(Run2, "UNO");
		await CheckAsync(Count, "O4: without a jobs hub the remainder halts with the deadline reason - never a hang", async () => {
			const RealNow = Date.now;
			let Calls = 0;
			Date.now = () => (Calls++ < 3 ? 0 : 5000);
			try {
				const Out = await Run2.Tool.execute({ action: "commit", machine: "mach-1" }, Exec());
				assert.equal(Out.jobId, undefined);
				assert.ok(Run2.Lines.includes("plugin-dsh-batch-edit: transition halted 3.txt deadline"));
				const Third = Out.state.find((C: any) => C.file === "3.txt");
				assert.equal(Third.status, "halted");
				assert.equal(Third.haltReason, "deadline");
				assert.ok(Run2.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (2 applied, 0 failed, 1 halted)"));
			} finally {
				Date.now = RealNow;
			}
		});
	}
	return Finish(Count, "Observers-And-Waterfalls");
};

// Standalone entry: `node Target/Test/Observers-And-Waterfalls/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Observers-And-Waterfalls`);
}
