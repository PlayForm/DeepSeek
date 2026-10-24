// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the
// batch-state board: the shared block's defaults in the schema and on the
// built State (`Allow` - the factory's shared `Policy` is the global policy
// file path), the override, and the recorder posture.
import assert from "node:assert/strict";

import { Check, Finish, Ledger, Make, MakeCounter, StateFile, Validate } from "../Harness.js";

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

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	Check(Count, "P1: the board's schema fills the D6 policy defaults", () => {
		const Config = Validate({ logFile: Ledger, stateFile: StateFile });
		assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
	});
	Check(Count, "P1: the built State carries the block on Allow", () => {
		const Run = Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile }));
		assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
	});
	Check(Count, "P1: a policy override lands on the built State", () => {
		const Run = Make(
			Validate({
				logFile: Ledger,
				enabled: true,
				stateFile: StateFile,
				policy: { suggest: "approve" },
			}),
		);
		assert.deepEqual(
			Run.State.Allow,
			{ ...Defaults, suggest: "approve" },
			"the override replaces suggest and keeps the rest",
		);
	});
	Check(Count, "P1: the board's own action classes are automatic", () => {
		const Run = Make(Validate({ logFile: Ledger, enabled: true, stateFile: StateFile }));
		assert.equal(Run.State.Allow.read, "auto", "the board read is automatic");
		assert.equal(Run.State.Allow.record, "auto", "the state record is automatic");
		assert.equal(Run.State.Allow.write, "approve", "the board never writes");
	});

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
