// Source/Test/Loop-And-Vocabulary/Test.ts - one singular test: the trace
// vocabulary and the detached loop - the exact names, the envelope completion
// (bus-assigned trace/at, the emitter's supplied values preserved), the two
// guards, the coalescing key, the loop's coalescing (ONE run per key, no
// timer), its fail-open containment, its disposer, per-key independence, and
// the fixed ring bound.
// Runs standalone (`node Target/Test/Loop-And-Vocabulary/Test.js`) AND under
// the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-lib-dsh-trace: the REAL built entry only.
import assert from "node:assert/strict";
import {
	Bound,
	Complete,
	IsEnvelope,
	IsStamp,
	Key,
	Loop,
	Names,
} from "../../../Target/Library.js";
import { Check, CheckAsync, Finish, MakeCounter } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group: the vocabulary.
	{
		const Sub = "Names: the service name and the three event names, byte-exact";
		{
			Check(Count, Sub, () => {
				assert.equal(Names.service, "trace");
				assert.equal(Names.observe, "observe/stamp");
				assert.equal(Names.indexed, "graph/indexed");
				assert.equal(Names.invalidated, "graph/invalidated");
			});
		}
	}
	{
		const Sub = "Bound: the fixed ring bound is 256 (no config knob)";
		{
			Check(Count, Sub, () => {
				assert.equal(Bound, 256);
			});
		}
	}

	// Group: the envelope completion.
	{
		const Sub = "Complete: the bus assigns trace-<n> and at; the emitter's values win";
		{
			Check(Count, Sub, () => {
				const Draft = Complete({ kind: Names.observe, payload: { path: "/a.ts" } }, 7);
				assert.equal(Draft.trace, "trace-7");
				assert.equal(Draft.kind, "observe/stamp");
				assert.equal(typeof Draft.at, "number");
				assert.deepEqual(Draft.payload, { path: "/a.ts" });
				assert.equal("actor" in Draft, false, "an absent actor stays absent");
				const Supplied = Complete(
					{
						kind: Names.indexed,
						payload: { path: "/b.ts" },
						trace: "chain-1",
						at: 1234,
						actor: { agent: "a" },
					},
					8,
				);
				assert.equal(Supplied.trace, "chain-1", "a supplied trace id is preserved");
				assert.equal(Supplied.at, 1234, "a supplied at is preserved");
				assert.deepEqual(Supplied.actor, { agent: "a" });
			});
		}
	}

	// Group: the guards.
	{
		const Sub = "IsEnvelope: a complete envelope passes, a partial or null value fails";
		{
			Check(Count, Sub, () => {
				assert.equal(
					IsEnvelope({ trace: "trace-1", kind: "x", at: 1, payload: {} }),
					true,
				);
				assert.equal(IsEnvelope(null), false);
				assert.equal(IsEnvelope({ kind: "x", payload: {} }), false, "no trace id");
				assert.equal(IsEnvelope({ trace: "t", kind: "", at: 1, payload: {} }), false);
				assert.equal(IsEnvelope({ trace: "t", kind: "x", at: "1", payload: {} }), false);
				assert.equal(IsEnvelope({ trace: "t", kind: "x", at: 1, payload: null }), false);
			});
		}
	}
	{
		const Sub = "IsStamp: the observe/stamp payload guard (path/version/origin)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					IsStamp({ path: "/a.ts", version: "1", origin: "fs/observed" }),
					true,
				);
				assert.equal(IsStamp({ path: "", version: "1", origin: "x" }), false);
				assert.equal(IsStamp({ path: "/a.ts", origin: "x" }), false, "no version");
				assert.equal(IsStamp({ path: "/a.ts", version: "1" }), false, "no origin");
				assert.equal(IsStamp("nope"), false);
			});
		}
	}

	// Group: the coalescing key.
	{
		const Sub = "Key: the payload's path, else the event name, else unknown";
		{
			Check(Count, Sub, () => {
				assert.equal(Key({ kind: Names.observe, payload: { path: "/a.ts" } }), "/a.ts");
				assert.equal(Key({ kind: Names.indexed, payload: {} }), "graph/indexed");
				assert.equal(Key({}), "unknown");
				assert.equal(Key({ kind: Names.observe, payload: { path: "" } }), "observe/stamp");
			});
		}
	}

	// Group: the detached loop.
	{
		const Sub = "Loop: a coalesced pair runs ONCE for the key";
		{
			const Ran: string[] = [];
			const Queue = Loop(async (Path: string) => {
				Ran.push(Path);
			});
			Queue.Schedule("/a.ts");
			Queue.Schedule("/a.ts");
			Queue.Schedule("/a.ts");
			await CheckAsync(Count, Sub, async () => {
				await Queue.Flush;
				assert.deepEqual(Ran, ["/a.ts"]);
			});
		}
		{
			const Sub = "Loop: two keys run independently and Flush awaits both";
			{
				const Ran: string[] = [];
				const Queue = Loop(async (Path: string) => {
					Ran.push(Path);
				});
				Queue.Schedule("/a.ts");
				Queue.Schedule("/b.ts");
				await CheckAsync(Count, Sub, async () => {
					await Queue.Flush;
					assert.deepEqual([...Ran].sort(), ["/a.ts", "/b.ts"]);
				});
			}
		}
		{
			const Sub = "Loop: a throwing run is contained (fail-open) and Flush still settles";
			{
				let Runs = 0;
				const Queue = Loop(async () => {
					Runs++;
					throw new Error("boom");
				});
				Queue.Schedule("/a.ts");
				await CheckAsync(Count, Sub, async () => {
					await assert.doesNotReject(() => Queue.Flush);
					assert.equal(Runs, 1);
				});
			}
		}
		{
			const Sub = "Loop: Dispose stops future scheduling (in-flight work still settles)";
			{
				const Ran: string[] = [];
				const Queue = Loop(async (Path: string) => {
					Ran.push(Path);
				});
				Queue.Schedule("/a.ts");
				Queue.Dispose();
				Queue.Schedule("/b.ts");
				await CheckAsync(Count, Sub, async () => {
					await Queue.Flush;
					assert.deepEqual(Ran, ["/a.ts"]);
				});
			}
		}
	}

	return Finish(Count, "Loop-And-Vocabulary");
};

// Standalone entry: `node Target/Test/Loop-And-Vocabulary/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Loop-And-Vocabulary`);
}
