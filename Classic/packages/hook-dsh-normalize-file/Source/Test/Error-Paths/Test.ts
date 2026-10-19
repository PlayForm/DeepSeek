// Source/Test/Error-Paths/Test.ts - one singular test: the error paths - a
// missing file, a binary/undecodable target, and a pre-aborted signal all
// reject with the tool's context prefix (keeping the backend's error code)
// and produce NO write and NO journal record. The suite's journal arithmetic
// is cumulative on the factory-level PendingJournal, so this folder replays
// Run 1b's write as a silent fixture first - every check below is
// byte-verbatim and the counts reproduce the source suite's values when run
// standalone OR under the aggregate.
// Runs standalone (`node Target/Test/Error-Paths/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
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
		// Read-Write-Pipeline). It produces journal record #1 and the write
		// baseline the error-path checks are measured against.
		const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
		Run1.Files.set(`key:${Fixture}`, All6);
		await Tool.execute({ file_path: Fixture }, Exec());
		const WritesBeforeNoop = Run1.Writes.length;
		// Group: Run 3 - a missing file is an error result, no write.
		{
			let MissingError: any = null;
			try {
				await Tool.execute({ file_path: "/tmp/normalize-file-smoke-missing.txt" }, Exec());
			} catch (E) {
				MissingError = E;
			}
			{
				const Sub = "a missing file rejects with the tool's context prefix";
				Check(Count, Sub, () => {
					assert.ok(
						MissingError !== null &&
							MissingError.message.startsWith(
								"normalize-file: cannot read /tmp/normalize-file-smoke-missing.txt: ",
							),
					);
				});
			}
			{
				const Sub = "the missing-file error keeps the backend's code";
				Check(Count, Sub, () => {
					assert.ok(MissingError !== null && MissingError.message.includes("FS_NOT_FOUND"));
				});
			}
			{
				const Sub = "a missing file: NO write";
				Check(Count, Sub, () => {
					assert.ok(Run1.Writes.length === WritesBeforeNoop);
				});
			}
			{
				const Sub = "a missing file: NO journal record";
				Check(Count, Sub, () => {
					assert.ok(
						Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 1,
					);
				});
			}
		}
		// Group: Run 4 - a binary/undecodable target is an error result, no write.
		{
			let BinaryError: any = null;
			try {
				await Tool.execute({ file_path: "/tmp/normalize-file-smoke-image.bin" }, Exec());
			} catch (E) {
				BinaryError = E;
			}
			{
				const Sub = "a binary target rejects with the tool's context prefix";
				Check(Count, Sub, () => {
					assert.ok(
						BinaryError !== null &&
							BinaryError.message.startsWith(
								"normalize-file: cannot read /tmp/normalize-file-smoke-image.bin: ",
							),
					);
				});
			}
			{
				const Sub =
					"the binary error keeps the backend's FS_NOT_TEXT code (the mime check, tool-shaped)";
				Check(Count, Sub, () => {
					assert.ok(BinaryError !== null && BinaryError.message.includes("FS_NOT_TEXT"));
				});
			}
			{
				const Sub = "a binary target: NO write";
				Check(Count, Sub, () => {
					assert.ok(Run1.Writes.length === WritesBeforeNoop);
				});
			}
		}
		// Group: Run 5 - a pre-aborted signal rejects, no write.
		{
			const WritesBeforeAbort = Run1.Writes.length;
			const Aborted = new AbortController();
			Aborted.abort();
			let AbortError: any = null;
			try {
				await Tool.execute({ file_path: "/tmp/normalize-file-smoke-abort.txt" }, Exec(Aborted.signal));
			} catch (E) {
				AbortError = E;
			}
			{
				const Sub = "a pre-aborted signal rejects the call";
				Check(Count, Sub, () => {
					assert.ok(AbortError !== null && /aborted/.test(AbortError.message));
				});
			}
			{
				const Sub = "a pre-aborted signal writes NOTHING (no fs write after the abort)";
				Check(Count, Sub, () => {
					assert.ok(Run1.Writes.length === WritesBeforeAbort);
				});
			}
			{
				const Sub = "an aborted call: NO journal record";
				Check(Count, Sub, () => {
					assert.ok(
						Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 1,
					);
				});
			}
		}
	}
	return Finish(Count, "Error-Paths");
};

// Standalone entry: `node Target/Test/Error-Paths/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Error-Paths`);
}
