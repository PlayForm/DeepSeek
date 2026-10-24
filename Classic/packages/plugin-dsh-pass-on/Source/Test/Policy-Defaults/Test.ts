// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the pass-on:
// the shared block's defaults in the schema and on the built State
// (`State.Config.policy` - the class form has no factory State), the
// override, and the read-only posture (read/suggest automatic, the write path
// never taken).
import assert from "node:assert/strict";

import { Check, Finish, Make, MakeCounter, Validate } from "../Harness.js";

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

	Check(Count, "P1: the pass-on's schema fills the D6 policy defaults", () => {
		const Config = Validate();
		assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
	});
	Check(Count, "P1: the built State carries the block on Config.policy", () => {
		const Run = Make();
		assert.deepEqual(Run.State.Config.policy, Defaults, "the constructor keeps the block");
	});
	Check(Count, "P1: a policy override lands on the built State", () => {
		const Run = Make({ policy: { suggest: "approve" } });
		assert.deepEqual(
			Run.State.Config.policy,
			{ ...Defaults, suggest: "approve" },
			"the override replaces suggest and keeps the rest",
		);
	});
	Check(Count, "P1: the pass-on's own action classes are automatic", () => {
		const Run = Make();
		assert.equal(Run.State.Config.policy.read, "auto", "the target read is automatic");
		assert.equal(Run.State.Config.policy.suggest, "auto", "the proposal is automatic");
		assert.equal(Run.State.Config.policy.write, "approve", "the pass-on never writes");
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
