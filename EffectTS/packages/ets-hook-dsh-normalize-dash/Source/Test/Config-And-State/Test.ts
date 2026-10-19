// Source/Test/Config-And-State/Test.ts - one singular test: the apply-time
// wiring - the config defaults and volatile cells, the listener set, the
// state unwraps, and the fresh-state-per-apply posture (no module-level
// globals). Runs standalone (`node Target/Test/Config-And-State/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	// Group: Run 1 - defaults (the config cells, the listeners, the state).
	{
		const Raw1 = Validate({ logFile: Ledger });
		const Run1 = Make(Raw1);
		{
			const Sub = "volatile cell: log arrives as { get }";
			Check(Count, Sub, () => {
				assert.ok(Raw1.log && typeof Raw1.log.get === "function");
			});
		}
		{
			const Sub = "volatile cell: logFile arrives as { get }";
			Check(Count, Sub, () => {
				assert.ok(typeof Raw1.logFile.get === "function");
			});
		}
		{
			const Sub = "volatile cell: replacement arrives as { get }";
			Check(Count, Sub, () => {
				assert.ok(typeof Raw1.replacement.get === "function");
			});
		}
		{
			const Sub = "config default normalizeReasoning=true";
			Check(Count, Sub, () => {
				assert.ok(Raw1.normalizeReasoning === true);
			});
		}
		{
			const Sub = "config default normalizeToolArguments=false";
			Check(Count, Sub, () => {
				assert.ok(Raw1.normalizeToolArguments === false);
			});
		}
		{
			const Sub = "the llm/stream listener is registered";
			Check(Count, Sub, () => {
				assert.ok(typeof Run1.Listeners["llm/stream"] === "function");
			});
		}
		{
			const Sub =
				"llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)";
			Check(Count, Sub, () => {
				assert.ok(
					Object.keys(Run1.Listeners).length === 4 &&
						Run1.Listeners["loader/volatile-update"] !== undefined &&
						Run1.Listeners["tools/post-execute"] !== undefined &&
						Run1.Listeners["agent/pre-step"] !== undefined,
				);
			});
		}
		{
			const Sub = "state carries the REAL factory instance";
			Check(Count, Sub, () => {
				assert.ok(Run1.State && Run1.State.Factory === Furnace);
			});
		}
		{
			const Sub = "volatile unwrap: logFile cell unwrapped to State.Ledger";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Ledger === "/tmp/normalize-dash-smoke-ledger.log");
			});
		}
		{
			const Sub = "volatile unwrap: log cell unwrapped to State.Enabled=true";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Enabled === true);
			});
		}
		{
			const Sub = "volatile unwrap: replacement cell unwrapped to State.Replacement='-'";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Replacement === "-");
			});
		}
		{
			const Sub = "plain fields: Reasoning=true, ToolArgs=false";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Reasoning === true && Run1.State.ToolArgs === false);
			});
		}
		{
			const Sub = "state module = hook-dsh-normalize-dash (the ledger prefix)";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Module === "hook-dsh-normalize-dash");
			});
		}
		{
			const Sub = "activation ledger line byte-exact";
			Check(Count, Sub, () => {
				assert.ok(
					Run1.Lines.includes(
						"hook-dsh-normalize-dash: activated (replacement=-, reasoning=on, toolArgs=off, logFile=/tmp/normalize-dash-smoke-ledger.log)",
					),
				);
			});
		}
	}
	// Group: Run 6 - HMR-safety probe (no module-level state).
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		const Run5 = Make(Validate({ logFile: Ledger }));
		const First = Run1.State;
		const Second = Run5.State;
		{
			const Sub = "each apply builds a FRESH state (no module-level globals)";
			Check(Count, Sub, () => {
				assert.ok(First !== Second && First.Replacement === "-" && Second.Replacement === "-");
			});
		}
	}
	return Finish(Count, "Config-And-State");
};

// Standalone entry: `node Target/Test/Config-And-State/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Config-And-State`);
}
