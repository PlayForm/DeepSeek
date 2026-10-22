// Source/Test/Commit-And-Replies/Test.ts - the per-file commits through the
// factory's shared write executor and the commit reply union: the applied
// happy path with its byte-exact lines, the survivors-mode conflict, the
// mid-batch interruption with recovery-required states, the sandbox/policy
// denial, the honest outcome-unknown, and the read-back verification rule.
import assert from "node:assert/strict";
import {
	CheckAsync,
	Finish,
	Ledger,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount with overrides and optional fs faults. */
const Setup = (
	Config: Record<string, unknown> = {},
	Faults: { write?: string; read?: string; tamper?: string } = {},
): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }), Faults);
};

/** Drive one folder's checks. */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group C1: the applied happy path.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceMerge;
		await CheckAsync(Count, "C1: a two-file commit applies both files through the write executor", async () => {
			const Reply = await Service.commit({
				id: "b1",
				operations: [
					{ path: "/repo/src/a.ts", content: "one\n", version: "v1" },
					{ path: "/repo/src/b.ts", content: "two\n", version: "v1" },
				],
			});
			assert.deepEqual(Reply, {
				id: "b1",
				status: "applied",
				replies: [
					{ path: "/repo/src/a.ts", status: "applied", version: "v2" },
					{ path: "/repo/src/b.ts", status: "applied", version: "v2" },
				],
			});
		});
		await CheckAsync(Count, "C1: the started, applied and complete lines are byte-exact", async () => {
			assert.deepEqual(LinesWith(Run, "b1"), [
				"merge: batch b1 started (2 files, 8 bytes)",
				"merge: applied /repo/src/a.ts version v2 (batch b1)",
				"merge: applied /repo/src/b.ts version v2 (batch b1)",
				"merge: batch b1 complete (applied 2, conflict 0, denied 0, recovery 0, unknown 0)",
			]);
			assert.equal(
				LedgerWith("batch b1 complete (applied 2, conflict 0, denied 0, recovery 0, unknown 0)")
					.length,
				1,
			);
		});
		await CheckAsync(Count, "C1: each write carried the explicit replaceIfVersion intent", async () => {
			assert.equal(Run.Fs.writes.length, 2);
			assert.equal(Run.Fs.writes[0][2].kind, "replaceIfVersion");
			assert.equal(Run.Fs.writes[0][2].version, "v1");
		});
		await CheckAsync(Count, "C1: each applied write emitted fs/observed on the root", async () => {
			assert.equal(Run.Emitted.length, 2);
			assert.deepEqual(Run.Emitted[0][0], "fs/observed");
			assert.deepEqual(Run.Emitted[0][2], { kind: "present", version: "v2" });
		});
		await CheckAsync(Count, "C1: the record and the statistics are honest", async () => {
			assert.equal(Service.batch("b1").status, "applied");
			assert.deepEqual(Service.statistics(), {
				batches: 1,
				applied: 2,
				conflicts: 0,
				rejected: 0,
				recovery: 0,
				sequence: 1,
			});
		});
	}

	// Group C2: the survivors-mode conflict.
	{
		const Run = Setup({ mode: "survivors" });
		await CheckAsync(Count, "C2: a conflicting file is per-file replied and the batch continues", async () => {
			const Reply = await Run.Context.workspaceMerge.commit({
				id: "b2",
				operations: [
					{ path: "/repo/src/stale.ts", content: "x\n", version: "v1" },
					{ path: "/repo/src/a.ts", content: "one\n", version: "v1" },
				],
			});
			assert.deepEqual(Reply.replies, [
				{
					path: "/repo/src/stale.ts",
					status: "conflict",
					expected: "v1",
					observed: "v2",
					reason: "the fence contradicts the file version",
				},
				{ path: "/repo/src/a.ts", status: "applied", version: "v2" },
			]);
			assert.equal(Reply.status, "applied");
			assert.deepEqual(LinesWith(Run, "conflict /repo/src/stale.ts"), [
				"merge: conflict /repo/src/stale.ts (expected v1, observed v2)",
			]);
		});
	}

	// Group C3: the mid-batch interruption (all-or-nothing).
	{
		const Run = Setup({}, { write: "version conflict: the file moved" });
		await CheckAsync(Count, "C3: a mid-batch failure marks the remaining files recovery-required", async () => {
			const Reply = await Run.Context.workspaceMerge.commit({
				id: "b3",
				operations: [
					{ path: "/repo/src/a.ts", content: "one\n", version: "v1" },
					{ path: "/repo/src/b.ts", content: "two\n", version: "v1" },
				],
			});
			assert.equal(Reply.status, "partial");
			assert.deepEqual(Reply.replies[0].status, "conflict");
			assert.deepEqual(Reply.replies[1].status, "recovery-required");
			assert.deepEqual(LinesWith(Run, "recovery-required"), [
				"merge: recovery-required /repo/src/b.ts (batch b3)",
			]);
			assert.equal(Run.Fs.writes.length, 1);
		});
	}

	// Group C4: the sandbox/policy denial.
	{
		const Run = Setup({}, { write: "write denied by policy" });
		await CheckAsync(Count, "C4: a policy refusal is a denied reply, not a guess", async () => {
			const Reply = await Run.Context.workspaceMerge.commit({
				id: "b4",
				operations: [{ path: "/repo/src/a.ts", content: "one\n", version: "v1" }],
			});
			assert.equal(Reply.status, "partial");
			assert.deepEqual(Reply.replies, [
				{
					path: "/repo/src/a.ts",
					status: "denied",
					expected: "v1",
					reason: "write denied by policy",
				},
			]);
			assert.deepEqual(LinesWith(Run, "denied /repo/src/a.ts"), [
				"merge: denied /repo/src/a.ts (write denied by policy)",
			]);
		});
	}

	// Group C5: the honest outcome-unknown.
	{
		const Run = Setup({}, { write: "the disk exploded" });
		await CheckAsync(Count, "C5: an unmappable write failure is an outcome-unknown reply", async () => {
			const Reply = await Run.Context.workspaceMerge.commit({
				id: "b5",
				operations: [{ path: "/repo/src/a.ts", content: "one\n", version: "v1" }],
			});
			assert.equal(Reply.status, "partial");
			assert.deepEqual(Reply.replies, [
				{
					path: "/repo/src/a.ts",
					status: "outcome-unknown",
					expected: "v1",
					observed: "v1",
					reason: "the disk exploded",
				},
			]);
			assert.deepEqual(LinesWith(Run, "outcome-unknown"), [
				"merge: outcome-unknown /repo/src/a.ts (batch b5)",
			]);
		});
	}

	// Group C6: the read-back verification rule.
	{
		const Run = Setup({}, { read: "read fault" });
		await CheckAsync(Count, "C6: a failed verification read is an outcome-unknown, never a guess", async () => {
			const Reply = await Run.Context.workspaceMerge.commit({
				id: "b6",
				operations: [{ path: "/repo/src/a.ts", content: "one\n", version: "v1" }],
			});
			assert.deepEqual(Reply.replies[0].status, "outcome-unknown");
			assert.equal(
				Reply.replies[0].reason,
				"the verification read failed: read fault",
			);
			assert.deepEqual(LinesWith(Run, "outcome-unknown"), [
				"merge: outcome-unknown /repo/src/a.ts (batch b6)",
			]);
		});
		{
			const Run2 = Setup({}, { tamper: "tampered\n" });
			await CheckAsync(Count, "C6: applied bytes that differ from the intent are a conflict", async () => {
				const Reply = await Run2.Context.workspaceMerge.commit({
					id: "b7",
					operations: [{ path: "/repo/src/a.ts", content: "one\n", version: "v1" }],
				});
				assert.deepEqual(Reply.replies[0].status, "conflict");
				assert.equal(
					Reply.replies[0].reason,
					"the applied bytes differ from the intended content",
				);
			});
		}
	}
	return Finish(Count, "Commit-And-Replies");
};

// Standalone entry: `node Target/Test/Commit-And-Replies/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Commit-And-Replies`);
}
