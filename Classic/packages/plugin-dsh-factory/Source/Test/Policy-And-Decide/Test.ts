// Source/Test/Policy-And-Decide/Test.ts - one singular test: THE POLICY BLOCK
// (D6) - the `Policy` schema-block builder and the `Decide` verdict lookup,
// the two module-level named exports beside `Schema`.
//
// What is asserted: the block's eight action classes in the D6 order and with
// the D6 defaults (read/index/record/suggest/message = auto; write/commit/
// spawn = approve), the schema's real validation (an explicit override
// replaces one action and keeps the rest; an unknown verdict fails loud), the
// composed use (`policy: Policy()` inside a consumer's Schema call is ONE
// volatile cell carrying the same block), and the lookup's contract (the
// action names ARE the keys; a missing or malformed key takes that action's
// D6 default, never a blanket "auto").
//
// Runs standalone (`node Target/Test/Policy-And-Decide/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/plugin-dsh-factory: the REAL built Library entry
// (the helpers are module-level, so no fake ctx is needed).
import assert from "node:assert/strict";

import { Check, Finish, MakeCounter } from "../Harness.js";
import { Decide, Policy, Schema } from "../../../Target/Library.js";
import type { Allowlist } from "../../../Target/Library.js";

/** The D6 defaults, written out in the smoke (the contract, not a mirror of
 *  the implementation): read-only work, indexing, recording, suggesting and
 *  messaging are automatic; writes, commits and spawns wait for approval. */
const Defaults: Allowlist = {
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
	// The block builder: the schema itself (a volatile object schema).
	const Block = (Policy as unknown as () => any)();
	// Group: the block's shape and defaults.
	{
		const Sub = "Policy: the eight action classes in the D6 order with the D6 defaults";
		Check(Count, Sub, () => {
			assert.deepEqual(
				Object.keys(Block.dict),
				["read", "index", "record", "suggest", "write", "commit", "spawn", "message"],
				"one key per action class, in the documented order",
			);
			assert.deepEqual(Block({}).get(), Defaults, "the schema fills the D6 defaults");
			assert.equal(
				typeof Block({}).get,
				"function",
				"the block is a volatile cell (one hot-editable object)",
			);
		});
	}
	// Group: the schema's real validation.
	{
		const Sub = "Policy: an explicit override replaces one action and keeps the rest";
		Check(Count, Sub, () => {
			assert.deepEqual(
				Block({ write: "auto" }).get(),
				{ ...Defaults, write: "auto" },
				"a partial override merges over the D6 defaults",
			);
			assert.deepEqual(
				Block({ read: "approve", commit: "auto", message: "approve" }).get(),
				{
					...Defaults,
					read: "approve",
					commit: "auto",
					message: "approve",
				},
				"every action is independently overridable",
			);
		});
	}
	{
		const Sub = "Policy: an unknown verdict fails loud at validation";
		Check(Count, Sub, () => {
			assert.throws(
				() => Block({ spawn: "sometimes" }),
				/expected "auto" \| "approve"/,
				"the enum rejects a value that is neither auto nor approve",
			);
		});
	}
	// Group: the composed use (the consumers' `policy: Policy()`).
	{
		const Sub = "Policy: composed into a consumer schema as ONE volatile cell";
		Check(Count, Sub, () => {
			const Composed = (
				Schema as unknown as (
					Shared: unknown,
					Module: Record<string, unknown>,
				) => (Raw: Record<string, unknown>) => any
			)(false, { policy: Block });
			const Config = Composed({});
			assert.equal(typeof Config.policy.get, "function", "the composed field is a cell");
			assert.deepEqual(Config.policy.get(), Defaults, "the composed cell carries the defaults");
			assert.deepEqual(
				Composed({ policy: { commit: "auto" } }).policy.get(),
				{ ...Defaults, commit: "auto" },
				"the composed cell accepts a partial override",
			);
			assert.throws(
				() => Composed({ policy: { commit: "whenever" } }),
				/expected "auto" \| "approve"/,
				"the composed field rejects an unknown verdict too",
			);
		});
	}
	// Group: the Decide lookup.
	{
		const Sub = "Decide: the action names ARE the keys - every D6 verdict resolves";
		Check(Count, Sub, () => {
			assert.equal(Decide(Defaults, "read"), "auto");
			assert.equal(Decide(Defaults, "index"), "auto");
			assert.equal(Decide(Defaults, "record"), "auto");
			assert.equal(Decide(Defaults, "suggest"), "auto");
			assert.equal(Decide(Defaults, "write"), "approve");
			assert.equal(Decide(Defaults, "commit"), "approve");
			assert.equal(Decide(Defaults, "spawn"), "approve");
			assert.equal(Decide(Defaults, "message"), "auto");
		});
	}
	{
		const Sub = "Decide: an override flips exactly its action";
		Check(Count, Sub, () => {
			assert.equal(Decide({ ...Defaults, write: "auto" }, "write"), "auto");
			assert.equal(Decide({ ...Defaults, write: "auto" }, "commit"), "approve");
			assert.equal(Decide({ ...Defaults, read: "approve" }, "read"), "approve");
			assert.equal(Decide({ ...Defaults, spawn: "auto" }, "spawn"), "auto");
		});
	}
	{
		const Sub = "Decide: a missing or malformed key takes that action's D6 default";
		Check(Count, Sub, () => {
			assert.equal(Decide({} as Allowlist, "read"), "auto", "missing read -> auto");
			assert.equal(Decide({} as Allowlist, "commit"), "approve", "missing commit -> approve");
			assert.equal(Decide({} as Allowlist, "spawn"), "approve", "missing spawn -> approve");
			assert.equal(Decide({} as Allowlist, "message"), "auto", "missing message -> auto");
			assert.equal(
				Decide({ write: "sometimes" } as unknown as Allowlist, "write"),
				"approve",
				"a malformed write never widens to auto",
			);
			assert.equal(
				Decide({ read: "sometimes" } as unknown as Allowlist, "read"),
				"auto",
				"a malformed read falls back to its automatic default",
			);
		});
	}
	// Group: the entry's export surface.
	{
		const Sub = "Library: Policy and Decide are module-level functions beside Schema";
		Check(Count, Sub, () => {
			assert.equal(typeof Policy, "function", "the Policy builder is a named export");
			assert.equal(typeof Decide, "function", "the Decide lookup is a named export");
			assert.equal(typeof Schema, "function", "the Schema factory stays exported");
		});
	}
	return Finish(Count, "Policy-And-Decide");
};

// Standalone entry: `node Target/Test/Policy-And-Decide/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Policy-And-Decide`);
}
