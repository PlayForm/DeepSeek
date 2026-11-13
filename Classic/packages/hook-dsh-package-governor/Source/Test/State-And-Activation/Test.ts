import assert from "node:assert/strict";
import {
	Check,
	Controllers,
	Context,
	Effects,
	EXCLUDE,
	Events,
	Finish,
	Furnace,
	Ledger,
	ledgerLines,
	MakeCounter,
	NCU_BIN,
	Root,
	Services,
	StorageRecords,
	TOOLS,
	actor,
	mkTarget,
	settle,
} from "../Harness.js";
import Governor from "../../../Target/Library.js";

/**
 * @module Test
 *
 * One singular test of the governor's apply-time wiring and its activation
 * proof.
 *
 * @remarks
 *
 * apply returns nothing, the state probe, the factory-built state fields, the
 * fresh machinery collections, the Attach P1/P2/P5 effects, and the activation:
 * the P5 record drained into the opened domain + the durable proof line
 * byte-identical.
 *
 * Runs standalone (`node Target/Test/State-And-Activation/Test.js`) AND under
 * the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it). Unit smoke of
 * `@playform/hook-dsh-package-governor`.
 */
export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// The source suite resets the effect capture before its apply; in a folder
	// process this apply is the first, so the reset is a no-op (kept verbatim).
	Effects.length = 0;

	// Fixture-only scaffolding: the source suite passes a partial config (the
	// loader fills the defaults); the Schema callable accepts it at runtime.
	const Raw = (Governor.Config as any)({ logFile: Ledger });
	const Returned = Governor.apply(Context, Raw);
	const Probe = Context.__hookDshGovernorPackageState;

	// Group: the apply contract and the factory-built state.
	{
		const Sub = "apply: returns nothing; the state exposed via ctx.__hookDshGovernorPackageState";
		{
			Check(Count, Sub, () => {
				assert.equal(Returned, undefined, "apply returns nothing");
				assert.ok(Probe, "ctx.__hookDshGovernorPackageState probe attached");
			});
		}
	}
	{
		const Sub = "State: Module + Tool \u2190 mutationTools (cell unwrapped by the factory)";
		{
			Check(Count, Sub, () => {
				assert.equal(Probe.Module, "hook-dsh-governor-package");
				assert.deepEqual(Probe.Tool, TOOLS, "Tool <- mutationTools (cell unwrapped)");
			});
		}
	}
	{
		const Sub = "State: module fields via the setup map (On/Strict/Wait/Limit/Binary/Mode)";
		{
			Check(Count, Sub, () => {
				assert.equal(Probe.Strict, false);
				assert.equal(Probe.Wait, 3000);
				assert.equal(Probe.Limit, 3);
				assert.equal(Probe.Binary, NCU_BIN);
				assert.equal(Probe.Mode, "programmatic");
			});
		}
	}
	{
		const Sub =
			"State: shared mappings (Policy/policyFile, Ledger/logFile, Enabled/log, List/exclude)";
		{
			Check(Count, Sub, () => {
				assert.equal(Probe.Policy, "");
				assert.equal(Probe.PolicyName, "update-policy.json", "sidecar name for union discovery");
				assert.equal(Probe.Ledger, Ledger);
				assert.equal(Probe.Enabled, true);
				assert.equal(Probe.On, true, "the master switch (enabled) mapped by the setup map");
				assert.deepEqual(Probe.List, EXCLUDE);
			});
		}
	}
	{
		const Sub = "State: P9 subprocess seam probed once at build";
		{
			Check(Count, Sub, () => {
				assert.equal(Probe.Subprocess, Services["subprocess"], "P9 subprocess probed at build");
			});
		}
	}
	{
		const Sub = "State: the injected factory service stored on State";
		{
			Check(Count, Sub, () => {
				assert.equal(Probe.Factory, Furnace, "the injected factory stored on State");
			});
		}
	}
	{
		const Sub =
			"State: fresh machinery + module gate collections (Stash/Inflight/Seams/Queue/Stamp/Set/Count)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					Probe.Stash instanceof Map &&
						Probe.Inflight instanceof Map &&
						Probe.Seams instanceof Map &&
						Probe.Queue.length === 0 &&
						Furnace.PendingJournal.length === 1 &&
						Probe.Stamp instanceof Map &&
						Probe.Set instanceof Set &&
						Probe.Count instanceof Map,
					"fresh machinery + module gate collections (+ the pre-bind buffered activated record)",
				);
				// the smoke drives engine selection through the module's Mode field: the
				// bin-mode scenarios run against the STUBBED subprocess seam (offline,
				// fast)
				Probe.Mode = "bin";
			});
		}
	}
	{
		const Sub = "Attach: P1 controller + P2/P5 effects; Wire registered fs/observed";
		{
			Check(Count, Sub, () => {
				assert.deepEqual(
					Effects.map((e) => e[0]),
					[
						"hook-dsh-governor-package-jobs",
						"hook-dsh-governor-package-inflight",
						"hook-dsh-governor-package-storage",
					],
					"factory.Attach registered P1/P2/P5 with the module labels",
				);
				assert.deepEqual(Controllers, ["hook-dsh-governor-package"], "P1: jobs controller attached");
				assert.equal(
					Events.filter((e) => e[0] === "fs/observed").length,
					1,
					"one fs/observed listener (Factory.Wire)",
				);
			});
		}
	}
	await settle();
	{
		const Sub = "activation: the P5 record drained into the opened domain";
		{
			Check(Count, Sub, () => {
				assert.equal(Probe.Queue.length, 0, "P5: pre-open queue drained into the stub domain");
				assert.equal(StorageRecords.length, 1);
				assert.equal(StorageRecords[0]![1].event, "activated");
			});
		}
	}
	{
		const Sub = "activation: durable proof line byte-identical ([ISO] format + summary fields)";
		{
			Check(Count, Sub, () => {
				const lines = ledgerLines();
				assert.equal(lines.length, 1, "exactly one ledger line so far");
				assert.match(
					lines[0] as string,
					/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] activated \(anywhere mode, logFile=/,
				);
				assert.ok(
					(lines[0] as string).includes(
						`logFile=${Ledger}, updateMode=programmatic, ncuBin=${NCU_BIN}, exclude=[${EXCLUDE.join(
							", ",
						)}], policyFile=(discovery))`,
					),
					"activation proof composed byte-identically",
				);
			});
		}
	}
	// Group: the disabled mount (enabled=false) - the LIVE disabled posture. A disabled
	// mount registers EVERYTHING (no early return) and its only mount-time effect is the
	// byte-exact disabled ledger line instead of the activation proof; every surface then
	// checks the flag at CALL time and passes through with zero new lines, and a volatile
	// flip acts on the very next call in both directions.
	{
		const Sub =
			"disabled mount: every surface still registers and the ledger line is the byte-exact disabled line (no early return)";
		{
			const LinesBefore = ledgerLines().length;
			const EventsBefore = Events.length;
			const EffectsBefore = Effects.length;
			const ControllersBefore = Controllers.length;
			const RecordsBefore = StorageRecords.length;
			Governor.apply(Context, (Governor.Config as any)({ logFile: Ledger, enabled: false }));
			const Disabled = Context.__hookDshGovernorPackageState;
			Check(Count, Sub, () => {
				assert.equal(Disabled.On, false, "the disabled mount's master switch");
				const Lines = ledgerLines();
				assert.equal(Lines.length, LinesBefore + 1, "exactly one new ledger line");
				assert.match(
					Lines.at(-1) as string,
					/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] disabled \(enabled=false\)$/,
					"the byte-exact disabled line instead of the activation proof",
				);
				assert.ok(
					Events.slice(EventsBefore).some(([n]) => n === "fs/observed"),
					"the fs/observed listener STILL registered on the disabled mount",
				);
				assert.deepEqual(
					Effects.slice(EffectsBefore).map((e) => e[0]),
					[
						"hook-dsh-governor-package-jobs",
						"hook-dsh-governor-package-inflight",
						"hook-dsh-governor-package-storage",
					],
					"the P1/P2/P5 lifecycle effects STILL registered on the disabled mount",
				);
				assert.equal(
					Controllers.length,
					ControllersBefore + 1,
					"the P1 jobs controller STILL attached",
				);
				assert.equal(
					StorageRecords.length,
					RecordsBefore,
					"no activated journal record for the disabled mount (the proof is the disabled line)",
				);
			});
			// The disabled mount's own wired listener (the LAST fs/observed registration)
			// drives the call-time groups below; the direct-govern steps carry the same
			// State.On guard inside Function/Direct.
			const DisabledListener = (
				Events.filter(([n]) => n === "fs/observed").at(-1) as [string, any]
			)[1];
			const Silent = ledgerLines().length;
			Check(Count, "disabled mount: a call passes through with ZERO new ledger lines", () => {
				DisabledListener(
					mkTarget(Root, "disabled-probe"),
					{ kind: "present", version: "v-disabled-1" },
					actor,
				);
				assert.equal(
					ledgerLines().length,
					Silent,
					"the disabled call did nothing (no gate line, no skip line, no write)",
				);
			});
			const Flipped = ledgerLines().length;
			Check(Count, "disabled mount: flipping enabled acts on the very next call - and back", () => {
				// Flip ON: the next call runs the pass (the g2 chain-skip line is the
				// deterministic first line; the g1 gate is silent by design).
				Disabled.On = true;
				DisabledListener(
					mkTarget(Root, "disabled-probe"),
					{ kind: "present", version: "v-disabled-1" },
					actor,
				);
				const Lines = ledgerLines();
				assert.equal(Lines.length, Flipped + 1, "the flipped-on call ran the pass (one new line)");
				assert.ok(
					(Lines.at(-1) as string).includes("no registry.json found for"),
					"the pass really ran (the g2 chain-skip line)",
				);
				// Flip OFF: the next call is silent again (a fresh version token keeps the
				// Stash idempotence gate out of the way - the master switch is the only
				// gate standing).
				Disabled.On = false;
				DisabledListener(
					mkTarget(Root, "disabled-probe"),
					{ kind: "present", version: "v-disabled-2" },
					actor,
				);
				assert.equal(ledgerLines().length, Flipped + 1, "the flipped-back call is silent again");
			});
			// Let the flipped-on call's detached continuation drain (it is contained and
			// ledger-silent; nothing after this point asserts exact counts).
			await settle();
		}
	}
	return Finish(Count, "State-And-Activation");
};

// Standalone entry: `node Target/Test/State-And-Activation/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - State-And-Activation`);
}
