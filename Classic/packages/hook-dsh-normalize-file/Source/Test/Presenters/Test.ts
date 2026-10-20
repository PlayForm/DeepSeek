// Source/Test/Presenters/Test.ts - one singular test: the presenters (pure,
// outcome-metadata driven) - the call-time generic card and the file
// location, the presentationMeta projection for a changed outcome, the diff
// card with the real before/after, and the no-op and error cases that
// produce no card. Runs standalone (`node
// Target/Test/Presenters/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-normalize-file: the fake ctx + the REAL
// factory + the REAL normalize-file apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	// Group: Run 7 - the presenters (pure, outcome-metadata driven).
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		const Tool = Run1.Registered[0];
		const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		const Normalized6 = 'a-b"c"...d efAg';
		const Fixture = "/tmp/normalize-file-smoke-fixture.txt";
		const Clean = "/tmp/normalize-file-smoke-clean.txt";
		{
			const Call7 = Tool.presentCall({ file_path: Fixture });
			{
				const Sub =
					"presentCall: the generic follow-along card (a call-time presenter has no access to the file's content)";
				Check(Count, Sub, () => {
					assert.ok(
						Call7.card === "generic" && Call7.kind === "edit" && Call7.title === `Normalize ${Fixture}`,
					);
				});
			}
			{
				const Sub = "presentCall: the file location for editor follow-along";
				Check(Count, Sub, () => {
					assert.ok(Call7.locations && Call7.locations[0].path === Fixture);
				});
			}
		}
		{
			const Metadata7 = Tool.output.presentationMeta(
				{},
				{ path: Fixture, count: 7, changed: true, before: All6, after: Normalized6 },
			);
			{
				const Sub = "presentationMeta projects the changed outcome's before/after";
				Check(Count, Sub, () => {
					assert.ok(
						Metadata7.changed === true &&
							Metadata7.path === Fixture &&
							Metadata7.before === All6 &&
							Metadata7.after === Normalized6,
					);
				});
			}
			const Card7 = Tool.presentResult({ file_path: Fixture }, { isError: false, content: [], meta: Metadata7 });
			{
				const Sub = "presentResult: the diff card for a changed file";
				Check(Count, Sub, () => {
					assert.ok(Card7 && Card7.card === "diff" && Card7.title === `Normalize ${Fixture}`);
				});
			}
			{
				const Sub = "the diff card shows the outcome's real before/after (the same-turn visibility)";
				Check(Count, Sub, () => {
					assert.ok(
						Card7 &&
							Card7.diffs[0].path === Fixture &&
							Card7.diffs[0].oldText === All6 &&
							Card7.diffs[0].newText === Normalized6,
					);
				});
			}
		}
		{
			const MetadataNoop = Tool.output.presentationMeta({}, { path: Clean, count: 0, changed: false });
			{
				const Sub = "presentationMeta for a no-op: changed=false, no before/after";
				Check(Count, Sub, () => {
					assert.ok(MetadataNoop.changed === false && MetadataNoop.path === Clean);
				});
			}
			{
				const Sub = "presentResult: no diff card for a no-op (the generic result renders)";
				Check(Count, Sub, () => {
					assert.ok(
						Tool.presentResult({ file_path: Clean }, { isError: false, content: [], meta: MetadataNoop }) ===
							undefined,
					);
				});
			}
			{
				const Sub = "presentResult: no card for an error result";
				Check(Count, Sub, () => {
					assert.ok(
						Tool.presentResult({ file_path: Fixture }, { isError: true, content: [], meta: undefined }) ===
							undefined,
					);
				});
			}
		}
	}
	return Finish(Count, "Presenters");
};

// Standalone entry: `node Target/Test/Presenters/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Presenters`);
}
