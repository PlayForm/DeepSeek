// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the approve
// hook: the shared block's defaults in the schema and on the built State, the
// override landing on `Allow`, and the proof that the package has NO gated
// action - a record action (the bind) proceeds under the shipped defaults,
// writes no file and refuses nothing.
import assert from "node:assert/strict";

import { Decide } from "../../../../plugin-dsh-factory/Target/Library.js";

import {
	Check,
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

/** An enabled mount with the given config overrides. */
const Mount = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the schema and the State mapping.
	{
		Check(Count, "P1: the hook's schema fills the D6 policy defaults", () => {
			const Config = Validate({ logFile: Ledger });
			assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
		});
		Check(Count, "P1: the built State carries the block on Allow", () => {
			const Run = Mount();
			assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
		});
		Check(Count, "P1: a policy override lands on the built State", () => {
			const Run = Mount({ policy: { read: "approve" } });
			assert.deepEqual(
				Run.State.Allow,
				{ ...Defaults, read: "approve" },
				"the override replaces read and keeps the rest",
			);
		});
	}

	// Group P2: the package has no gated action.
	{
		const Run = Mount();
		Check(Count, "P2: the record verdict is auto and the mount writes no policy line", () => {
			assert.equal(Decide(Run.State.Allow, "record"), "auto", "record is automatic");
			assert.equal(LinesWith(Run, "policy").length, 0, "no policy line");
			assert.equal(LinesWith(Run, "held").length, 0, "no held line");
		});
	}

	// Group P3: a record action still proceeds under the shipped defaults.
	{
		const Run = Mount();
		const Bound = Run.Context.workspaceApprove.bind({
			path: "/repo/a.ts",
			fingerprint: "fp-1",
			version: "1",
			constraints: ["no tests"],
			summary: "the change set",
		});
		Check(Count, "P3: the bind records under the defaults, refuses nothing and writes no file", () => {
			assert.equal(Bound.id, "ap-1");
			assert.equal(Bound.decision, "pending");
			assert.deepEqual(LinesWith(Run, "bound"), [
				"approve: bound ap-1 /repo/a.ts fingerprint fp-1",
			]);
			assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line");
			assert.equal(Run.Fs.writes.length, 0, "no write reaches the filesystem");
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
