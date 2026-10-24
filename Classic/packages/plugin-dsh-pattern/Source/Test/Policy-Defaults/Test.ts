// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the pattern
// service: the shared block's defaults in the schema and in the service's
// knobs (`Knobs.policy`), the override, and the registry's read/record
// posture.
import assert from "node:assert/strict";

import { Check, Finish, Make, MakeCounter, PatternService } from "../Harness.js";

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

	Check(Count, "P1: the service's schema fills the D6 policy defaults", () => {
		const Config = (PatternService as any).Config({});
		assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
	});
	Check(Count, "P1: a bare construction carries the D6 block in the knobs", () => {
		const Run = Make();
		assert.deepEqual((Run.Service as any).Knobs.policy, Defaults, "the bare default is the D6 table");
	});
	Check(Count, "P1: a policy override lands in the knobs", () => {
		const Run = Make({ policy: { record: "approve" } });
		assert.deepEqual(
			(Run.Service as any).Knobs.policy,
			{ ...Defaults, record: "approve" },
			"the override replaces record and keeps the rest",
		);
	});
	Check(Count, "P1: the registry's own action classes are automatic", () => {
		const Run = Make();
		assert.equal((Run.Service as any).Knobs.policy.read, "auto", "the match read is automatic");
		assert.equal((Run.Service as any).Knobs.policy.record, "auto", "the outcome record is automatic");
		assert.equal((Run.Service as any).Knobs.policy.write, "approve", "the service never writes");
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
