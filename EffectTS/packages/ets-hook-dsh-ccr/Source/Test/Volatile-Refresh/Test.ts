// Source/Test/Volatile-Refresh/Test.ts - one singular test: the State
// builder's P10 loader/volatile-update refresh listener as the ccr State
// carries it - the listener is registered alongside tools/post-execute (and,
// with the engine flag ON, agent/pre-step), so a committed config change can
// reach the running State without a remount.
//
// NOTE ON SCOPE: the source suite asserts the listener's PRESENCE here; the
// dispatch BEHAVIOR (the in-place field updates on the key-array, dotted and
// nested-object paths, the identity preservation, the unknown/failed path
// safety) is the factory's shared machinery and is exercised byte-verbatim by
// the factory package's Entry-And-State folder (the P10 volatile-refresh
// section). This folder holds the ccr-side registration assertions from the
// source suite's Run 1 - moved verbatim, nothing invented.
// Runs standalone (`node Target/Test/Volatile-Refresh/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-ccr: the fake ctx + the REAL factory +
// the REAL ccr apply, from the Harness.
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	MakeCounter,
	Make,
	Rm,
	Validate,
	Ledger,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run 1 - the State builder's P10 refresh listener on the ccr State.
	Rm();
	const Raw1 = Validate({ logFile: Ledger });
	const Run1 = Make(Raw1);
	{
		const Sub =
			"tools/post-execute plus the State builder's P10 loader/volatile-update refresh";
		Check(Count, Sub, () => {
			assert.ok(
				Object.keys(Run1.Listeners).length === 2 &&
					Run1.Listeners["loader/volatile-update"] !== undefined,
			);
		});
	}
	return Finish(Count, "Volatile-Refresh");
};

// Standalone entry: `node Target/Test/Volatile-Refresh/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Volatile-Refresh`);
}
