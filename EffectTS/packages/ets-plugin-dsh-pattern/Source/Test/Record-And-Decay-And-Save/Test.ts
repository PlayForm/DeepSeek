// Source/Test/Record-And-Decay-And-Save/Test.ts - the learner, the decay and
// the snapshot persistence: the Record ledger lines byte-exactly, the
// unknown-id silence, the half-life decay arithmetic with the 0.5 floor, the
// clamping, the Save (real file in the redirected $HOME) with its
// byte-exact line, and the restore path (a seeded snapshot replaces the
// cold-start catalog).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Check,
	CheckAsync,
	Finish,
	Home,
	Make,
	MakeCounter,
	Settle,
} from "../Harness.js";

const Day = 86_400_000;

/** The default snapshot path inside the redirected home. */
const SnapshotPath = (): string => Path.join(Home, ".dsh", "pattern", "registry.json");

/** A custom pattern for the arithmetic tests. */
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

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: the Record ledger lines.
	{
		const Run = Make();
		Check(Count, "R1: an accepted outcome bumps the confidence by the acceptBonus and logs byte-exactly", () => {
			Run.Service.Record("version-bump", "accepted", 1000);
			assert.equal(Run.Service.Get("version-bump").confidence, 0.6);
			assert.deepEqual(
				Run.Lines,
				[
					"pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
					"pattern: recorded accepted on version-bump (confidence 0.60) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)",
				],
			);
		});
		Check(Count, "R1: each outcome uses its own delta (rejected, applied, failed)", () => {
			Run.Service.Record("rename", "rejected", 1000);
			assert.equal(Run.Service.Get("rename").confidence, 0.3);
			Run.Service.Record("search", "applied", 1000);
			assert.equal(Run.Service.Get("search").confidence, 0.65);
			Run.Service.Put(Pattern("low", 0.1, 0));
			Run.Service.Record("low", "failed", 1000);
			assert.equal(Run.Service.Get("low").confidence, 0);
			assert.ok(
				Run.Lines.includes("pattern: recorded failed on low (confidence 0.00) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)"),
			);
		});
		Check(Count, "R1: an unknown id is silent - no line, no throw", () => {
			const Before = Run.Lines.length;
			Run.Service.Record("nope", "accepted", 1000);
			assert.equal(Run.Lines.length, Before);
			assert.equal(Run.Service.Get("nope"), undefined);
		});
		Check(Count, "R1: Record stamps updatedAt with the passed Now - no wall clock", () => {
			Run.Service.Put(Pattern("stamp", 0.5, 0));
			Run.Service.Record("stamp", "accepted", 42);
			assert.equal(Run.Service.Get("stamp").updatedAt, 42);
		});
	}

	// Group R2: the decay.
	{
		const Run = Make();
		Check(Count, "R2: two half-lives of staleness pull the confidence a quarter toward the 0.5 floor", () => {
			Run.Service.Put(Pattern("decay-me", 0.6, 0));
			Run.Service.Decay(2 * 14 * Day);
			assert.ok(Math.abs(Run.Service.Get("decay-me").confidence - 0.525) < 1e-12);
			assert.equal(Run.Service.Get("decay-me").updatedAt, 2 * 14 * Day);
		});
		Check(Count, "R2: a confident pattern decays DOWNWARD, a low pattern UPWARD - both toward 0.5", () => {
			Run.Service.Put(Pattern("high", 0.9, 0));
			Run.Service.Put(Pattern("neg", 0.1, 0));
			Run.Service.Decay(14 * Day);
			assert.ok(Math.abs(Run.Service.Get("high").confidence - 0.7) < 1e-12);
			assert.ok(Math.abs(Run.Service.Get("neg").confidence - 0.3) < 1e-12);
		});
		Check(Count, "R2: a pattern at the floor never moves and never re-stamps", () => {
			Run.Service.Put(Pattern("floor", 0.5, 7));
			Run.Service.Decay(14 * Day);
			assert.equal(Run.Service.Get("floor").confidence, 0.5);
			assert.equal(Run.Service.Get("floor").updatedAt, 7);
		});
	}

	// Group R3: the snapshot persistence (real files inside the redirected home).
	{
		await CheckAsync(Count, "R3: Save writes the versioned snapshot file and logs byte-exactly", async () => {
			FileSystem.rmSync(SnapshotPath(), { force: true });
			const Run = Make({ storagePath: SnapshotPath() });
			Run.Service.Put(Pattern("extra", 0.4, 0));
			await Run.Service.Save();
			const Raw = JSON.parse(FileSystem.readFileSync(SnapshotPath(), "utf8"));
			assert.equal(Raw.version, 1);
			assert.equal(Raw.patterns.length, 5);
			assert.ok(
				Run.Lines.some((Line: string) =>
					Line.includes("saved 5 patterns to "),
				),
			);
			assert.ok(
				Run.Lines.includes(`pattern: saved 5 patterns to ${SnapshotPath()} (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)`),
			);
		});
		await CheckAsync(Count, "R3: a seeded snapshot replaces the cold-start catalog on construction", async () => {
			FileSystem.mkdirSync(Path.dirname(SnapshotPath()), { recursive: true });
			FileSystem.writeFileSync(
				SnapshotPath(),
				JSON.stringify({
					version: 1,
					savedAt: 1,
					patterns: [
						Pattern("only-one", 0.75, 0),
						Pattern("only-two", 0.25, 0),
					],
				}),
				"utf8",
			);
			const Run = Make({ storagePath: SnapshotPath() });
			await Settle();
			assert.deepEqual(
				Run.Service.List().map((P: any) => P.id),
				["only-one", "only-two"],
			);
			assert.ok(
				Run.Lines.some((Line: string) =>
					Line.includes("restored 2 patterns from snapshot"),
				),
			);
			assert.ok(
				Run.Lines.some((Line: string) =>
					Line.includes("pattern: restored 2 patterns from snapshot"),
				),
			);
		});
		await CheckAsync(Count, "R3: an unreadable or wrong-version snapshot is a silent miss - the catalog stays", async () => {
			FileSystem.mkdirSync(Path.dirname(SnapshotPath()), { recursive: true });
			FileSystem.writeFileSync(SnapshotPath(), "{ not json", "utf8");
			const Run = Make({ storagePath: SnapshotPath() });
			await Settle();
			assert.equal(Run.Service.List().length, 4);
			assert.ok(!Run.Lines.some((Line: string) => Line.includes("restored")));
		});
	}
	return Finish(Count, "Record-And-Decay-And-Save");
};

// Standalone entry: `node Target/Test/Record-And-Decay-And-Save/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Record-And-Decay-And-Save`);
}
