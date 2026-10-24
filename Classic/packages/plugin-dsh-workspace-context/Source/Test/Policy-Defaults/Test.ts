// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the
// workspace-context service: the shared block's defaults in the schema and on
// the built State, the per-key override landing on `State.Allow`, the proof
// that the package has NO gated action (every action class it uses decides
// "auto" and the mount writes no policy/held line), and a representative
// read-only packet build still proceeding under the shipped defaults while
// writing no file.
//
// The context service is a pure reader: no gate, no Decide call in the plugin
// itself. The block is the shared posture, and this folder proves it is real
// config, not dead text.
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

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the schema and the State mapping.
	{
		Check(Count, "P1: the context's schema fills the D6 policy defaults", () => {
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

	// Group P2: the package has NO gated action.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Check(Count, "P2: the context's action classes all decide auto", () => {
			assert.equal(Decide(Run.State.Allow, "read"), "auto", "read is automatic");
			assert.equal(Decide(Run.State.Allow, "index"), "auto", "index is automatic");
			assert.equal(Decide(Run.State.Allow, "record"), "auto", "record is automatic");
			assert.equal(LinesWith(Run, "policy").length, 0, "no policy line");
			assert.equal(LinesWith(Run, "held").length, 0, "no held line");
		});
	}

	// Group P3: a representative read-only action proceeds and writes no file.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Check(Count, "P3: the packet still builds under the shipped defaults and writes no file", () => {
			const Packet = Run.Context.workspaceContext.packet({});
			assert.equal(Packet.workspace, "WORKSPACE workspace @ unknown", "the packet is produced");
			assert.ok(Packet.tokens > 0, "the packet carries a token estimate");
			assert.deepEqual(Packet.open, [
				"workspace graph unavailable (the sibling index has not been probed)",
			]);
			assert.equal(
				Run.Lines.some((Line: string) => Line.includes("disabled")),
				false,
				"no refusal line",
			);
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
