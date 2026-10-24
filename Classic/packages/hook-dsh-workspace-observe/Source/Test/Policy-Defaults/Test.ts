// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the
// workspace-observe hook: the shared block's defaults in the schema and on
// the built State (`Allow` - the factory's shared `Policy` is the global
// policy file path), the override, the package's no-gated-action posture, and
// the RECORD action still proceeding under the shipped defaults with zero
// file writes.
import assert from "node:assert/strict";

import { Decide } from "../../../../plugin-dsh-factory/Target/Library.js";

import { Check, Finish, Fire, Ledger, LinesWith, Make, MakeCounter, rm, Validate } from "../Harness.js";

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

	// Group P1: the schema and the State mapping.
	{
		Check(Count, "P1: the hook's schema fills the D6 policy defaults", () => {
			const Config = Validate({ logFile: Ledger, enabled: true });
			assert.deepEqual(Config.policy.get(), Defaults, "the composed block carries the defaults");
		});
		Check(Count, "P1: the built State carries the block on Allow", () => {
			const Run = Make(Validate({ logFile: Ledger, enabled: true }));
			assert.deepEqual(Run.State.Allow, Defaults, "the apply maps policy -> Allow");
		});
		Check(Count, "P1: a policy override lands on the built State", () => {
			const Run = Make(
				Validate({ logFile: Ledger, enabled: true, policy: { read: "approve" } }),
			);
			assert.deepEqual(
				Run.State.Allow,
				{ ...Defaults, read: "approve" },
				"the override replaces read and keeps the rest",
			);
		});
	}

	// Group P2: the package has no gated action.
	{
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Check(Count, "P2: the hook has no gated action (record is automatic)", () => {
			assert.equal(Decide(Run.State.Allow, "record"), "auto", "the record class is automatic");
			assert.equal(LinesWith(Run, "policy").length, 0, "no policy line");
			assert.equal(LinesWith(Run, "held").length, 0, "no held line");
		});
	}

	// Group P3: the record still proceeds under the shipped defaults.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Fire(Run, "/repo/src/a.ts", "1");
		Check(Count, "P3: the record proceeds under the defaults and writes no file", () => {
			assert.equal(
				Run.State.Latest.get("/repo/src/a.ts")?.version,
				"1",
				"the stamp is recorded",
			);
			assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line");
			assert.equal(Run.Fs.writes.length, 0, "zero file writes");
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
