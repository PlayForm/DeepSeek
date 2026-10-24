// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the journal
// hook: the shared block's defaults in the schema and on the built State, the
// `approve` verdict HOLDING the revert with the documented line, zero writes,
// an unchanged batch state and no record, the `auto` verdict replaying, and
// the rule that only the `write` key opens this gate.
//
// The mount keeps the SHIPPED `write: approve`; a scenario that wants the
// gate open passes `policy: { write: "auto" }` explicitly.
import assert from "node:assert/strict";

import {
	Boot,
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LinesWith,
	Make,
	MakeCounter,
	rm,
	Validate,
} from "../Harness.js";

/** The D6 defaults, written out (the contract, not a mirror). */
const Defaults = {
	read: "auto",
	index: "auto",
	record: "auto",
	suggest: "auto",
	write: "approve",
	commit: "approve",
	spawn: "approve",
	message: "auto",
};

/** An enabled mount with the given config overrides (the policy defaults
 *  unless the scenario opens the gate), with one seeded file. */
const Mount = async (Config: Record<string, unknown> = {}): Promise<any> => {
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
	Run.Fs.files = { "/a": "1" };
	await Boot();
	return Run;
};

/** Journal one two-file batch (the revert data for the scenarios). */
const Open = async (Run: any): Promise<void> => {
	await Run.Context.workspaceJournal.open(
		{ batchId: "b1", operation: "workspace.commit", files: ["/a", "/b"] },
		[
			{ path: "/a", state: "present", version: "1", content: "ORIGINAL" },
			{ path: "/b", state: "absent", version: "absent", content: "" },
		],
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the schema and the State mapping.
	{
		Check(Count, "P1: the hook's schema fills the D6 policy defaults", () => {
			const Config = Validate({ logFile: Ledger });
			assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
		});
		await CheckAsync(Count, "P1: the built State carries the block on Allow", async () => {
			const Run = await Mount();
			assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
		});
		await CheckAsync(Count, "P1: a policy override lands on the built State", async () => {
			const Run = await Mount({ policy: { write: "auto" } });
			assert.deepEqual(
				Run.State.Allow,
				{ ...Defaults, write: "auto" },
				"the override replaces write and keeps the rest",
			);
		});
	}

	// Group P2: the approve verdict HOLDS the revert (zero writes).
	{
		const Run = await Mount();
		await Open(Run);
		await CheckAsync(Count, "P2: an approve verdict refuses the revert with the exact line", async () => {
			await assert.rejects(
				() => Run.Context.workspaceJournal.revert("b1"),
				/batch b1 is held by the policy \(write=approve\)/,
			);
			assert.deepEqual(LinesWith(Run, "revert held"), [
				"journal: revert held (2 files) (policy write=approve)",
			]);
		});
		await CheckAsync(Count, "P2: ZERO writes, no state change and no revert record", async () => {
			assert.equal(Run.Fs.writes.length, 0, "no write reaches the filesystem");
			assert.equal(Run.Fs.resolved.length, 0, "no target is even resolved");
			assert.equal(Run.State.Batches.get("b1").state, "applying", "the batch stays reversible");
			assert.equal(LinesWith(Run, "reverted").length, 0, "no replay line at all");
		});
	}

	// Group P3: the auto verdict proceeds (the same mount, gate open).
	{
		const Run = await Mount({ policy: { write: "auto" } });
		await Open(Run);
		const Report = await Run.Context.workspaceJournal.revert("b1");
		await CheckAsync(Count, "P3: an auto verdict replays the batch backward", async () => {
			assert.deepEqual(
				Report.files.map((File: any) => [File.path, File.action]),
				[
					["/b", "removed"],
					["/a", "restored"],
				],
			);
			assert.deepEqual(LinesWith(Run, "reverted b1 ("), ["journal: reverted b1 (2 files)"]);
			assert.equal(Run.Fs.writes.length, 1, "the one present pre-image is written back");
			assert.equal(LinesWith(Run, "revert held").length, 0, "no held line when the gate is open");
		});
	}

	// Group P4: only the write key opens this gate.
	{
		const Run = await Mount({ policy: { commit: "auto" } });
		await Open(Run);
		await CheckAsync(Count, "P4: a commit override never opens the revert gate", async () => {
			await assert.rejects(
				() => Run.Context.workspaceJournal.revert("b1"),
				/batch b1 is held by the policy \(write=approve\)/,
			);
			assert.ok(
				LinesWith(Run, "revert held").includes(
					"journal: revert held (2 files) (policy write=approve)",
				),
				"the documented held line",
			);
			assert.equal(Run.Fs.writes.length, 0, "still zero writes");
		});
	}

	return Finish(Count, "Policy-Defaults");
};

// Standalone entry: `node Target/Test/Policy-Defaults/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Policy-Defaults`);
}
