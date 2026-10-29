// Source/Test/Volatile-Live-Flip/Test.ts - one singular test: the P10
// volatile live-flip and the files scope gate - the replacement arriving as
// a hand-built stable volatile cell and being refreshed in place by the
// factory's loader/volatile-update dispatch (no remount, identity
// preserved, the next tool call picking up the new value), and the
// scopes.files gate turning the tool off and back on live.
// Runs standalone (`node Target/Test/Volatile-Live-Flip/Test.js`) AND under
// the aggregate (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-plugin-dsh-normalize-file: the fake ctx + the REAL
// factory + the REAL normalize-file apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run V - the P10 volatile live-flip. The replacement arrives as a
	// STABLE volatile cell (built by hand - the schema freezes its own cells;
	// the getter reads a mutable outer binding, exactly the loader's "commit
	// into the running reference" semantics). The factory's
	// loader/volatile-update listener is dispatched; the NEXT tool call picks
	// the new replacement up WITHOUT remount: no second activation line,
	// State identity preserved.
	{
		Rm();
		const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		const Normalized6 = 'a-b"c"...d efAg';
		let FlipValue = "-";
		const RawV = { log: true, logFile: Ledger, replacement: { get: () => FlipValue } };
		const RunV = Make(RawV);
		const ToolV = RunV.Registered[0];
		const ActivationsV = () => RunV.Lines.filter((L: string) => L.includes("activated (")).length;
		{
			const Sub = "P10: the refresh listener is registered";
			Check(Count, Sub, () => {
				assert.ok(RunV.Listeners["loader/volatile-update"] !== undefined);
			});
		}
		{
			const Sub = "P10: exactly one activation line after the mount";
			Check(Count, Sub, () => {
				assert.ok(ActivationsV() === 1);
			});
		}
		{
			const Sub = "P10: the mount-time replacement is the default";
			Check(Count, Sub, () => {
				assert.ok(RunV.State.Replacement === "-");
			});
		}
		const StateRefV = RunV.State;
		const FlipFixture = "/tmp/normalize-file-smoke-flip-fixture.txt";
		const GateFixture = "/tmp/normalize-file-smoke-gate-fixture.txt";
		RunV.Files.set(`key:${FlipFixture}`, All6);
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
				assert.ok(ActivationsV() === 1);
			});
		}
		const OutV = await ToolV.execute({ file_path: FlipFixture }, {
			signal: new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		{
			const Sub = "P10: the NEXT tool call normalizes with the NEW replacement without remount";
			Check(Count, Sub, () => {
				assert.ok(OutV.changed === true && OutV.after === 'a-*-b"c"...d efAg');
			});
		}
		{
			const Sub = "P10: the flipped tool call still writes its normal count line";
			Check(Count, Sub, () => {
				assert.ok(RunV.Lines.some((L: string) => L.includes(`normalized 7 char(s) in ${FlipFixture}`)));
			});
		}
		{
			const Sub = "P10: the flipped tool call added NO activation line";
			Check(Count, Sub, () => {
				assert.ok(ActivationsV() === 1);
			});
		}
		// Group: Run F - the FILES scope gate. scopes.files off -> the tool
		// returns the unchanged changed:false result with NO resolve, NO read,
		// NO write, NO ledger line (the volatile scope flip re-arms the tool
		// without remount).
		Rm();
		let FilesOn = true;
		const RawF = {
			log: true,
			logFile: Ledger,
			replacement: "-",
			scopes: {
				get: () => ({
					conversation: true,
					reasoning: true,
					toolInput: false,
					toolResults: false,
					files: FilesOn,
					batch: false,
				}),
			},
		};
		const RunF = Make(RawF);
		const ToolF = RunF.Registered[0];
		RunF.Files.set(`key:${GateFixture}`, All6);
		FilesOn = false;
		RunF.Listeners["loader/volatile-update"]([["scopes", "files"]]);
		const ReadsBeforeF = RunF.Reads.length;
		const WritesBeforeF = RunF.Writes.length;
		const LinesBeforeF = RunF.Lines.length;
		const OutF = await ToolF.execute({ file_path: GateFixture }, {
			signal: new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		{
			const Sub = "scopes.files off: the tool returns the unchanged changed:false result";
			Check(Count, Sub, () => {
				assert.ok(OutF.changed === false && OutF.count === 0 && OutF.path === GateFixture);
			});
		}
		{
			const Sub = "scopes.files off: no resolve/read/write/ledger line";
			Check(Count, Sub, () => {
				assert.ok(
					RunF.Reads.length === ReadsBeforeF &&
						RunF.Writes.length === WritesBeforeF &&
						RunF.Lines.length === LinesBeforeF,
				);
			});
		}
		// The volatile flip back re-arms the tool live.
		FilesOn = true;
		RunF.Listeners["loader/volatile-update"]([["scopes", "files"]]);
		const OutF2 = await ToolF.execute({ file_path: GateFixture }, {
			signal: new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		{
			const Sub = "scopes.files flipped back on: the NEXT tool call normalizes again (no remount)";
			Check(Count, Sub, () => {
				assert.ok(OutF2.changed === true && OutF2.after === Normalized6);
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
