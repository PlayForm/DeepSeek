// Source/Test/Wiring-And-Recovery/Test.ts - the wiring and the recovery:
// the loader contract (the default object carries name/apply/Config/inject,
// apply returns nothing), the IDLE-forever cold mount, the activation proof,
// the service registered from apply, the fail-loud validation, the state
// file recovery (missing, seeded, corrupt; the honest active downgrade),
// and the zero context-fs guarantee.
import assert from "node:assert/strict";
import * as Path from "node:path";
import {
	Check,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Plugin,
	Root,
	Seed,
	StateFile,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount. */
const Setup = (Config: Record<string, unknown> = {}, Attach?: (C: any, R: any) => void): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile, ...Config }), Attach);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the loader contract.
	{
		const Run = Setup();
		Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
			assert.equal((Plugin as any).name, "plugin-dsh-batchstate");
			assert.equal(typeof (Plugin as any).apply, "function");
			assert.ok((Plugin as any).Config);
			assert.deepEqual((Plugin as any).inject, ["pluginFactory"]);
		});
		Check(Count, "L1: apply returns NOTHING and the state probe exists", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.State !== undefined);
			assert.equal(Run.State.Module, "batchstate");
			assert.equal(Run.State.On, true);
		});
	}

	// Group W1: the cold mount (the IDLE-forever posture).
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, stateFile: StateFile }));
		Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["batchstate: disabled (enabled=false)"]);
		});
		Check(Count, "W1: the service still registers and reads the empty state", () => {
			assert.ok(Run.Provided["batchstate"] !== undefined);
			assert.equal(Run.Context.batchstate.getState().running.length, 0);
			assert.equal(Run.Context.batchstate.getContext("a").startsWith("[BATCH STATE - default - live]"), true);
		});
	}

	// Group W2: the activation wiring.
	{
		const Run = Setup();
		Check(Count, "W2: the activation and recovery lines are byte-exact", () => {
			assert.deepEqual(Run.Lines, [
				`batchstate: activated (batch=default, stateFile=${StateFile})`,
				"batchstate: recovered (0 members, queue 0)",
			]);
		});
		Check(Count, "W2: the service surface is complete on the provided instance", () => {
			const Service = Run.Provided["batchstate"];
			assert.equal(Service, Run.Context.batchstate);
			for (const Method of ["getState", "getContext", "getScope", "whoElse", "setTask", "setStatus", "setScope", "queue", "clear"]) {
				assert.equal(typeof Service[Method], "function", Method);
			}
		});
	}

	// Group X1: the fail-loud validation.
	{
		Check(Count, "X1: maxRecent below 1 fails loud at load", () => {
			assert.throws(
				() => Setup({ maxRecent: 0 }),
				/batchstate: maxRecent must be an integer >= 1/,
			);
		});
		Check(Count, "X1: an empty stateFile fails loud at load", () => {
			assert.throws(
				() => Setup({ stateFile: "" }),
				/batchstate: stateFile must be a non-empty string/,
			);
		});
		Check(Count, "X1: an empty batch key fails loud at load", () => {
			assert.throws(
				() => Setup({ batch: "" }),
				/batchstate: batch must be a non-empty string/,
			);
		});
	}

	// Group R1: the state file recovery.
	{
		Seed(
			JSON.stringify({
				members: [
					{ id: "a", role: "coder", task: "T1", status: "active", queue: -1, scope: ["/x"], startedAt: 11, finishedAt: 0 },
					{ id: "b", role: "planner", task: "T2", status: "completed", queue: 0, scope: [], startedAt: 5, finishedAt: 9 },
				],
				queue: ["b", "ghost"],
			}),
		);
		const Run = Setup();
		Check(Count, "R1: the seeded members and queue are restored", () => {
			assert.ok(Run.Lines.includes("batchstate: recovered (2 members, queue 1)"));
			assert.equal(Run.State.Members.get("a")?.task, "T1");
			assert.equal(Run.State.Members.get("b")?.status, "completed");
			assert.deepEqual(Run.State.IdleQueue, ["b"]);
		});
		Check(Count, "R1: a recovered active member is honestly downgraded", () => {
			const Active = Run.State.Members.get("a");
			assert.equal(Active?.status, "interrupted");
			assert.ok((Active?.finishedAt ?? 0) > 0);
		});
	}

	// Group R2: the corrupt state file.
	{
		const Broken = Path.join(Root, "broken-state.json");
		Seed("{not json", Broken);
		const Run = Setup({ stateFile: Broken });
		Check(Count, "R2: a corrupt file starts the batch empty, never guessed", () => {
			assert.ok(Run.Lines.includes("batchstate: recovered (0 members, queue 0)"));
			assert.equal(Run.State.Members.size, 0);
			assert.deepEqual(Run.State.IdleQueue, []);
		});
	}

	// Group P1: the zero context-fs guarantee.
	{
		const Run = Setup();
		const Service = Run.Context.batchstate;
		Service.setTask("a", "T");
		Service.setStatus("a", "completed");
		Service.setScope("b", ["/p"]);
		Service.queue("c");
		Service.clear();
		Check(Count, "P1: the fake fs records ZERO writeText and readText calls", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
		});
	}
	return Finish(Count, "Wiring-And-Recovery");
};

// Standalone entry: `node Target/Test/Wiring-And-Recovery/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Recovery`);
}
