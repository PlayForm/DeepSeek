// Source/Test/Policy-Defaults/Test.ts - THE POLICY BLOCK (D6) on the
// authority service: the shared block's defaults in the schema and on the
// built State (`Allow`), the per-action override, and the service's
// read-only/record posture - its own action classes are automatic, so it has
// NO gated action and no verdict can refuse a call.
//
// The D6 key is `automation`, NOT `policy`: this package's `policy` is
// already the residency RULE TABLE (kind -> disposition), a different
// contract (the plugin-dsh-route precedent).
//
// The representative actions are `grant` (the record class) and `authorize`
// (the read class): the cheapest real calls in the service's surface, which
// prove the automatic posture lets a record proceed and that the call
// touches no file content.
import assert from "node:assert/strict";

import { Decide } from "../../../../ets-plugin-dsh-factory/Target/Library.js";
import { Check, Finish, LinesWith, Make, MakeCounter, Validate, rm } from "../Harness.js";

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

/** An enabled service with an empty ledger (the ledger path never writes). */
const Setup = (Raw: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: "/nonexistent/authority.log", enabled: true, ...Raw }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the schema and the State mapping.
	{
		Check(Count, "P1: the authority schema fills the D6 policy defaults", () => {
			const Config = Validate({ logFile: "/nonexistent/authority.log", enabled: true });
			assert.deepEqual(
				Config.automation.get(),
				Defaults,
				"the composed block carries the defaults",
			);
		});
		Check(Count, "P1: the built State carries the block on Allow", () => {
			const Run = Setup();
			assert.deepEqual(Run.State.Allow, Defaults, "the apply maps automation -> Allow");
		});
		Check(Count, "P1: a policy override lands on the built State", () => {
			const Run = Setup({ automation: { read: "approve" } });
			assert.deepEqual(
				Run.State.Allow,
				{ ...Defaults, read: "approve" },
				"the override replaces read and keeps the rest",
			);
		});
	}

	// Group P2: the package has NO gated action. The mount is COLD because the
	// ENABLED activation line legitimately carries `policy=<n>` (the residency
	// rule count) - the refusal markers are checked on the enabled mount in P3.
	{
		const Run = Make(Validate({ logFile: "/nonexistent/authority.log" }));
		Check(Count, "P2: the package has no gated action", () => {
			assert.equal(Decide(Run.State.Allow, "read"), "auto", "the read verdict is automatic");
			assert.equal(Decide(Run.State.Allow, "record"), "auto", "the record verdict is automatic");
			assert.equal(LinesWith(Run, "held").length, 0, "no held line on the mount");
			assert.equal(LinesWith(Run, "policy").length, 0, "no policy line on the mount");
		});
	}

	// Group P3: a representative record action proceeds and writes no file.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		const Record = Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["read"] });
		const Authorized = Service.authorize("alice", "/r/a.ts", "read");
		Check(Count, "P3: grant records under the shipped defaults and writes no file", () => {
			assert.equal(Record.id, "cap:1", "the capability record is produced");
			assert.equal(Authorized, true, "the read judgment is served");
			assert.equal(LinesWith(Run, "refused").length, 0, "no refusal line appears");
			assert.equal(LinesWith(Run, "held").length, 0, "no held line appears");
			assert.equal(Run.Fs.writes.length, 0, "the fake fs recorded zero writes");
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
