// Source/Test/Wiring-And-Queue/Test.ts - the wiring and the enqueue path:
// the loader contract (the default object carries name/apply/Config/inject,
// apply returns nothing), the IDLE-forever cold mount, the activation proof,
// the dshQueue service registered from apply, the two tools registered, the
// enqueue ledger strings byte-exact, the fail-loud capacity validation, the
// disabled tools, and the zero file-content guarantee.
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Ledger,
	LedgerLines,
	Make,
	MakeCounter,
	Plugin,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount. */
const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the loader contract.
	{
		const Run = Setup();
		Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
			assert.equal((Plugin as any).name, "plugin-dsh-queue");
			assert.equal(typeof (Plugin as any).apply, "function");
			assert.ok((Plugin as any).Config);
			assert.deepEqual((Plugin as any).inject, ["pluginFactory", "tools"]);
		});
		Check(Count, "L1: apply returns NOTHING and the state probe exists", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.State !== undefined);
			assert.equal(Run.State.Module, "plugin-dsh-queue");
			assert.equal(Run.State.On, true);
		});
	}

	// Group W1: the cold mount (the IDLE-forever posture).
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }));
		Check(Count, "W1: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["plugin-dsh-queue: disabled (enabled=false)"]);
		});
		Check(Count, "W1: a disabled mount registers no listener on any context", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.deepEqual(Object.keys(Run.CtxListeners).filter((K) => K !== "loader/volatile-update"), []);
		});
		Check(Count, "W1: the service and the tools still register; the tools refuse", () => {
			assert.ok(Run.Provided["dshQueue"] !== undefined);
			assert.deepEqual(Run.Tools.map((T: any) => T.name), ["queue_enqueue", "queue_status"]);
			assert.deepEqual(Run.Tools[0].exec({ spec: "x" }), {
				ok: false,
				error: "queue disabled (enabled=false)",
			});
			assert.deepEqual(Run.Tools[1].exec({}), {
				ok: false,
				error: "queue disabled (enabled=false)",
			});
		});
	}

	// Group W2: the activation wiring.
	{
		const Run = Setup();
		Check(Count, "W2: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, [
				"plugin-dsh-queue: activated (bundle 0.2.1, capacity=main=10 child=2, routedDispatch=true)",
			]);
		});
		Check(Count, "W2: the dshQueue service is the apply-registered instance", () => {
			const Service = Run.Provided["dshQueue"];
			assert.ok(Service !== undefined);
			assert.equal(Service, Run.State.DshQueue);
			assert.equal(typeof Service.Enqueue, "function");
			assert.equal(typeof Service.Dispatch, "function");
			assert.equal(typeof Service.Start, "function");
			assert.equal(typeof Service.Complete, "function");
			assert.equal(typeof Service.Fail, "function");
			assert.equal(typeof Service.Interrupt, "function");
			assert.equal(typeof Service.Board, "function");
			assert.equal(typeof Service.Snapshot, "function");
			assert.equal(typeof Service.Capacity, "function");
		});
		Check(Count, "W2: the two tools are registered with the queue surface", () => {
			assert.deepEqual(Run.Tools.map((T: any) => T.name), ["queue_enqueue", "queue_status"]);
			assert.deepEqual(Run.Tools[0].parameters.required, ["spec"]);
		});
	}

	// Group W3: the enqueue path.
	{
		const Run = Setup();
		const Service = Run.Context.dshQueue;
		const First = Service.Enqueue({ spec: "Build the parser", role: "coder", priority: 3, dependsOn: [] });
		const Second = Service.Enqueue({ spec: "Review the docs" });
		Check(Count, "W3: enqueue assigns the ids and stores the spec verbatim", () => {
			assert.equal(First.id, "queue-1");
			assert.equal(First.state, "queued");
			assert.equal(First.seq, 1);
			assert.equal(First.spec, "Build the parser");
			assert.equal(Second.id, "queue-2");
			assert.equal(Second.seq, 2);
			assert.equal(Second.priority, 0);
			assert.equal(Second.role, undefined);
		});
		Check(Count, "W3: the enqueue ledger lines are byte-exact", () => {
			assert.ok(Run.Lines.includes("plugin-dsh-queue: queued queue-1 coder p3 deps0"));
			assert.ok(Run.Lines.includes("plugin-dsh-queue: queued queue-2 auto p0 deps0"));
			assert.equal(LedgerLines().filter((Line) => Line.endsWith("queued queue-1 coder p3 deps0")).length, 1);
			assert.equal(LedgerLines().filter((Line) => Line.endsWith("queued queue-2 auto p0 deps0")).length, 1);
		});
		Check(Count, "W3: the journal record rides the pre-open journaling path", () => {
			// No storage domain is opened in the queue's tests, so the factory's
			// journaling routes every record to its pre-bind buffer (the boot
			// window) — assert on the delta, so accumulation from earlier
			// scenarios in the same process cannot skew the assertion.
			const Factory = Run.Context.pluginFactory;
			const Before = Factory.PendingJournal.length;
			Factory.PendingJournal.splice(0, Before);
			Service.Enqueue({ spec: "Journal probe", role: "coder", priority: 4 });
			assert.equal(Factory.PendingJournal.length, 1);
			assert.equal(Factory.PendingJournal[0].event, "task queued");
			assert.equal(Factory.PendingJournal[0].path, "queue-3");
			assert.equal(Factory.PendingJournal[0].detail, "p4");
			assert.equal(typeof Factory.PendingJournal[0].at, "number");
		});
	}

	// Group W4: the fail-loud validation.
	{
		Check(Count, "W4: capacity.main below 1 fails loud at the schema (load time)", () => {
			assert.throws(
				() => Validate({ logFile: Ledger, enabled: true, capacity: { main: 0, child: 2 } }),
				/expected number >= 1/,
			);
		});
		const Composition = await import("../../Function/Validate.js");
		Check(Count, "W4: the composition check fails loud on plain values", () => {
			assert.throws(
				() => Composition.default({ main: 0, child: 2 }),
				/plugin-dsh-queue: capacity\.main must be >= 1/,
			);
			assert.throws(
				() => Composition.default({ main: 10, child: 0 }),
				/plugin-dsh-queue: capacity\.child must be >= 1/,
			);
			assert.throws(
				() => Composition.default({ get: () => ({ main: 0, child: 2 }) } as unknown as { main: number; child: number }),
				/plugin-dsh-queue: capacity\.main must be >= 1/,
			);
		});
	}

	// Group W5: the zero file-content guarantee.
	{
		const Run = Setup();
		const Service = Run.Context.dshQueue;
		Service.Enqueue({ spec: "a" });
		Service.Dispatch();
		Service.Start("queue-1");
		Service.Complete("queue-1", "hash-1");
		Check(Count, "W5: the fake fs records ZERO writeText and readText calls", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
		});
	}
	return Finish(Count, "Wiring-And-Queue");
};

// Standalone entry: `node Target/Test/Wiring-And-Queue/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Queue`);
}
