// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the
// workspace-govern hook: the shared block's defaults in the schema under the
// `automation` key (this hook's `policy` is the decision rule table) and on
// the built State (`Allow` - the factory's shared `Policy` is the global
// policy file path), the override, the package's no-gated-action posture, and
// the gate decision still proceeding under the shipped defaults with zero
// file writes.
import assert from "node:assert/strict";

import { Decide } from "../../../../plugin-dsh-factory/Target/Library.js";

import {
	Check,
	Finish,
	Ledger,
	LinesWith,
	Make,
	MakeCounter,
	Proposal,
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

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the schema and the State mapping.
	{
		Check(Count, "P1: the hook's schema fills the D6 policy defaults on automation", () => {
			const Config = Validate({ logFile: Ledger, enabled: true });
			assert.deepEqual(
				Config.automation.get(),
				Defaults,
				"the composed block carries the defaults",
			);
			assert.deepEqual(
				Config.policy.get(),
				[],
				"the decision rule table stays a separate key",
			);
		});
		Check(Count, "P1: the built State carries the block on Allow", () => {
			const Run = Make(Validate({ logFile: Ledger, enabled: true }));
			assert.deepEqual(Run.State.Allow, Defaults, "the apply maps automation -> Allow");
		});
		Check(Count, "P1: a policy override lands on the built State", () => {
			const Run = Make(
				Validate({ logFile: Ledger, enabled: true, automation: { read: "approve" } }),
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
			assert.equal(LinesWith(Run, "held").length, 0, "no held line");
			assert.deepEqual(
				Run.Lines.filter((Line: string) => Line.includes("policy")),
				["govern: activated (tools=4, policy=0)"],
				"the only policy mention is the rule-table count in the activation proof",
			);
		});
	}

	// Group P3: the gate decision still proceeds under the shipped defaults.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		const Decision = Run.Context.workspaceGovern.gate(Proposal());
		Check(Count, "P3: the gate proceeds under the defaults and writes no file", () => {
			assert.equal(Decision.decision, "pass", "the decision is recorded");
			assert.equal(LinesWith(Run, "denied").length, 0, "no refusal line");
			assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line");
			assert.equal(LinesWith(Run, "held").length, 0, "no held line");
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
