/**
 * @module Test
 *
 * The store and the audit ledger.
 *
 * @remarks
 * The usage store is the curator's whole input, so its thirteen fields, the
 * writers that own each one, and the reuse watermark are the contract. Two
 * postures matter more than the fields:
 *
 * - A CORRUPT STORE IS QUARANTINED, NOT OVERWRITTEN. Hermes reads a corrupt
 *   store as `{}` and the next bump rewrites the whole file with one record,
 *   silently losing every other record. Here the unreadable file is moved to
 *   `<storagePath>.corrupt-<stamp>`, one ledger line names it, and the next
 *   write creates a fresh store while the quarantined bytes stay on disk.
 * - WRITES ARE ATOMIC AND ORDERED. One promise chain, one temporary file, one
 *   rename, so a load always precedes a write and two saves cannot interleave.
 *
 * The ledger half is the other mechanism this package needs: blobs are
 * content-addressed and deduplicated, a row names the addresses it captured, and
 * a rotation keeps `snapshotKeep` manifests while never pruning a protected one -
 * because a revert's safety snapshot must survive its own pass.
 */
import assert from "node:assert/strict";
import FileSystem from "node:fs";
import * as Path from "node:path";

import Append, { Blob, Capture, Rows } from "../../../Target/Function/Ledger.js";
import Snapshot, { Rotate } from "../../../Target/Function/Snapshot.js";
import Usage from "../../../Target/Function/Usage.js";
import { CheckAsync, FakeFs, Finish, Knobs, MakeCounter, Seed, State } from "../Harness.js";

/** A SKILL.md body with matching frontmatter. */
const Body = (Name: string): string => `---\nname: ${Name}\ndescription: what it does\n---\n\n# ${Name}\n\nA step.\n`;

/** A fixed instant, so no assertion depends on wall time. */
const Now = new Date("2026-11-02T12:00:00.000Z");
const Later = new Date("2026-11-02T13:00:00.000Z");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	await CheckAsync(Count, "U1: a fresh record carries exactly the thirteen fields", async () => {
		const Configuration_ = Knobs({ ...State("u1") });
		const Store = new Usage(Configuration_.storagePath);
		const Loaded = await Store.Load();
		assert.equal(Loaded.loaded, 0, "a missing store is an empty store, never a quarantine");
		const Record = Store.Created("alpha", Now);
		assert.deepEqual(
			Object.keys(Record).sort(),
			[
				"archivedAt",
				"createdAt",
				"createdBy",
				"firstSeenAt",
				"lastActivityAt",
				"lastPatchedAt",
				"lastReusedPatchGeneration",
				"lastUsedAt",
				"patchCount",
				"patchGeneration",
				"pinned",
				"state",
				"useCount",
			],
			"the thirteen fields of plan section 8.1",
		);
		assert.equal(Record.createdBy, "agent", "the curation opt-in, not an authorship claim");
		assert.equal(Record.useCount, 0);
		assert.equal(Record.patchCount, 0);
		assert.equal(Record.patchGeneration, 0);
		assert.equal(Record.lastReusedPatchGeneration, 0);
		assert.equal(Record.lastUsedAt, null);
		assert.equal(Record.lastPatchedAt, null);
		assert.equal(Record.createdAt, Now.toISOString());
		assert.equal(Record.firstSeenAt, null);
		assert.equal(Record.state, "active");
		assert.equal(Record.pinned, false);
		assert.equal(Record.archivedAt, null);
		assert.equal(Record.lastActivityAt, null, "derived at read time, and null before any activity");
	});

	await CheckAsync(Count, "U2: a use increments the count, stamps the time, and reports the first use", async () => {
		const Configuration_ = Knobs({ ...State("u2") });
		const Store = new Usage(Configuration_.storagePath);
		await Store.Load();
		Store.Created("alpha", Now);
		const First = Store.Use("alpha", Now);
		assert.equal(First.reused, false, "the first use is not a reuse");
		assert.equal(First.reuseAfterPatch, false);
		assert.equal(First.record.useCount, 1);
		assert.equal(First.record.lastUsedAt, Now.toISOString());
		const Second = Store.Use("alpha", Later);
		assert.equal(Second.reused, true);
		assert.equal(Second.record.useCount, 2);
		assert.equal(Second.reuseAfterPatch, false, "no patch landed between the two uses");
	});

	await CheckAsync(Count, "U3: the reuse watermark moves only after a patch", async () => {
		const Configuration_ = Knobs({ ...State("u3") });
		const Store = new Usage(Configuration_.storagePath);
		await Store.Load();
		Store.Created("alpha", Now);
		Store.Use("alpha", Now);
		Store.Patched("alpha", Now);
		const Third = Store.Use("alpha", Later);
		assert.equal(Third.reuseAfterPatch, true, "the skill was used again after a patch landed");
		assert.equal(Third.record.lastReusedPatchGeneration, 1);
		const Fourth = Store.Use("alpha", Later);
		assert.equal(Fourth.reuseAfterPatch, false, "the same generation is not a new reuse");
		assert.equal(Fourth.record.lastReusedPatchGeneration, 1);
	});

	await CheckAsync(Count, "U4: a patch moves the count and the generation together", async () => {
		const Configuration_ = Knobs({ ...State("u4") });
		const Store = new Usage(Configuration_.storagePath);
		await Store.Load();
		Store.Created("alpha", Now);
		const Patched = Store.Patched("alpha", Later);
		assert.equal(Patched.patchCount, 1);
		assert.equal(Patched.patchGeneration, 1, "the two move together, so a use can compare them");
		assert.equal(Patched.lastPatchedAt, Later.toISOString());
		assert.equal(Patched.lastActivityAt, Later.toISOString(), "the activity stamp is derived from the write");
	});

	await CheckAsync(Count, "U5: a create rewrites the record from zero with the curation flag", async () => {
		const Configuration_ = Knobs({ ...State("u5") });
		const Store = new Usage(Configuration_.storagePath);
		await Store.Load();
		Store.Created("alpha", Now);
		Store.Use("alpha", Now);
		Store.Patched("alpha", Now);
		const Fresh = Store.Created("alpha", Later);
		assert.equal(Fresh.createdBy, "agent");
		assert.equal(Fresh.useCount, 0, "a create is a new logical skill");
		assert.equal(Fresh.patchCount, 0);
		assert.equal(Fresh.patchGeneration, 0);
		assert.equal(Fresh.createdAt, Later.toISOString());
		assert.equal(Fresh.lastUsedAt, null);
	});

	await CheckAsync(Count, "U6: the seed, the state and the pin write only their own field", async () => {
		const Configuration_ = Knobs({ ...State("u6") });
		const Store = new Usage(Configuration_.storagePath);
		await Store.Load();
		Store.Created("alpha", Now);
		const Seeded = Store.Seeded("alpha", Now);
		assert.equal(Seeded.firstSeenAt, Now.toISOString());
		assert.equal(Seeded.state, "active", "seeding is not a transition");
		const Archived_ = Store.State("alpha", "archived", Later);
		assert.equal(Archived_?.state, "archived");
		assert.equal(Archived_?.archivedAt, Later.toISOString());
		const Active = Store.State("alpha", "active", Later);
		assert.equal(Active?.archivedAt, null, "any move to active clears the stamp");
		const Pinned = Store.Pinned("alpha", true);
		assert.equal(Pinned?.pinned, true);
		assert.equal(Store.State("ghost", "stale", Now), undefined, "an untracked name is never created");
		assert.equal(Store.Pinned("ghost", true), undefined);
	});

	await CheckAsync(Count, "U7: a corrupt store is quarantined and never overwritten", async () => {
		const Configuration_ = Knobs({ ...State("u7") });
		FileSystem.mkdirSync(Path.dirname(Configuration_.storagePath), { recursive: true });
		FileSystem.writeFileSync(Configuration_.storagePath, "{ not json", "utf8");
		const Store = new Usage(Configuration_.storagePath);
		const Loaded = await Store.Load();
		assert.equal(Loaded.loaded, 0);
		assert.equal(typeof Loaded.error, "string", "the error is reported, not swallowed");
		const Quarantine = Loaded.quarantined ?? "";
		assert.equal(Quarantine.startsWith(`${Configuration_.storagePath}.corrupt-`), true);
		assert.equal(FileSystem.existsSync(Quarantine), true, "the bytes stay on disk for inspection");
		assert.equal(FileSystem.readFileSync(Quarantine, "utf8"), "{ not json");
		assert.equal(FileSystem.existsSync(Configuration_.storagePath), false, "the store was moved, not rewritten");
		Store.Use("alpha", Now);
		const Saved = await Store.Save();
		assert.equal(Saved.ok, true, "the next write creates a fresh store");
		assert.equal(FileSystem.existsSync(Configuration_.storagePath), true);
		assert.equal(FileSystem.readFileSync(Quarantine, "utf8"), "{ not json", "and the quarantined copy is untouched");
	});

	await CheckAsync(Count, "U8: a non-object root is quarantined and a non-record entry is dropped", async () => {
		const Configuration_ = Knobs({ ...State("u8") });
		FileSystem.mkdirSync(Path.dirname(Configuration_.storagePath), { recursive: true });
		FileSystem.writeFileSync(Configuration_.storagePath, JSON.stringify(["not", "an", "object"]), "utf8");
		const Store = new Usage(Configuration_.storagePath);
		const Loaded = await Store.Load();
		assert.equal(Loaded.loaded, 0);
		assert.equal(Loaded.error, "the store root is not an object");
		assert.equal((Loaded.quarantined ?? "").includes(".corrupt-"), true);
		const Second = Knobs({ ...State("u8b") });
		FileSystem.mkdirSync(Path.dirname(Second.storagePath), { recursive: true });
		FileSystem.writeFileSync(
			Second.storagePath,
			JSON.stringify({ good: { createdAt: Now.toISOString() }, bad: 7, worse: {} }),
			"utf8",
		);
		const Mixed = new Usage(Second.storagePath);
		const MixedLoad = await Mixed.Load();
		assert.equal(MixedLoad.loaded, 1, "the record that parses is kept");
		assert.equal(MixedLoad.dropped, 2, "a non-object and a record with no creation stamp are dropped, not coerced");
	});

	await CheckAsync(Count, "U9: the save is atomic and serialized", async () => {
		const Configuration_ = Knobs({ ...State("u9") });
		const Store = new Usage(Configuration_.storagePath);
		await Store.Load();
		Store.Use("alpha", Now);
		const [Left, Right] = await Promise.all([Store.Save(), Store.Save()]);
		assert.equal(Left.ok, true, "the first save landed");
		assert.equal(Right.ok, true, "and the second ran on the same chain");
		const Directory = Path.dirname(Configuration_.storagePath);
		const Siblings = FileSystem.readdirSync(Directory);
		assert.deepEqual(
			Siblings.filter((Name) => Name.endsWith(".tmp")),
			[],
			"the temporary file is renamed, never left behind",
		);
		assert.equal(Siblings.includes("usage.json"), true);
		const Parsed: unknown = JSON.parse(FileSystem.readFileSync(Configuration_.storagePath, "utf8"));
		if (typeof Parsed !== "object" || Parsed === null || Array.isArray(Parsed)) {
			assert.fail("the store did not parse as an object");
		}
		assert.deepEqual(Object.keys(Parsed), ["alpha"], "the store holds the record it saved");
	});

	await CheckAsync(Count, "U10: identical bytes cost one blob, and a row names the digest", async () => {
		const Configuration_ = Knobs({ ...State("u10") });
		const First = await Capture("same text", Configuration_);
		const Second = await Capture("same text", Configuration_);
		assert.equal(First, Second, "the address is the content");
		assert.deepEqual(FileSystem.readdirSync(Configuration_.blobRoot), [First], "one file, not two");
		assert.equal(await Blob(First, Configuration_), "same text");
		assert.equal(await Blob("not-a-digest", Configuration_), null, "only a lowercase sha256 names a blob");
		assert.equal(await Blob("a".repeat(64), Configuration_), null, "an absent digest is null, not a throw");
		const Appended = await Append(
			{
				actor: "agent",
				action: "patch",
				skill: "alpha",
				evidence: { session: "", reason: "r", rule: "" },
				before: [{ path: "/corpus/alpha/SKILL.md", text: "same text" }],
				after: [],
			},
			Configuration_,
		);
		assert.match(Appended.id, /^[0-9a-f]{12}$/);
		const Rows_ = await Rows(Configuration_);
		assert.equal(Rows_[0]?.before[0]?.sha256, First, "the row names the address it captured");
	});

	await CheckAsync(Count, "U11: the rotation keeps `snapshotKeep` and protects the newest", async () => {
		const Configuration_ = Knobs({ ...State("u11"), snapshotKeep: 2 });
		const Fs_ = FakeFs();
		Seed(Fs_, "alpha", Body("alpha"));
		const One = await Snapshot("one", Fs_, Configuration_);
		const Two = await Snapshot("two", Fs_, Configuration_);
		const Three = await Snapshot("three", Fs_, Configuration_);
		assert.equal(
			One.id === "" || Two.id === "" || Three.id === "",
			false,
			"three captures landed",
		);
		const Protected = await Rotate([One.id], Configuration_);
		assert.deepEqual(Protected.pruned, [], "a protected id survives even outside the keep window");
		const Kept = FileSystem.readdirSync(Configuration_.snapshotRoot).filter((Name) => Name.endsWith(".json"));
		assert.equal(Kept.length, 3, "nothing was pruned");
		const Pruned = await Rotate([], Configuration_);
		assert.deepEqual(Pruned.pruned, [One.id], "the oldest is the only one outside the window");
		const Remaining = FileSystem.readdirSync(Configuration_.snapshotRoot).filter((Name) => Name.endsWith(".json"));
		assert.equal(Remaining.length, 2, "the window holds two");
		assert.equal(Remaining.includes(`${Two.id}.json`), true);
		assert.equal(Remaining.includes(`${Three.id}.json`), true, "the newest is never pruned");
		assert.equal(Remaining.includes(`${One.id}.json`), false);
	});

	return Finish(Count, "Usage-And-Ledger");
};

// Standalone entry: `node Target/Test/Usage-And-Ledger/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
