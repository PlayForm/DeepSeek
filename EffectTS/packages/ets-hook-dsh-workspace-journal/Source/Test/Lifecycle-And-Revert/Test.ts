// Source/Test/Lifecycle-And-Revert/Test.ts - the open/seal/revert/recover
// lifecycle against the real built library: the journal-before-writes open,
// the seal transitions and their refusals, the byte-exact lifecycle ledger
// lines (logger and durable), the bounded ring cap with its eviction line,
// the truncated pre-image skip, the version-fenced revert with its conflict
// arms, and the boot recovery pass.
import assert from "node:assert/strict";
import {
	Boot,
	Batch,
	Check,
	CheckAsync,
	Entry,
	Finish,
	Fire,
	Ledger,
	LedgerLines,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount; optional fs seeds and config overrides. The D6
 *  policy gate is OPENED here (`write: auto`) because this folder exercises
 *  the revert; the shipped `write: approve` is arbitrated by
 *  `Source/Test/Policy-Defaults`. */
const Setup = async (
	Config: Record<string, unknown> = {},
	Files: Record<string, string> = {},
	Stale: string[] = [],
): Promise<any> => {
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, policy: { write: "auto" }, ...Config }));
	Run.Fs.files = Files;
	for (const Path of Stale) {
		Run.Fs.staleOn.add(Path);
	}
	await Boot();
	return Run;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the open path.
	{
		const Run = await Setup({}, { "/a": "1" });
		await CheckAsync(Count, "L1: open records the batch and the entries before any write", async () => {
			await Run.Context.workspaceJournal.open(
				{ batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
				[
					{ path: "/a", state: "present", version: "1", content: "A" },
					{ path: "/b", state: "absent", version: "absent", content: "" },
				],
			);
			assert.equal(Run.State.Batches.get("b1").state, "applying");
			assert.equal(Run.State.Entries.get("b1:/a").state, "present");
			assert.equal(Run.State.Entries.get("b1:/b").state, "absent");
			assert.deepEqual(Run.State.Ring, ["b1"]);
		});
		Check(Count, "L1: the open line is byte-exact", () => {
			assert.deepEqual(LinesWith(Run, "opened b1"), ["journal: opened b1 (2 files)"]);
			assert.deepEqual(
				LedgerWith("opened b1 (2 files)"),
				LedgerLines().filter((Line) => Line.endsWith("opened b1 (2 files)")),
			);
		});
		Check(Count, "L1: the queries read the open batch", () => {
			const Stats = Run.Context.workspaceJournal.statistics();
			assert.deepEqual(Stats, { batches: 1, entries: 2, applying: 1 });
			assert.equal(Run.Context.workspaceJournal.batch("b1").progress, 0);
			assert.deepEqual(
				Run.Context.workspaceJournal.entries("b1").map((E: any) => E.path),
				["/a", "/b"],
			);
			assert.deepEqual(
				Run.Context.workspaceJournal.batches().map((B: any) => B.batchId),
				["b1"],
			);
		});
	}

	// Group L2: the seal path.
	{
		const Run = await Setup();
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a"] },
			[{ path: "/a", state: "present", version: "1", content: "A" }],
		);
		await CheckAsync(Count, "L2: seal verified closes the applying batch byte-exactly", async () => {
			const Sealed = await Run.Context.workspaceJournal.seal("b1", "verified");
			assert.equal(Sealed.state, "verified");
			assert.deepEqual(LinesWith(Run, "sealed b1"), ["journal: sealed b1 verified"]);
		});
		await CheckAsync(Count, "L2: sealing a terminal batch is refused with the byte-exact line", async () => {
			await assert.rejects(
				() => Run.Context.workspaceJournal.seal("b1", "recovery-required", "late"),
				/batch b1 is verified, not applying/,
			);
			assert.deepEqual(LinesWith(Run, "seal failed b1"), [
				"journal: seal failed b1 (state verified, not applying)",
			]);
		});
		await CheckAsync(Count, "L2: sealing an unknown batch is refused byte-exactly", async () => {
			await assert.rejects(() => Run.Context.workspaceJournal.seal("b9", "verified"), /unknown batch: b9/);
			assert.deepEqual(LinesWith(Run, "seal failed b9"), [
				"journal: seal failed b9 (unknown batch)",
			]);
		});
	}

	// Group L3: the revert path (the fenced replay).
	{
		const Run = await Setup({}, { "/a": "1" });
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
			[
				{ path: "/a", state: "present", version: "1", content: "ORIGINAL" },
				{ path: "/b", state: "absent", version: "absent", content: "" },
			],
		);
		await CheckAsync(Count, "L3: the revert replays backward with the per-file report", async () => {
			const Report = await Run.Context.workspaceJournal.revert("b1");
			assert.deepEqual(
				Report.files.map((F: any) => [F.path, F.action]),
				[
					["/b", "removed"],
					["/a", "restored"],
				],
			);
		});
		Check(Count, "L3: the absent pre-image is removed and ledgered byte-exactly", () => {
			assert.ok(LinesWith(Run, "reverted b1 /b (already absent)").length === 1);
		});
		Check(Count, "L3: the restored pre-image goes through the fenced write and is ledgered byte-exactly", () => {
			assert.ok(LinesWith(Run, "reverted b1 /a (fence ok)").length === 1);
			assert.equal(Run.Fs.writes.length, 1);
			assert.equal(Run.Fs.writes[0][1], "ORIGINAL");
			assert.equal(Run.Fs.writes[0][2].kind, "replaceIfVersion");
			assert.equal(Run.Fs.writes[0][2].version, "1");
		});
		Check(Count, "L3: the summary line is byte-exact and the batch is terminal", () => {
			assert.deepEqual(LinesWith(Run, "reverted b1 ("), ["journal: reverted b1 (2 files)"]);
			assert.equal(Run.State.Batches.get("b1").state, "reverted");
		});
	}

	// Group L4: the revert's refusal and conflict arms.
	{
		const Run = await Setup({}, { "/a": "1" }, ["/a"]);
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a"] },
			[{ path: "/a", state: "present", version: "1", content: "A" }],
		);
		await CheckAsync(Count, "L4: a stale-version write is a conflict, never a silent overwrite", async () => {
			const Report = await Run.Context.workspaceJournal.revert("b1");
			assert.deepEqual(Report.files, [
				{ path: "/a", action: "conflict", reason: "version fence failed" },
			]);
			assert.deepEqual(LinesWith(Run, "conflict: version fence failed"), [
				"journal: reverted b1 /a (conflict: version fence failed)",
			]);
			assert.equal(Run.Fs.writes.length, 1);
		});
	}
	{
		const Run = await Setup({}, {});
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a"] },
			[{ path: "/a", state: "present", version: "1", content: "A" }],
		);
		await CheckAsync(Count, "L4: a vanished file is a conflict (no restore onto absence)", async () => {
			const Report = await Run.Context.workspaceJournal.revert("b1");
			assert.deepEqual(Report.files, [
				{ path: "/a", action: "conflict", reason: "file now absent" },
			]);
			assert.deepEqual(LinesWith(Run, "conflict: file now absent"), [
				"journal: reverted b1 /a (conflict: file now absent, expected content)",
			]);
		});
	}
	{
		const Run = await Setup({ maxEntryBytes: 1 });
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a"] },
			[{ path: "/a", state: "present", version: "1", content: "TOOLONG" }],
		);
		await CheckAsync(Count, "L4: a truncated pre-image is skipped, never half-applied", async () => {
			assert.equal(Run.State.Entries.get("b1:/a").truncated, true);
			assert.equal(Run.State.Entries.get("b1:/a").content, "");
			const Report = await Run.Context.workspaceJournal.revert("b1");
			assert.deepEqual(Report.files, [
				{ path: "/a", action: "skipped", reason: "truncated pre-image" },
			]);
			assert.deepEqual(LinesWith(Run, "skipped: pre-image over maxEntryBytes"), [
				"journal: reverted b1 /a (skipped: pre-image over maxEntryBytes)",
			]);
			assert.equal(Run.Fs.writes.length, 0);
		});
	}
	{
		const Run = await Setup();
		await CheckAsync(Count, "L4: reverting an unknown batch is refused byte-exactly", async () => {
			await assert.rejects(() => Run.Context.workspaceJournal.revert("b9"), /unknown batch: b9/);
			assert.deepEqual(LinesWith(Run, "revert failed b9"), [
				"journal: revert failed b9 (unknown batch)",
			]);
		});
	}
	{
		const Run = await Setup();
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a"] },
			[{ path: "/a", state: "present", version: "1", content: "A" }],
		);
		await Run.Context.workspaceJournal.seal("b1", "recovery-required", "crash");
		await CheckAsync(Count, "L4: a recovery-required batch is not reversible", async () => {
			await assert.rejects(
				() => Run.Context.workspaceJournal.revert("b1"),
				/batch b1 is recovery-required, not reversible/,
			);
			assert.deepEqual(LinesWith(Run, "revert failed b1"), [
				"journal: revert failed b1 (state recovery-required, not reversible)",
			]);
		});
	}

	// Group L5: the ring cap.
	{
		const Run = await Setup({ maxBatches: 2 });
		for (const Id of ["b1", "b2", "b3"]) {
			await Run.Context.workspaceJournal.open(
				{ batchId: Id, operation: "workspace.commit", files: [`/${Id}`] },
				[Entry(Id, `/${Id}`)],
			);
		}
		Check(Count, "L5: the ring caps at maxBatches and the eviction is ledgered byte-exactly", () => {
			assert.deepEqual(Run.State.Ring, ["b2", "b3"]);
			assert.deepEqual(LinesWith(Run, "capped b1"), ["journal: capped b1 (maxBatches 2)"]);
			assert.equal(Run.Context.workspaceJournal.batch("b1"), undefined);
			assert.equal(Run.Context.workspaceJournal.statistics().batches, 2);
		});
	}

	// Group L6: the recovery checkpoint and the boot pass.
	{
		const Run = await Setup();
		await Run.Context.workspaceJournal.open(
			{ batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
			[Entry("b1", "/a"), Entry("b1", "/b")],
		);
		Fire(Run, "/a");
		Check(Count, "L6: an observed write on an applying batch advances progress byte-exactly", () => {
			assert.equal(Run.State.Batches.get("b1").progress, 1);
			assert.deepEqual(LinesWith(Run, "observed /a in b1"), [
				"journal: observed /a in b1 (progress 1)",
			]);
		});
		Fire(Run, "/b");
		await CheckAsync(Count, "L6: the boot pass marks applying batches recovery-required byte-exactly", async () => {
			const Report = await Run.Context.workspaceJournal.recover();
			assert.deepEqual(Report, { batchIds: ["b1"] });
			assert.equal(Run.State.Batches.get("b1").state, "recovery-required");
			assert.equal(
				Run.State.Batches.get("b1").reason,
				"applying at boot with 2/2 writes observed",
			);
			assert.deepEqual(LinesWith(Run, "recovery-required b1"), [
				"journal: recovery-required b1 (applying at boot with 2/2 writes observed)",
			]);
		});
		await CheckAsync(Count, "L6: a second pass reports nothing (no double-marking)", async () => {
			const Report = await Run.Context.workspaceJournal.recover();
			assert.deepEqual(Report, { batchIds: [] });
		});
	}
	{
		const Run = await Setup();
		// The direct record fixture proves the Recover module reads the raw
		// state, not the service's open path.
		Run.State.Batches.set("z1", Batch("z1", ["/x"]));
		Run.State.Batches.get("z1").progress = 0;
		await CheckAsync(Count, "L6: a zero-progress applying batch is marked with 0/1", async () => {
			await Run.Context.workspaceJournal.recover();
			assert.equal(Run.State.Batches.get("z1").state, "recovery-required");
			assert.deepEqual(LinesWith(Run, "recovery-required z1"), [
				"journal: recovery-required z1 (applying at boot with 0/1 writes observed)",
			]);
		});
	}
	return Finish(Count, "Lifecycle-And-Revert");
};

// Standalone entry: `node Target/Test/Lifecycle-And-Revert/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Lifecycle-And-Revert`);
}
