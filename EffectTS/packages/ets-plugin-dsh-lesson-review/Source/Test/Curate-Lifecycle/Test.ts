// Source/Test/Curate-Lifecycle/Test.ts - THE LIFECYCLE: the always-on,
// token-free half of the review.
//
// A corpus that only grows is a corpus nobody loads. The pass is deterministic
// on purpose, and its four protections are the whole contract: pinned entries do
// not move, only `createdBy: agent` entries are in its jurisdiction, a zero-use
// entry gets a grace floor, and an archive is a RENAME (its own undo).
import assert from "node:assert/strict";
import FileSystem from "node:fs";
import * as Path from "node:path";

import { CheckAsync, Exists, Finish, Home, Make, MakeCounter, Seed } from "../Harness.js";

/** The day in ms (the knobs' unit). */
const Day = 86_400_000;

/** One usage record with the fields the lifecycle reads. */
const Record_ = (Name: string, Fields: Record<string, unknown> = {}) => ({
	name: Name,
	useCount: 1,
	viewCount: 0,
	patchCount: 0,
	createdAt: Date.now() - 100 * Day,
	lastUsedAt: Date.now() - 40 * Day,
	lastPatchedAt: Date.now() - 40 * Day,
	state: "active",
	pinned: false,
	createdBy: "agent",
	archivedAt: null,
	...Fields,
});

/** Write the usage sidecar BEFORE a construction, so the service loads it. */
const Store = (Entries: unknown[]): void => {
	const Target = Path.join(Home, ".dsh", "lesson", "usage.json");
	FileSystem.mkdirSync(Path.dirname(Target), { recursive: true });
	FileSystem.writeFileSync(Target, JSON.stringify({ version: 1, entries: Entries }), "utf8");
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	await CheckAsync(Count, "C1: an idle agent-created entry goes stale", async () => {
		Store([Record_("idle-skill", { lastUsedAt: Date.now() - 20 * Day })]);
		const Run = Make();
		await Run.Service.Flush();
		const Moved = await Run.Service.Curate();
		assert.deepEqual(Moved.stale, ["idle-skill"], "twenty days is past the stale line");
		assert.equal(Run.Service.Status().stale, 1, "the record says stale");
	});

	await CheckAsync(Count, "C2: a long-idle entry is archived AND its directory moves", async () => {
		Seed("old-skill");
		Store([Record_("old-skill", { lastUsedAt: Date.now() - 40 * Day })]);
		const Run = Make();
		await Run.Service.Flush();
		const Moved = await Run.Service.Curate();
		assert.deepEqual(Moved.archived, ["old-skill"], "forty days is past the archive line");
		assert.equal(Exists("skills/old-skill"), false, "the directory left the corpus");
		assert.equal(Exists("skills/.archive/old-skill/SKILL.md"), true, "and landed in the archive");
	});

	await CheckAsync(Count, "C3: a pinned entry never moves", async () => {
		Store([Record_("pinned-skill", { lastUsedAt: Date.now() - 400 * Day, pinned: true })]);
		const Run = Make();
		await Run.Service.Flush();
		const Moved = await Run.Service.Curate();
		assert.deepEqual(Moved.stale, [], "no transition");
		assert.deepEqual(Moved.archived, [], "no archive");
	});

	await CheckAsync(Count, "C4: a user-created entry is out of the lifecycle's jurisdiction", async () => {
		Store([Record_("hand-written", { lastUsedAt: Date.now() - 400 * Day, createdBy: "user" })]);
		const Run = Make();
		await Run.Service.Flush();
		const Moved = await Run.Service.Curate();
		assert.deepEqual(Moved.archived, [], "authorship is a policy flag, and this one says no");
	});

	await CheckAsync(Count, "C5: a zero-use entry keeps its grace floor", async () => {
		Store([
			Record_("never-used", {
				useCount: 0,
				createdAt: Date.now() - 5 * Day,
				lastUsedAt: Date.now() - 5 * Day,
			}),
		]);
		const Run = Make({ staleAfterDays: 3, archiveAfterDays: 3, neverUsedGraceDays: 14 });
		await Run.Service.Flush();
		const Moved = await Run.Service.Curate();
		assert.deepEqual(Moved.archived, [], "zero uses is not proof of disposability");
		assert.deepEqual(Moved.stale, ["never-used"], "but it does go stale");
	});

	await CheckAsync(Count, "C6: Restore brings an archived skill back and reactivates it", async () => {
		Seed("come-back");
		Store([Record_("come-back", { lastUsedAt: Date.now() - 40 * Day })]);
		const Run = Make();
		await Run.Service.Flush();
		await Run.Service.Curate();
		assert.equal(await Run.Service.Restore("come-back"), true, "the move back succeeds");
		assert.equal(Exists("skills/come-back/SKILL.md"), true, "the skill is in the corpus again");
		assert.equal(Run.Service.Status().active, 1, "and its record is active");
	});

	await CheckAsync(Count, "C7: a disabled service curates nothing", async () => {
		Store([Record_("idle-skill", { lastUsedAt: Date.now() - 400 * Day })]);
		const Run = Make({ enabled: false });
		await Run.Service.Flush();
		const Moved = await Run.Service.Curate();
		assert.deepEqual(Moved, { stale: [], archived: [] }, "the switch is the switch");
	});

	await CheckAsync(Count, "C8: the curation line is byte-exact", async () => {
		Store([Record_("stale-one", { lastUsedAt: Date.now() - 20 * Day })]);
		const Run = Make();
		await Run.Service.Flush();
		await Run.Service.Curate();
		const Lines = Run.Lines.map((Line: string) => Line.replace(/ \(logFile .*\)$/, ""));
		assert.deepEqual(Lines.slice(-2), ["lesson: stale stale-one", "lesson: curated 1 stale, 0 archived"]);
	});

	return Finish(Count, "Curate-Lifecycle");
};

// Standalone entry: `node Target/Test/Curate-Lifecycle/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Curate-Lifecycle`);
}
