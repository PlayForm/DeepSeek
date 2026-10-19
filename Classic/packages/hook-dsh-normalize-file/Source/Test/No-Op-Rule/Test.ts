// Source/Test/No-Op-Rule/Test.ts - one singular test: the N=0 no-op rule -
// normalizing an already-normalized file (count 0, changed=false, NO write,
// NO waterfall, NO emit, NO count line, NO journal record, the file left
// byte-identical, no before/after in the outcome) and a clean file that is a
// no-op from the start. The suite's journal arithmetic is cumulative on the
// factory-level PendingJournal, so this folder replays Run 1b's write as a
// silent fixture first - every check below is byte-verbatim and the counts
// reproduce the source suite's values when run standalone OR under the
// aggregate. Runs standalone (`node Target/Test/No-Op-Rule/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-normalize-file: the fake ctx + the REAL
// factory + the REAL normalize-file apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		const Tool = Run1.Registered[0];
		const Exec = (Signal?: AbortSignal) => ({
			signal: Signal ?? new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		// Fixture: Run 1b's N>0 write (silent; its own assertions live in
		// Read-Write-Pipeline). It produces the journal record #1, the first
		// write/intent/observation and the first count line that the no-op
		// checks are measured against.
		const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		const Normalized6 = 'a-b"c"...d efAg';
		const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
		Run1.Files.set(`key:${Fixture}`, All6);
		await Tool.execute({ file_path: Fixture }, Exec());
		const WritesBeforeNoop = Run1.Writes.length;
		// Group: Run 1d - idempotence: normalizing the normalized file is a
		// no-op.
		{
			const Out2 = await Tool.execute({ file_path: Fixture }, Exec());
			{
				const Sub = "normalizing the already-normalized file: count 0, changed=false";
				Check(Count, Sub, () => {
					assert.ok(Out2.count === 0 && Out2.changed === false);
				});
			}
			{
				const Sub = "N=0 \u2192 NO write at all (no writeText call)";
				Check(Count, Sub, () => {
					assert.ok(Run1.Writes.length === WritesBeforeNoop);
				});
			}
			{
				const Sub = "N=0 \u2192 no fs/write-intent waterfall run";
				Check(Count, Sub, () => {
					assert.ok(Run1.Intents.length === 1);
				});
			}
			{
				const Sub = "N=0 \u2192 no fs/observed emit";
				Check(Count, Sub, () => {
					assert.ok(Run1.Observations.length === 1);
				});
			}
			await new Promise((R) => setTimeout(R, 10));
			{
				const Sub = "N=0 \u2192 NO count line (the ledger keeps exactly the first one)";
				Check(Count, Sub, () => {
					assert.ok(Run1.Lines.filter((L: string) => L.includes("normalized")).length === 1);
				});
			}
			{
				const Sub = "N=0 \u2192 NO journal record";
				Check(Count, Sub, () => {
					assert.ok(
						Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 1,
					);
				});
			}
			{
				const Sub = "N=0 \u2192 the file is left byte-identical";
				Check(Count, Sub, () => {
					assert.ok(Run1.Files.get(`key:${Fixture}`) === Normalized6);
				});
			}
			{
				const Sub = "N=0 \u2192 the outcome carries no before/after (nothing to diff)";
				Check(Count, Sub, () => {
					assert.ok(Out2.before === undefined && Out2.after === undefined);
				});
			}
		}
		// Group: Run 2 - a clean file is a no-op from the start.
		{
			const Clean = "/tmp/normalize-file-smoke-clean.txt";
			Run1.Files.set(`key:${Clean}`, "plain text, already clean\n");
			const Out3 = await Tool.execute({ file_path: Clean }, Exec());
			{
				const Sub = "a clean file: count 0, changed=false, path reported";
				Check(Count, Sub, () => {
					assert.ok(Out3.count === 0 && Out3.changed === false && Out3.path === Clean);
				});
			}
			{
				const Sub = "a clean file: NO write";
				Check(Count, Sub, () => {
					assert.ok(Run1.Writes.length === WritesBeforeNoop);
				});
			}
			{
				const Sub = "a clean file: NO journal record";
				Check(Count, Sub, () => {
					assert.ok(
						Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 1,
					);
				});
			}
		}
	}
	return Finish(Count, "No-Op-Rule");
};

// Standalone entry: `node Target/Test/No-Op-Rule/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - No-Op-Rule`);
}
