// Source/Test/Store-And-Snapshot/Test.ts - the presentation store, THE
// STABLE-UNTIL-EVENT CONTRACT: getSnapshot() returns the same object
// reference until ingest() or refresh() emits a new one, with NO timer and
// NO polling (asserted by a real quiet wait and on the built code); the
// ingest fold (bounded event tail, representation upsert, sequence
// monotonicity), the refresh replacement (kind mapping, label preference),
// and the emit discipline (one notification per emit, new snapshot object
// per emit).
import assert from "node:assert/strict";
import StoreFactory from "../../../Target/Function/Store.js";
import { BuiltSource, Check, CheckAsync, Finish, MakeCounter } from "../Harness.js";

/** An event with the required identifiers. */
const Event = (Sequence: number, Path?: string): any => ({
	operationId: `op-${Sequence}`,
	parentId: "op-0",
	category: "fs",
	path: Path,
	sequence: Sequence,
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group S1: stable-until-event, no polling.
	{
		const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
		const First = Store.getSnapshot();
		const Second = Store.getSnapshot();
		Check(Count, "S1: getSnapshot is stable - the same reference across reads", () => {
			assert.equal(First, Second);
			assert.deepEqual(First, { sequence: 0, representations: [], events: [] });
		});
		await CheckAsync(Count, "S2: a quiet wait with no event emits nothing (no polling)", async () => {
			let Calls = 0;
			Store.subscribe(() => {
				Calls += 1;
			});
			await new Promise((Resolve) => setTimeout(Resolve, 50));
			assert.equal(Calls, 0);
			assert.equal(Store.getSnapshot(), First);
		});
	}

	// Group S3-S5: the ingest fold.
	{
		const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
		Check(Count, "S3: ingest with a path creates the file representation", () => {
			Store.ingest(Event(1, "src/a.ts"));
			const View = Store.getSnapshot();
			assert.deepEqual(View.representations, [
				{
					id: "file:src/a.ts",
					kind: "file",
					label: "src/a.ts",
					version: "unknown",
					lastSequence: 1,
				},
			]);
			assert.equal(View.sequence, 1);
		});
		Check(Count, "S4: a second event on the same path updates lastSequence in place", () => {
			Store.ingest(Event(2, "src/a.ts"));
			const View = Store.getSnapshot();
			assert.equal(View.representations.length, 1);
			assert.equal(View.representations[0]!.id, "file:src/a.ts");
			assert.equal(View.representations[0]!.lastSequence, 2);
			assert.equal(View.sequence, 2);
		});
		Check(Count, "S5: the sequence takes the running maximum", () => {
			Store.ingest(Event(1, "src/out-of-order.ts"));
			assert.equal(Store.getSnapshot().sequence, 2);
			Store.ingest(Event(9, "src/later.ts"));
			assert.equal(Store.getSnapshot().sequence, 9);
		});
	}

	// Group S6-S7: the bounds.
	{
		const Store = StoreFactory({ maxEvents: 3, maxRepresentations: 2 });
		Check(Count, "S6: the event tail is bounded - the oldest drops", () => {
			for (let Index = 1; Index <= 5; Index++) Store.ingest(Event(Index, `p${Index}.ts`));
			const View = Store.getSnapshot();
			assert.deepEqual(
				View.events.map((E: any) => E.sequence),
				[3, 4, 5],
			);
		});
		Check(Count, "S7: the representations are bounded - the oldest drops", () => {
			assert.deepEqual(
				Store.getSnapshot().representations.map((R: any) => R.id),
				["file:p4.ts", "file:p5.ts"],
			);
		});
	}

	// Group S8-S9: the refresh replacement.
	{
		const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
		Store.ingest(Event(4, "src/a.ts"));
		Check(Count, "S8: refresh replaces the representation set from the graph", () => {
			Store.refresh({
				indexRevision: "r1",
				nodes: [
					{ id: "file:src/a.ts", kind: "File", path: "src/a.ts", fingerprint: "f1", version: "3" },
					{ id: "doc:readme", kind: "DocSection", path: "README.md", name: "Readme", fingerprint: "f2", version: "1" },
					{ id: "sym:main", kind: "Symbol", path: "src/main.ts", name: "main", fingerprint: "f3", version: "5" },
				],
			});
			const View = Store.getSnapshot();
			assert.deepEqual(View.representations, [
				{ id: "file:src/a.ts", kind: "file", label: "src/a.ts", version: "3", lastSequence: 4 },
				{ id: "doc:readme", kind: "doc", label: "Readme", version: "1", lastSequence: 4 },
				{ id: "sym:main", kind: "symbol", label: "main", version: "5", lastSequence: 4 },
			]);
		});
		Check(Count, "S9: refresh keeps the sequence and the event tail", () => {
			const View = Store.getSnapshot();
			assert.equal(View.sequence, 4);
			assert.equal(View.events.length, 1);
		});
	}

	// Group S10: the emit discipline.
	{
		const Store = StoreFactory({ maxEvents: 50, maxRepresentations: 100 });
		Check(Count, "S10: each emit notifies once and yields a NEW snapshot object", () => {
			let Calls = 0;
			Store.subscribe(() => {
				Calls += 1;
			});
			const Before = Store.getSnapshot();
			Store.ingest(Event(1, "src/x.ts"));
			assert.equal(Calls, 1);
			assert.notEqual(Store.getSnapshot(), Before);
			Store.refresh({ indexRevision: "r2", nodes: [] });
			assert.equal(Calls, 2);
		});
	}

	// Group S11: the built store has no timer machinery.
	Check(Count, "S11: the built store source has no timer and no Node API", () => {
		const Source = BuiltSource("../Function/Store.js");
		assert.equal(/setInterval|setTimeout/.test(Source), false);
		assert.equal(/node:/.test(Source), false);
		assert.equal(/require\(/.test(Source), false);
	});

	return Finish(Count, "Store-And-Snapshot");
};

// Standalone entry: `node Target/Test/Store-And-Snapshot/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Store-And-Snapshot`);
}
