// Source/Test/Config-And-Activation/Test.ts - one singular test: the config
// surface and the activation posture - every volatile cell arriving as
// `{ get }`, every config default (thresholdBytes through protectLastTurns,
// the multipliers, the 8-tool targets, the exempt list), the byte-exact
// activation ledger line (both the logger form and the durable [ISO] file
// form), and the activation record journaled to the shared storage domain.
// Runs standalone (`node Target/Test/Config-And-Activation/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-ccr: the fake ctx + the REAL factory +
// the REAL CCR apply, from the Harness.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
	Check,
	Finish,
	MakeCounter,
	Make,
	Rm,
	Validate,
	Ledger,
	Furnace,
	TextBlock,
	Exec,
	NextAccept,
	TerminalText,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run 1 - the volatile cells and the config defaults.
	Rm();
	const Raw1 = Validate({ logFile: Ledger });
	{
		const Sub = "volatile cell: log arrives as { get }";
		Check(Count, Sub, () => {
			assert.ok(typeof Raw1.log.get === "function");
		});
	}
	{
		const Sub = "volatile cell: logFile arrives as { get }";
		Check(Count, Sub, () => {
			assert.ok(typeof Raw1.logFile.get === "function");
		});
	}
	{
		const Sub = "volatile cell: thresholdBytes arrives as { get }";
		Check(Count, Sub, () => {
			assert.ok(typeof Raw1.thresholdBytes.get === "function");
		});
	}
	{
		const Sub = "volatile cell: previewMaxChars arrives as { get }";
		Check(Count, Sub, () => {
			assert.ok(typeof Raw1.previewMaxChars.get === "function");
		});
	}
	{
		const Sub = "volatile cell: multipliers arrives as { get }";
		Check(Count, Sub, () => {
			assert.ok(typeof Raw1.multipliers.get === "function");
		});
	}
	{
		const Sub = "config default thresholdBytes=1024";
		Check(Count, Sub, () => {
			assert.ok(Raw1.thresholdBytes.get() === 1024);
		});
	}
	{
		const Sub = "config default inlineThresholdBytes=1024";
		Check(Count, Sub, () => {
			assert.ok(Raw1.inlineThresholdBytes === 1024);
		});
	}
	{
		const Sub = "config default autoExpand=true";
		Check(Count, Sub, () => {
			assert.ok(Raw1.autoExpand === true);
		});
	}
	{
		const Sub = "config default autoExpandLimitBytes=102400";
		Check(Count, Sub, () => {
			assert.ok(Raw1.autoExpandLimitBytes === 102400);
		});
	}
	{
		const Sub = "config default compressFailures=false";
		Check(Count, Sub, () => {
			assert.ok(Raw1.compressFailures === false);
		});
	}
	{
		const Sub = "config default previewMaxChars=240";
		Check(Count, Sub, () => {
			assert.ok(Raw1.previewMaxChars.get() === 240);
		});
	}
	{
		const Sub = "config default ttlSeconds=3600";
		Check(Count, Sub, () => {
			assert.ok(Raw1.ttlSeconds === 3600);
		});
	}
	{
		const Sub = "config default storeBudgetBytes=268435456";
		Check(Count, Sub, () => {
			assert.ok(Raw1.storeBudgetBytes === 268435456);
		});
	}
	{
		const Sub = "config default journalPath='' (memory-only)";
		Check(Count, Sub, () => {
			assert.ok(Raw1.journalPath === "");
		});
	}
	{
		const Sub = "config default logFile: ~/.dsh/playform/hook-dsh-ccr.log (the documented default)";
		Check(Count, Sub, () => {
			assert.equal(
				Validate({}).logFile.get(),
				"~/.dsh/playform/hook-dsh-ccr.log",
				"logFile default (volatile cell) - the value the patch row and the site document",
			);
		});
	}
	{
		const Sub = "config default contextEngine=false (phase 4, inert)";
		Check(Count, Sub, () => {
			assert.ok(Raw1.contextEngine === false);
		});
	}
	{
		const Sub = "config default contextEngineThresholdPct=30";
		Check(Count, Sub, () => {
			assert.ok(Raw1.contextEngineThresholdPct === 30);
		});
	}
	{
		const Sub = "config default protectFirstTurns=2";
		Check(Count, Sub, () => {
			assert.ok(Raw1.protectFirstTurns === 2);
		});
	}
	{
		const Sub = "config default protectLastTurns=4";
		Check(Count, Sub, () => {
			assert.ok(Raw1.protectLastTurns === 4);
		});
	}
	{
		const Sub = "config default multipliers: error \u00D78, grep/paths/web \u00D72, the rest \u00D71";
		Check(Count, Sub, () => {
			assert.ok(
				JSON.stringify(Raw1.multipliers.get()) ===
					JSON.stringify({
						terminal: 1,
						error: 8,
						grep: 2,
						paths: 2,
						file: 1,
						json: 1,
						web: 2,
						default: 1,
					}),
			);
		});
	}
	{
		const Sub = "config default targets: the 8-tool terminal/search/fetch family";
		Check(Count, Sub, () => {
			assert.ok(
				JSON.stringify(Raw1.targets) ===
					JSON.stringify([
						"bash",
						"glob",
						"grep",
						"read",
						"web_fetch",
						"web_search",
						"list",
						"search",
					]),
			);
		});
	}
	{
		const Sub = "config default exempt: mutators, the plugin's own tool, agents' briefs, user gates";
		Check(Count, Sub, () => {
			assert.ok(
				JSON.stringify(Raw1.exempt) ===
					JSON.stringify([
						"write",
						"edit",
						"raw-write",
						"subagent",
						"ask_user_question",
						"ccr_retrieve",
					]),
			);
		});
	}
	// Group: Run 1 - the activation posture (the byte-exact ledger line and the
	// journaled activation record).
	const Run1 = Make(Raw1);
	{
		const Sub =
			"activation ledger line byte-exact: 'ccr: activated (bundle 0.2.1, targets 8, budget 268435456)'";
		Check(Count, Sub, () => {
			assert.ok(
				Run1.Lines.includes("ccr: activated (bundle 0.2.1, targets 8, budget 268435456)"),
			);
		});
	}
	{
		const Sub = "the activation record journals to the shared storage domain with the identical detail";
		Check(Count, Sub, () => {
			assert.ok(
				Furnace.PendingJournal.some(
					(R: any) =>
						R.event === "activated" &&
						R.detail === "activated (bundle 0.2.1, targets 8, budget 268435456)",
				),
			);
		});
	}
	// Group: Run 8 - the durable ledger file carries the activation line in its
	// [ISO] form (the file form has no module prefix). A fresh default-config
	// run (targets 8) with one compressed result so both durable lines exist
	// verbatim; this folder asserts the activated one (the compressed one is
	// the Retrieve-And-Marker folder's).
	Rm();
	{
		const Sub =
			"the durable ledger file: '[ISO] activated (bundle 0.2.1, targets 8, budget 268435456)' (the file form has no module prefix)";
		const Run8 = Make(Validate({ autoExpand: false, logFile: Ledger }));
		{
			const Content = TextBlock(TerminalText("l".repeat(96), 26));
			await Run8.Listeners["tools/post-execute"](
				Exec("bash"),
				{ isError: false, value: {}, content: Content },
				NextAccept,
			);
		}
		await new Promise((R) => setTimeout(R, 10));
		const Log1 = existsSync(Ledger) ? readFileSync(Ledger, "utf8") : "";
		Check(Count, Sub, () => {
			assert.ok(
				Log1.split("\n").some((L) =>
					/^\[[^\]]+\] activated \(bundle 0\.2\.1, targets 8, budget 268435456\)$/.test(L),
				),
			);
		});
	}
	return Finish(Count, "Config-And-Activation");
};

// Standalone entry: `node Target/Test/Config-And-Activation/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Config-And-Activation`);
}
