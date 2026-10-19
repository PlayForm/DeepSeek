// Source/Test/Volatile-Live-Flip/Test.ts - one singular test: the P10
// volatile live-flip - a fresh mount whose `replacement` arrives as a
// hand-built stable volatile cell, the factory's loader/volatile-update
// dispatch refreshing State in place, and the next stream picking the new
// replacement up WITHOUT remount: no second activation line, State identity
// preserved, the normal count line still written.
// Runs standalone (`node Target/Test/Volatile-Live-Flip/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run V - the P10 volatile live-flip. The KEY new smoke: a fresh
	// mount whose `replacement` arrives as a volatile cell (the schema freezes
	// its own cells, so the fake loader simulation here builds the STABLE
	// reference by hand - a cell whose getter reads a mutable outer binding,
	// exactly the loader's "commit into the running reference" semantics). The
	// factory's loader/volatile-update listener is dispatched; the next stream
	// picks the new replacement up WITHOUT remount: no second activation line,
	// State identity preserved.
	{
		Rm();
		let FlipValue = "-";
		const RawV = {
			log: true,
			logFile: Ledger,
			replacement: { get: () => FlipValue },
			normalizeReasoning: true,
			normalizeToolArguments: false,
		};
		const RunV = Make(RawV);
		const Activations = () => RunV.Lines.filter((L: string) => L.includes("activated (")).length;
		{
			const Sub = "P10: the refresh listener is registered";
			Check(Count, Sub, () => {
				assert.ok(RunV.Listeners["loader/volatile-update"] !== undefined);
			});
		}
		{
			const Sub = "P10: exactly one activation line after the mount";
			Check(Count, Sub, () => {
				assert.ok(Activations() === 1);
			});
		}
		{
			const Sub = "P10: the mount-time replacement is the default";
			Check(Count, Sub, () => {
				assert.ok(RunV.State.Replacement === "-");
			});
		}
		const StateRefV = RunV.State;
		FlipValue = "-*-";
		RunV.Listeners["loader/volatile-update"]([["replacement"]]);
		{
			const Sub = "P10: the volatile dispatch refreshed State.Replacement in place";
			Check(Count, Sub, () => {
				assert.ok(RunV.State.Replacement === "-*-");
			});
		}
		{
			const Sub = "P10: the State object identity is preserved (no rebuild)";
			Check(Count, Sub, () => {
				assert.ok(StateRefV === RunV.State);
			});
		}
		{
			const Sub = "P10: still exactly one activation line (NO remount, no re-apply)";
			Check(Count, Sub, () => {
				assert.ok(Activations() === 1);
			});
		}
		const ListenerV = RunV.Listeners["llm/stream"];
		const OutV: any[] = [];
		for await (const ChunkV of ListenerV(Object.freeze({ model: "x", messages: [] }), () =>
			(async function* () {
				yield { type: "text-delta", index: 0, text: "a \u2014 b" };
			})(),
		)) {
			OutV.push(ChunkV);
		}
		{
			const Sub = "P10: the NEXT stream normalizes with the NEW replacement without remount";
			Check(Count, Sub, () => {
				assert.ok(OutV[0].text === "a -*- b");
			});
		}
		{
			const Sub = "P10: the flipped stream still writes its normal count line";
			Check(Count, Sub, () => {
				assert.ok(RunV.Lines.some((L: string) => L.includes("normalized 1 dash char(s) in one stream")));
			});
		}
		{
			const Sub = "P10: the flipped stream added NO activation line";
			Check(Count, Sub, () => {
				assert.ok(Activations() === 1);
			});
		}
	}
	return Finish(Count, "Volatile-Live-Flip");
};

// Standalone entry: `node Target/Test/Volatile-Live-Flip/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Volatile-Live-Flip`);
}
