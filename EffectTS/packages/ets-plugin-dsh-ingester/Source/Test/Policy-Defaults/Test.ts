// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the
// ingester: the shared block's defaults in the schema and on the built State
// (`State.Config.policy` - the class form has no factory State), the
// override, and the writer's `approve` posture (the decision's approval IS
// the gate).
import assert from "node:assert/strict";

import { Build, Check, Finish, Ingester, MakeCounter } from "../Harness.js";

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

	Check(Count, "P1: the ingester's schema fills the D6 policy defaults", () => {
		const Config = (Ingester as any).Config({});
		assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
	});
	Check(Count, "P1: the built State carries the block on Config.policy", () => {
		const Run = Build();
		assert.deepEqual(
			(Run.Ingester as any).State.Config.policy,
			Defaults,
			"the constructor keeps the block",
		);
	});
	Check(Count, "P1: a policy override lands on the built State", () => {
		const Run = Build({ policy: { write: "auto" } });
		assert.deepEqual(
			(Run.Ingester as any).State.Config.policy,
			{ ...Defaults, write: "auto" },
			"the override replaces write and keeps the rest",
		);
	});
	Check(Count, "P1: the writer's own action class keeps the approve posture", () => {
		const Run = Build();
		assert.equal(
			(Run.Ingester as any).State.Config.policy.write,
			"approve",
			"the write waits for the decision",
		);
		assert.equal(
			(Run.Ingester as any).State.Config.policy.record,
			"auto",
			"the journal record is automatic",
		);
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
