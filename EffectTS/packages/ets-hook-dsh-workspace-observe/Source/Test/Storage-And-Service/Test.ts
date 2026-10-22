// Source/Test/Storage-And-Service/Test.ts - the storage domain and the
// service surface: the byte-exact domain spec, the record persistence (the
// latest per path + the ring under the meta key), the restart recovery with
// the continued sequence, the persisted cap, the manual stamp path, the
// absent facility (silent skip), the loud open failure, and the ZERO
// writeText/readText guarantee (B10).
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Fire,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	OpenStorage,
	rm,
	Validate,
	FakeStorage,
} from "../Harness.js";

/** A standard enabled mount with the fake storage attached. */
const Setup = (
	Config: Record<string, unknown> = {},
	Facility: unknown = undefined,
	Files: Record<string, string> = {},
): any => {
	rm();
	return Make(
		Validate({ logFile: Ledger, enabled: true, ...Config }),
		(Context: any, Run: any) => {
			if (Facility !== undefined) {
				Context.storageDomain = (Facility as { facility?: unknown }).facility ?? Facility;
			}
			if (Object.keys(Files).length > 0) {
				const Fs = Run.Fs;
				Fs.files = Files;
			}
		},
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group S1: the domain spec and the open.
	{
		const Run = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Check(Count, "S1: the domain spec is name/version/layout/invalidRecords/two tables", () => {
			const Spec = Store.spec;
			assert.equal(Spec.name, "workspace_observe");
			assert.equal(Spec.version, 1);
			assert.equal(Spec.layout, "per-record");
			assert.equal(Spec.invalidRecords, "backup-and-skip");
			assert.ok(Spec.tables.stamps !== undefined);
			assert.ok(Spec.tables.ring !== undefined);
		});
		Check(Count, "S1: the open binds the handle", () => {
			assert.ok(Run.State.Handle !== undefined);
		});
	}

	// Group S2: the record persistence.
	{
		const Run = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Fire(Run, "/repo/src/a.ts", "1");
		Fire(Run, "/repo/src/b.ts", "2");
		const Latest = Store.tables.get("stamps") as Map<string, unknown>;
		const Ring = Store.tables.get("ring") as Map<string, unknown>;
		Check(Count, "S2: the latest records land keyed by path with the exact shape", () => {
			assert.deepEqual(Latest.get("/repo/src/a.ts"), {
				path: "/repo/src/a.ts",
				version: "1",
				origin: "fs/observed",
				sequence: 1,
			});
			assert.deepEqual(Latest.get("/repo/src/b.ts"), {
				path: "/repo/src/b.ts",
				version: "2",
				origin: "fs/observed",
				sequence: 2,
			});
		});
		Check(Count, "S2: the ring snapshot lands under the meta key", () => {
			assert.deepEqual(Ring.get("__ring"), Run.State.Ring);
		});
	}

	// Group S3: the restart recovery.
	{
		const Store = FakeStorage();
		const First = Setup();
		await OpenStorage(First, Store.facility);
		Fire(First, "/repo/src/a.ts", "1");
		Fire(First, "/repo/src/b.ts", "2");
		const Second = Setup({}, Store.facility);
		await OpenStorage(Second, Store.facility);
		Check(Count, "S3: the recovery rebuilds latest and ring from the store", () => {
			assert.equal(Second.State.Latest.size, 2);
			assert.equal(Second.State.Ring.length, 2);
			assert.deepEqual(Second.Context.workspaceObserve.stamp("/repo/src/b.ts"), {
				path: "/repo/src/b.ts",
				version: "2",
				origin: "fs/observed",
				sequence: 2,
			});
		});
		Check(Count, "S3: the sequence continues at the recovered maximum, never a wall clock", () => {
			Fire(Second, "/repo/src/c.ts", "3");
			assert.equal(Second.State.Sequence, 3);
			assert.equal(Second.State.Latest.get("/repo/src/c.ts").sequence, 3);
		});
	}

	// Group S4: the persisted cap.
	{
		const Run = Setup({ maxStamps: 2 });
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Fire(Run, "/repo/src/a.ts", "1");
		Fire(Run, "/repo/src/b.ts", "2");
		Fire(Run, "/repo/src/c.ts", "3");
		const Ring = Store.tables.get("ring") as Map<string, unknown>;
		Check(Count, "S4: the persisted ring is capped; the latest map is not", () => {
			assert.equal((Ring.get("__ring") as unknown[]).length, 2);
			assert.equal(Run.State.Latest.size, 3);
		});
	}

	// Group S5: the manual path.
	{
		const Run = Setup({}, undefined, { "/repo/src/a.ts": "9" });
		await CheckAsync(Count, "S5: manual stamps with the stat version and the manual ledger line", async () => {
			const Stamp = await Run.Context.workspaceObserve.manual("/repo/src/a.ts");
			assert.deepEqual(Stamp, {
				path: "/repo/src/a.ts",
				version: "9",
				origin: "manual",
				sequence: 1,
			});
			assert.equal(Run.State.Latest.get("/repo/src/a.ts").origin, "manual");
			assert.ok(LinesWith(Run, "manual").includes("observe: manual /repo/src/a.ts version 9"));
			assert.equal(LinesWith(Run, "(fs/observed)").length, 0);
		});
		await CheckAsync(Count, "S5: a manual stat on an absent target records version absent", async () => {
			const Stamp = await Run.Context.workspaceObserve.manual("/repo/src/none.ts");
			assert.equal(Stamp.version, "absent");
			assert.equal(Stamp.sequence, 2);
		});
	}

	// Group S6: the ZERO file-mutation guarantee (B10).
	{
		const Run = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Fire(Run, "/repo/src/a.ts", "1");
		await Run.Context.workspaceObserve.manual("/repo/src/b.ts");
		Check(Count, "S6: the fake fs records ZERO writeText and readText calls", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
		});
	}

	// Group S7: the absent facility.
	{
		const Run = Setup();
		Check(Count, "S7: with no facility the effect is a silent skip and the stamps live in memory", () => {
			assert.deepEqual(Run.Effects, ["observe-storage"]);
			assert.equal(Run.State.Handle, undefined);
			Fire(Run, "/repo/src/a.ts", "1");
			assert.equal(Run.Context.workspaceObserve.stamps().length, 1);
			assert.deepEqual(LinesWith(Run, "storage open failed"), []);
		});
	}

	// Group S8: the loud open failure.
	{
		const Run = Setup();
		const Store = FakeStorage({ failOpen: true });
		await OpenStorage(Run, Store.facility);
		Check(Count, "S8: a failed open logs the byte-exact line and degrades", () => {
			assert.deepEqual(LinesWith(Run, "storage open failed"), [
				"observe: storage open failed: storage unavailable",
			]);
			assert.equal(Run.State.Handle, undefined);
			assert.equal(Run.State.Latest.size, 0);
		});
	}

	// Group S9: the service surface over both origins.
	{
		const Run = Setup({}, undefined, { "/repo/src/m.ts": "7" });
		Fire(Run, "/repo/src/a.ts", "1");
		await Run.Context.workspaceObserve.manual("/repo/src/m.ts");
		const Service = Run.Context.workspaceObserve;
		Check(Count, "S9: the service statistics count both origins and the shared sequence", () => {
			assert.deepEqual(Service.statistics(), { paths: 2, stamps: 2, sequence: 2 });
		});
		Check(Count, "S9: stamp() resolves the manual latest too", () => {
			assert.equal(Service.stamp("/repo/src/m.ts")?.version, "7");
		});
	}
	return Finish(Count, "Storage-And-Service");
};

// Standalone entry: `node Target/Test/Storage-And-Service/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Storage-And-Service`);
}
