// Source/Test/Storage-Domain/Test.ts - the storage-domain PRIMARY store and
// the JSON fallback: the byte-exact domain spec (name/version/layout/tables,
// NO compatibleVersions), the open, the per-mutation round-trip (Record and
// Decay write the KV records), the explicit Save (every pattern plus the meta
// timestamp), the reopen (restart) restoring the registry, the absent-facility
// fallback still writing and reading the JSON snapshot, and the
// domain-version failure mode (a loud line, then the JSON fallback).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Check,
	CheckAsync,
	FakeStorage,
	Finish,
	Home,
	Make,
	MakeCounter,
} from "../Harness.js";

const Day = 86_400_000;

/** The default snapshot path inside the redirected home. */
const SnapshotPath = (): string => Path.join(Home, ".dsh", "pattern", "registry.json");

/** The activation line every mount logs (the byte-exact contract). */
const Activated = "pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)";

/** A custom pattern (the seed/restart fixtures). */
const Pattern = (Id: string, Confidence: number, UpdatedAt: number): any => ({
	id: Id,
	intent: Id,
	trigger: { keywords: [`kw-${Id}`] },
	targets: [],
	transform: [],
	arbiter: "test",
	confidence: Confidence,
	allowlist: false,
	updatedAt: UpdatedAt,
});

/** Write the JSON fallback snapshot (the degraded-store fixtures). */
const SeedJson = (Patterns: any[]): void => {
	FileSystem.mkdirSync(Path.dirname(SnapshotPath()), { recursive: true });
	FileSystem.writeFileSync(
		SnapshotPath(),
		JSON.stringify({ version: 1, savedAt: 1, patterns: Patterns }),
		"utf8",
	);
};

/** One mount over the fake KV domain (the facility attached BEFORE the probe). */
const Mount = (Knobs: Record<string, unknown>, Store: any): any =>
	Make({ storagePath: SnapshotPath(), ...Knobs }, (Context: any) => {
		Context.storageDomain = Store.facility;
	});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group D1: the domain spec and the open.
	{
		const Store = FakeStorage();
		const Run = Mount({}, Store);
		await Run.Service.Flush();
		Check(Count, "D1: the spec is name/version/layout/tables with NO compatibleVersions", () => {
			assert.equal(Store.spec.name, "pattern");
			assert.equal(Store.spec.version, 1);
			assert.equal(Store.spec.layout, "per-record");
			assert.equal(Store.spec.invalidRecords, "backup-and-skip");
			assert.ok(Store.spec.tables.patterns !== undefined);
			assert.ok(Store.spec.tables.meta !== undefined);
			// The family's learned rule: `[1]` against version 1 is rejected by
			// the library, so the spec must declare NO compatibleVersions.
			assert.equal(Store.spec.compatibleVersions, undefined);
		});
		Check(Count, "D1: the open binds the domain and the effect closes it on dispose", () => {
			assert.deepEqual(Run.Effects, ["pattern-storage"]);
			assert.equal(Run.Disposers.length, 1);
			assert.equal(Store.closed, false);
			Run.Disposers[0]();
			assert.equal(Store.closed, true);
		});
	}

	// Group D2: the per-mutation round-trip through the domain.
	{
		const Store = FakeStorage();
		const Run = Mount({}, Store);
		await Run.Service.Flush();
		await CheckAsync(Count, "D2: a Record writes the pattern to the patterns table", async () => {
			Run.Service.Record("version-bump", "accepted", 1000);
			await Run.Service.Flush();
			const Patterns = Store.tables.get("patterns") as Map<string, unknown>;
			assert.deepEqual(Store.writes, [["patterns", "version-bump"]]);
			assert.equal((Patterns.get("version-bump") as any).confidence, 0.6);
			assert.equal((Patterns.get("version-bump") as any).updatedAt, 1000);
		});
		await CheckAsync(Count, "D2: the decay writes every pattern it moved, and only those", async () => {
			Run.Service.Record("rename", "rejected", 0);
			Run.Service.Put(Pattern("floor", 0.5, 7));
			await Run.Service.Flush();
			Run.Service.Decay(14 * Day);
			await Run.Service.Flush();
			const Patterns = Store.tables.get("patterns") as Map<string, unknown>;
			assert.ok(Math.abs((Patterns.get("rename") as any).confidence - 0.4) < 1e-12);
			assert.equal(
				Store.writes.filter(([, Key]: [string, string]) => Key === "rename").length,
				2,
			);
			assert.equal(
				Store.writes.filter(([, Key]: [string, string]) => Key === "floor").length,
				0,
			);
		});
		await CheckAsync(Count, "D2: the explicit Save writes every pattern and the meta timestamp", async () => {
			await Run.Service.Save();
			const Patterns = Store.tables.get("patterns") as Map<string, unknown>;
			const Meta = Store.tables.get("meta") as Map<string, unknown>;
			assert.deepEqual([...Patterns.keys()].sort(), [
				"floor",
				"rename",
				"search",
				"test-update",
				"version-bump",
			]);
			assert.equal(typeof Meta.get("__savedAt"), "number");
			assert.deepEqual(Run.Lines.slice(-1), [
				"pattern: saved 5 patterns to pattern (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
			]);
		});
		await CheckAsync(Count, "D2: a Record in the open window survives the recovery", async () => {
			const Seeded = FakeStorage();
			Seeded.seed("patterns", "version-bump", Pattern("version-bump", 0.9, 1));
			const Window = Mount({}, Seeded);
			// BEFORE the detached open resolves: a live mutation (the store's
			// older copy must not clobber it).
			Window.Service.Record("version-bump", "accepted", 1000);
			await Window.Service.Flush();
			const Patterns = Seeded.tables.get("patterns") as Map<string, unknown>;
			assert.equal(Window.Service.Get("version-bump")?.confidence, 0.6);
			assert.equal((Patterns.get("version-bump") as any).confidence, 0.6);
		});
	}

	// Group D3: the reopen (restart) restores the registry from the domain.
	{
		const Store = FakeStorage();
		const First = Mount({}, Store);
		await First.Service.Flush();
		First.Service.Record("version-bump", "accepted", 1000);
		First.Service.Record("rename", "rejected", 1000);
		await First.Service.Flush();
		const Second = Mount({}, Store);
		await Second.Service.Flush();
		Check(Count, "D3: a reopen restores the stored patterns over the catalog", () => {
			assert.deepEqual(Second.Service.List().map((One: any) => One.id), [
				"rename",
				"search",
				"test-update",
				"version-bump",
			]);
			assert.ok(
				Second.Lines.includes(
					"pattern: restored 2 patterns from snapshot (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
				),
			);
			assert.deepEqual(Second.Lines.slice(0, 2), [
				Activated,
				"pattern: restored 2 patterns from snapshot (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
			]);
		});
		Check(Count, "D3: the restored pattern carries the persisted confidence", () => {
			assert.equal(Second.Service.Get("version-bump")?.confidence, 0.6);
			assert.equal(Second.Service.Get("rename")?.confidence, 0.3);
			assert.equal(Second.Service.Get("search")?.confidence, 0.5);
		});
	}

	// Group D4: the absent-facility fallback (the JSON snapshot still works).
	{
		FileSystem.rmSync(SnapshotPath(), { force: true });
		const Run = Make({ storagePath: SnapshotPath() });
		await CheckAsync(Count, "D4: without a facility the JSON snapshot is the store", async () => {
			Run.Service.Record("version-bump", "accepted", 1000);
			await Run.Service.Save();
			const Raw = JSON.parse(FileSystem.readFileSync(SnapshotPath(), "utf8"));
			assert.equal(Raw.version, 1);
			assert.equal(Raw.patterns.length, 4);
			assert.deepEqual(Run.Effects, []);
			assert.deepEqual(Run.Lines.slice(-1), [
				`pattern: saved 4 patterns to ${SnapshotPath()} (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)`,
			]);
		});
		await CheckAsync(Count, "D4: without a facility the JSON snapshot restores the registry", async () => {
			SeedJson([Pattern("only-one", 0.75, 0), Pattern("only-two", 0.25, 0)]);
			const Fallback = Make({ storagePath: SnapshotPath() });
			// The JSON load runs on the same store chain: the flush seam waits
			// for it, so no sleep is needed.
			await Fallback.Service.Flush();
			assert.deepEqual(Fallback.Service.List().map((One: any) => One.id), [
				"only-one",
				"only-two",
			]);
			assert.ok(
				Fallback.Lines.includes(
					"pattern: restored 2 patterns from snapshot (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
				),
			);
		});
	}

	// Group D5: the domain-version failure mode.
	{
		FileSystem.rmSync(SnapshotPath(), { force: true });
		SeedJson([Pattern("from-file", 0.5, 0)]);
		const Store = FakeStorage({ version: 2 });
		const Run = Mount({}, Store);
		await Run.Service.Flush();
		Check(Count, "D5: a domain-version mismatch is loud and degrades to the JSON fallback", () => {
			assert.ok(
				Run.Lines.includes(
					"pattern: storage open failed: version-mismatch: stored 2, declared 1 (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
				),
			);
			assert.equal(Store.spec, undefined);
			assert.deepEqual(Run.Service.List().map((One: any) => One.id), ["from-file"]);
		});
		await CheckAsync(Count, "D5: the degraded mount keeps writing the JSON fallback, never the domain", async () => {
			await Run.Service.Save();
			const Raw = JSON.parse(FileSystem.readFileSync(SnapshotPath(), "utf8"));
			assert.deepEqual(Raw.patterns.map((One: any) => One.id), ["from-file"]);
			assert.deepEqual(Store.writes, []);
			assert.deepEqual(Run.Lines.slice(-1), [
				`pattern: saved 1 patterns to ${SnapshotPath()} (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)`,
			]);
		});
	}

	// Group D6: the domain knob.
	{
		const Store = FakeStorage();
		const Run = Mount({ domain: "pattern_test" }, Store);
		await Run.Service.Flush();
		Check(Count, "D6: the domain knob renames the domain", () => {
			assert.equal(Store.spec.name, "pattern_test");
		});
		Check(Count, "D6: an invalid domain name fails loud at load", () => {
			assert.throws(
				() => Mount({ domain: "Pattern-Test" }, FakeStorage()),
				/pattern: domain must be a lowercase unit name/,
			);
		});
	}

	return Finish(Count, "Storage-Domain");
};

// Standalone entry: `node Target/Test/Storage-Domain/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Storage-Domain`);
}
