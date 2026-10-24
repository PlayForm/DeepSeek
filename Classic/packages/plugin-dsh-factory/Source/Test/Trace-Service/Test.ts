// Source/Test/Trace-Service/Test.ts - the factory's TRACE SERVICE: the
// `ctx.trace` registration (provided ONCE from the factory constructor, the
// family's shared-machinery owner), the emit/on round-trip with the bus-
// completed envelope, the emitter-supplied trace/at preservation, the bounded
// newest-first ring, the disposer, the fail-open containment (one throwing
// listener never silences the rest and never reaches the caller), the
// malformed-draft refusal, `flush`, and the unload path (`dispose` on the
// fiber effect: a late emit and a late subscription are contained no-ops).
// Unit smoke of @playform/plugin-dsh-factory: the fake ctx + the REAL factory
// class, from the Harness.
import assert from "node:assert/strict";
import { Names } from "@playform/lib-dsh-trace";
import { Check, CheckAsync, Finish, MakeCounter, Make, FactoryClass } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const Fake = Make(null, {});
	const factory: any = new FactoryClass(Fake.Context);
	const Trace = Fake.provided["trace"] as any;

	// Group: the registration.
	{
		const Sub = "trace: the factory provides ONE ctx.trace service (the same instance)";
		{
			Check(Count, Sub, () => {
				assert.ok(Trace !== undefined, "the factory provided trace");
				assert.equal(Fake.Context.trace, Trace, "ctx.trace resolves to the service");
				assert.equal(Trace, factory.Trace, "the factory holds the same bus");
				assert.equal(typeof Trace.emit, "function");
				assert.equal(typeof Trace.on, "function");
				assert.equal(typeof Trace.flush, "function");
				assert.equal(typeof Trace.ring, "function");
				assert.equal(typeof Trace.dispose, "function");
			});
		}
	}

	// Group: the emit/on round-trip.
	{
		const Received: any[] = [];
		const Dispose = Trace.on(Names.observe, (Envelope: any) => Received.push(Envelope));
		Trace.emit({
			kind: Names.observe,
			payload: { path: "/repo/src/a.ts", version: "1", origin: "fs/observed" },
		});
		Check(Count, "trace: an emit reaches the named listener with the completed envelope", () => {
			assert.equal(Received.length, 1);
			assert.equal(Received[0].trace, "trace-1", "the bus assigned the correlation id");
			assert.equal(Received[0].kind, "observe/stamp");
			assert.equal(typeof Received[0].at, "number");
			assert.deepEqual(Received[0].payload, {
				path: "/repo/src/a.ts",
				version: "1",
				origin: "fs/observed",
			});
		});
		Check(Count, "trace: an emitter-supplied trace and at are preserved", () => {
			Trace.emit({
				kind: Names.indexed,
				payload: { path: "/repo/src/b.ts" },
				trace: "chain-9",
				at: 4242,
			});
			const Envelope = Trace.ring(1)[0];
			assert.equal(Envelope.trace, "chain-9");
			assert.equal(Envelope.at, 4242);
		});
		Check(Count, "trace: the disposer stops delivery", () => {
			Dispose();
			Trace.emit({ kind: Names.observe, payload: { path: "/repo/src/c.ts" } });
			assert.equal(Received.length, 1, "no delivery after the disposer");
		});
	}

	// Group: the ring.
	{
		const Sub = "trace: the ring is newest first and bounded at 256";
		{
			Check(Count, Sub, () => {
				const Before = Trace.ring().length;
				for (let Index = 0; Index < 300; Index += 1) {
					Trace.emit({ kind: Names.invalidated, payload: { path: `/bulk/${Index}.ts` } });
				}
				const Ring = Trace.ring();
				assert.equal(Ring.length, 256, "the bound holds");
				assert.equal(Ring[0].payload.path, "/bulk/299.ts", "newest first");
				assert.equal(Trace.ring(2).length, 2, "the limit slices the head");
				assert.equal(Before <= 256, true);
			});
		}
	}

	// Group: the fail-open containment.
	{
		const Seen: string[] = [];
		Trace.on(Names.indexed, () => {
			throw new Error("listener boom");
		});
		Trace.on(Names.indexed, () => Seen.push("second"));
		Check(Count, "trace: a throwing listener never reaches the caller and never silences the rest", () => {
			assert.doesNotThrow(() =>
				Trace.emit({ kind: Names.indexed, payload: { path: "/repo/src/d.ts" } }),
			);
			assert.deepEqual(Seen, ["second"]);
		});
		Check(Count, "trace: a malformed draft is ignored (no ring entry, no dispatch)", () => {
			const Before = Trace.ring().length;
			assert.doesNotThrow(() => Trace.emit(null as any));
			assert.doesNotThrow(() => Trace.emit({ kind: "", payload: {} } as any));
			assert.doesNotThrow(() => Trace.emit({ kind: Names.observe, payload: null } as any));
			assert.equal(Trace.ring().length, Before);
		});
	}

	// Group: the flush and the unload path.
	{
		await CheckAsync(Count, "trace: flush settles deterministically (no timer)", async () => {
			await assert.doesNotReject(() => Trace.flush());
		});
		Check(Count, "trace: the unload effect disposes the bus; a late emit and on are contained", () => {
			const Unload = Fake.effects.find((Entry: any[]) => Entry[0] === "trace")?.[1];
			assert.equal(typeof Unload, "function", "the constructor registered the trace unload effect");
			const Late: string[] = [];
			Unload();
			assert.doesNotThrow(() =>
				Trace.emit({ kind: Names.observe, payload: { path: "/repo/src/e.ts" } }),
			);
			const Dispose = Trace.on(Names.observe, () => Late.push("late"));
			assert.equal(typeof Dispose, "function", "a late subscription returns a disposer");
			Dispose();
			assert.deepEqual(Late, []);
		});
	}

	return Finish(Count, "Trace-Service");
};

// Standalone entry: `node Target/Test/Trace-Service/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Trace-Service`);
}
