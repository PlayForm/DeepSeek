// Source/Test/Policy-And-Contract/Test.ts - the loader contract and the
// decision gate's policy: the default object carries name/apply/Config/
// inject, apply returns nothing, the IDLE-forever cold mount logs the
// byte-exact disabled line, the enabled mount logs the byte-exact activation
// line, the fail-loud validation, the listener registration shape, and the
// conservative auto-approve policy's every gate (the first-batch rule).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import Plugin, { apply, Config, inject, name } from "../../../Target/Library.js";
import PolicyModule from "../../../Target/Function/Policy.js";
import {
	Check,
	Finish,
	Ledger,
	LedgerLines,
	Make,
	MakeCounter,
	Proposal,
	rm,
	Validate,
} from "../Harness.js";

/** The built policy module (a nameless default export). */
const Policy: (State: any, Proposal: any) => "auto-approve" | "require-user" =
	PolicyModule as never;

/** A standard enabled mount with the policy knobs on. */
const Setup = (): any => {
	rm();
	return Make(
		Validate({
			logFile: Ledger,
			enabled: true,
			autoApprove: "on",
			allowlist: ["version-bump"],
			maxAutoTargets: 5,
			minConfidence: 0.8,
			pendingTtlMs: 3_600_000,
		}),
	);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the loader contract.
	{
		const Run = Setup();
		Check(Count, "P1: the default export carries name, apply, Config and inject", () => {
			assert.equal(Plugin.name, name);
			assert.equal(Plugin.apply, apply);
			assert.equal(Plugin.Config, Config);
			assert.deepEqual(Plugin.inject, inject);
		});
		Check(Count, "P1: the identity is the package name and the inject list excludes the siblings", () => {
			assert.equal(name, "hook-dsh-batch-decision");
			assert.deepEqual(inject, ["pluginFactory", "tools"]);
		});
		Check(Count, "P1: apply returns NOTHING (a returned value kills event delivery)", () => {
			assert.equal(Run.Returned, undefined);
		});
	}

	// Group P2: the IDLE-forever cold mount.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }));
		Check(Count, "P2: a disabled mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["hook-dsh-batch-decision: disabled (enabled=false)"]);
		});
		Check(Count, "P2: the disabled line is durable in the ledger file too", () => {
			assert.equal(
				FileSystem.readFileSync(Ledger, "utf8").split("\n").filter(Boolean).filter((Line) => Line.endsWith("disabled (enabled=false)")).length,
				1,
			);
		});
		Check(Count, "P2: the disabled listener is a passthrough - a proposal recorded while disabled changes nothing", () => {
			Run.CtxListeners["batch/proposed"](Proposal({}));
			assert.equal(Run.State.Pending.size, 0);
			assert.deepEqual(Run.Lines, ["hook-dsh-batch-decision: disabled (enabled=false)"]);
		});
	}

	// Group P3: the enabled mount's wiring.
	{
		const Run = Setup();
		Check(Count, "P3: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, [
				"hook-dsh-batch-decision: activated (bundle 0.2.1, autoApprove=on, allowlist=1)",
			]);
		});
		Check(Count, "P3: the batch/proposed listener sits on the ctx; the hook registers no root listeners", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update", "batch/proposed"]);
			assert.deepEqual(Object.keys(Run.RootListeners), []);
		});
		Check(Count, "P3: the batch_decision tool is registered once", () => {
			assert.deepEqual(
				Run.Registered.map((Definition: any) => Definition.name),
				["batch_decision"],
			);
		});
		Check(Count, "P3: the State probe carries the policy knobs", () => {
			assert.equal(Run.State.On, true);
			assert.equal(Run.State.AutoApprove, "on");
			assert.deepEqual(Run.State.Allowlist, ["version-bump"]);
			assert.equal(Run.State.MaxAutoTargets, 5);
			assert.equal(Run.State.MinConfidence, 0.8);
			assert.equal(Run.State.PendingTtlMs, 3_600_000);
			assert.equal(Run.State.Ledger, Ledger);
			assert.equal(Run.State.Module, "hook-dsh-batch-decision");
		});
	}

	// Group P4: the fail-loud validation.
	{
		Check(Count, "P4: a bad autoApprove value fails loud at load (the schema's union)", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, autoApprove: "maybe" })),
				/autoApprove expected "off" \| "on" but got "maybe"/,
			);
		});
		Check(Count, "P4: a non-array allowlist fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, allowlist: "not-an-array" as unknown as string[] })),
				/allowlist/,
			);
		});
		Check(Count, "P4: a pendingTtlMs below the floor fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, allowlist: [], pendingTtlMs: 999 })),
				/hook-dsh-batch-decision: pendingTtlMs must be >= 1000/,
			);
		});
		Check(Count, "P4: an out-of-range minConfidence fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, allowlist: [], minConfidence: 1.5 })),
				/hook-dsh-batch-decision: minConfidence must be between 0 and 1/,
			);
		});
		Check(Count, "P4: a maxAutoTargets below 1 fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, allowlist: [], maxAutoTargets: 0 })),
				/hook-dsh-batch-decision: maxAutoTargets must be >= 1/,
			);
		});
	}

	// Group P5: the conservative policy's gates.
	{
		const Run = Setup();
		const State = Run.State;
		Check(Count, "P5: with autoApprove on and an allowlisted, small, confident, seen intent - auto-approve", () => {
			State.SeenIntents.set("version-bump", 1);
			assert.equal(Policy(State, Proposal({})), "auto-approve");
		});
		Check(Count, "P5: autoApprove off requires the user - the second explicit flip", () => {
			const Off = State.AutoApprove;
			State.AutoApprove = "off";
			assert.equal(Policy(State, Proposal({})), "require-user");
			State.AutoApprove = Off;
		});
		Check(Count, "P5: a non-allowlisted intent requires the user", () => {
			assert.equal(Policy(State, Proposal({ intent: "rename" })), "require-user");
		});
		Check(Count, "P5: too many targets require the user", () => {
			assert.equal(
				Policy(State, Proposal({ targets: [1, 2, 3, 4, 5, 6].map((N) => ({ path: `f${N}`, version: "v1", why: "w" })) })),
				"require-user",
			);
		});
		Check(Count, "P5: a low confidence requires the user; a missing confidence is a zero", () => {
			assert.equal(Policy(State, Proposal({ confidence: 0.7 })), "require-user");
			assert.equal(Policy(State, Proposal({ confidence: undefined })), "require-user");
		});
		Check(Count, "P5: the first batch of an intent class requires the user - the SeenIntents counter only moves on a USER approval", () => {
			State.SeenIntents.delete("version-bump");
			assert.equal(Policy(State, Proposal({})), "require-user");
			State.SeenIntents.set("version-bump", 1);
			assert.equal(Policy(State, Proposal({})), "auto-approve");
		});
	}

	// Group P6: purity.
	{
		const Run = Setup();
		Run.CtxListeners["batch/proposed"](Proposal({}));
		Check(Count, "P6: the whole decision path never touches the fs seam (zero reads, zero writes)", () => {
			assert.deepEqual(Run.Fs.reads, []);
			assert.deepEqual(Run.Fs.writes, []);
			assert.equal(LedgerLines().filter((Line) => Line.includes("recorded")).length, 1);
		});
	}
	return Finish(Count, "Policy-And-Contract");
};

// Standalone entry: `node Target/Test/Policy-And-Contract/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Policy-And-Contract`);
}
