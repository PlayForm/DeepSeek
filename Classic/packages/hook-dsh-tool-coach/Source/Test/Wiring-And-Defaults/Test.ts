// Source/Test/Wiring-And-Defaults/Test.ts - one singular test: the loader
// contract and the config defaults are the two surfaces every other folder
// (and every consumer) silently depends on - the volatile cells, the defaults,
// the activation posture (six registrations, the REAL factory on the state,
// the byte-exact activation ledger line, the durable [ISO] proof), and the
// fail-loud validation refusals. A drift here breaks every later folder, so
// it is its own folder. Runs standalone (`node Target/Test/Wiring-And-Defaults/Test.js`)
// AND under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-tool-coach. The assertions are moved
// verbatim from Classic/smokes/tool-coach-smoke.mjs (Run 1 + the fail-loud
// validation checks).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
	Check,
	Coach,
	DEFAULT_EXEMPTS,
	DEFAULT_PATTERNS,
	Finish,
	Furnace,
	Make,
	MakeCounter,
	NOTE_DENIED,
	NOTE_DENIED_TOOL,
	NOTE_FIRST,
	NOTE_PERSISTENT,
	Validate,
	Ledger,
	rm,
	CAT_ROW,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: the volatile cells and the config defaults (the schema's
	// `{ get }` cell shape + every default value).
	rm();
	const Raw1 = Validate({ logFile: Ledger });
	{
		Check(Count, "volatile cell: log arrives as { get }", () => {
			assert.equal(typeof Raw1.log.get, "function");
		});
		Check(Count, "volatile cell: enabled arrives as { get }", () => {
			assert.equal(typeof Raw1.enabled.get, "function");
		});
		Check(Count, "volatile cell: fetchLive arrives as { get }", () => {
			assert.equal(typeof Raw1.fetchLive.get, "function");
		});
		Check(Count, "volatile cell: notes arrives as { get } (object cell)", () => {
			assert.equal(typeof Raw1.notes.get, "function");
		});
	}
	{
		Check(Count, "config default threshold=3", () => {
			assert.equal(Raw1.threshold.get(), 3);
		});
		Check(Count, "config default window=8", () => {
			assert.equal(Raw1.window.get(), 8);
		});
		Check(Count, "config default cooldown=10", () => {
			assert.equal(Raw1.cooldown.get(), 10);
		});
		Check(Count, "config default escalateThreshold=6", () => {
			assert.equal(Raw1.escalateThreshold.get(), 6);
		});
		Check(Count, "config default cleanWindow=12", () => {
			assert.equal(Raw1.cleanWindow.get(), 12);
		});
		Check(Count, "config default enforce=off", () => {
			assert.equal(Raw1.enforce.get(), "off");
		});
		Check(Count, "config default enforceThreshold=4", () => {
			assert.equal(Raw1.enforceThreshold.get(), 4);
		});
		Check(Count, "config default maxSectionTools=5", () => {
			assert.equal(Raw1.maxSectionTools.get(), 5);
		});
		Check(Count, "config default sectionTtl=20", () => {
			assert.equal(Raw1.sectionTtl.get(), 20);
		});
		Check(Count, "config default fetchLive=true", () => {
			assert.equal(Raw1.fetchLive.get(), true);
		});
		Check(Count, "config default judgeTools=[bash,pwsh]", () => {
			assert.equal(
				JSON.stringify(Raw1.judgeTools.get()),
				JSON.stringify(["bash", "pwsh"]),
			);
		});
		Check(Count, "config default notes: the four verbatim templates", () => {
			assert.equal(
				JSON.stringify(Raw1.notes.get()),
				JSON.stringify({
					first: NOTE_FIRST,
					persistent: NOTE_PERSISTENT,
					denied: NOTE_DENIED,
					deniedTool: NOTE_DENIED_TOOL,
				}),
			);
		});
		Check(Count, "config default patternTable = the built-in adversarial table", () => {
			assert.equal(
				JSON.stringify(Raw1.patternTable.get()),
				JSON.stringify(DEFAULT_PATTERNS),
			);
		});
		Check(Count, "config default exemptPatterns = the built-in legitimate-bash boundary", () => {
			assert.equal(
				JSON.stringify(Raw1.exemptPatterns.get()),
				JSON.stringify(DEFAULT_EXEMPTS),
			);
		});
	}
	// Group: the apply-time wiring and the activation (the REAL factory, the
	// six registrations, the state probe, the byte-exact ledger lines).
	{
		const Run1 = Make(Raw1);
		Check(Count, "apply returns NOTHING (the loader contract)", () => {
			assert.equal(Run1.Returned, undefined);
		});
		Check(Count, "all FIVE coaching listeners are registered", () => {
			assert.ok(
				[
					"tools/post-execute",
					"tools/pre-execute",
					"agent/pre-step",
					"system-prompt/assemble",
					"tools/change",
				].every((Name) => typeof Run1.Listeners[Name] === "function"),
			);
		});
		Check(Count, "plus the State builder's P10 loader/volatile-update refresh", () => {
			assert.ok(Run1.Listeners["loader/volatile-update"] !== undefined);
		});
		Check(Count, "exactly six registrations (5 coaching + 1 volatile refresh)", () => {
			assert.equal(Object.keys(Run1.Listeners).length, 6);
		});
		Check(
			Count,
			"tools/post-execute is a PLAIN registration (runs AFTER CCR's {prepend:true})",
			() => {
				assert.equal(Run1.ListenerOptions["tools/post-execute"], undefined);
			},
		);
		Check(Count, "pre-execute and assemble are plain registrations too", () => {
			assert.ok(
				Run1.ListenerOptions["tools/pre-execute"] === undefined &&
					Run1.ListenerOptions["system-prompt/assemble"] === undefined,
			);
		});
		Check(Count, "the module identity is hook-dsh-tool-coach", () => {
			assert.equal(Coach.name, "hook-dsh-tool-coach");
		});
		Check(Count, "inject = [pluginFactory, tools]", () => {
			assert.equal(JSON.stringify(Coach.inject), JSON.stringify(["pluginFactory", "tools"]));
		});
		Check(Count, "state module = hook-dsh-tool-coach (the ledger prefix)", () => {
			assert.equal(Run1.State.Module, "hook-dsh-tool-coach");
		});
		Check(Count, "state carries the REAL factory instance", () => {
			assert.ok(Run1.State.Factory === Furnace);
		});
		Check(Count, "volatile unwrap: enabled cell -> State.On=true", () => {
			assert.equal(Run1.State.On, true);
		});
		Check(Count, "volatile unwrap: threshold cell -> State.Threshold=3", () => {
			assert.equal(Run1.State.Threshold, 3);
		});
		Check(Count, "volatile unwrap: fetchLive cell -> State.FetchLive=true", () => {
			assert.equal(Run1.State.FetchLive, true);
		});
		Check(Count, "activation ledger line byte-exact", () => {
			assert.ok(
				Run1.Lines.includes(
					"hook-dsh-tool-coach: activated (bundle 0.3.0, threshold=3/8, cooldown=10, escalate=6, clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)",
				),
			);
		});
		Check(Count, "the durable ledger file carries the [ISO] activation line", () => {
			assert.ok(
				FileSystem.existsSync(Ledger) &&
					FileSystem.readFileSync(Ledger, "utf8").includes(
						"] activated (bundle 0.3.0, threshold=3/8, cooldown=10, escalate=6, clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)",
					),
			);
		});
	}
	// Group: fail-loud validation (the schema refusals throw at load).
	{
		Check(Count, "fail-loud validation: an invalid config throws at load with a clear error", () => {
			let Threw: any = null;
			try {
				Make(Validate({ threshold: 0 }));
			} catch (Error) {
				Threw = Error;
			}
			assert.ok(Threw !== null && Threw.message === "hook-dsh-tool-coach: threshold must be >= 1");
		});
		Check(
			Count,
			"fail-loud validation: a user row duplicating a built-in pattern is rejected",
			() => {
				let Threw: any = null;
				try {
					Make(
						Validate({
							patternTable: [...DEFAULT_PATTERNS, { pattern: CAT_ROW, class: "read", tool: "read" }],
						}),
					);
				} catch (Error) {
					Threw = Error;
				}
				assert.ok(Threw !== null && Threw.message.includes("duplicates a built-in pattern"));
			},
		);
		Check(Count, "fail-loud validation: maxSectionTools outside 1-24 is rejected", () => {
			let Threw: any = null;
			try {
				Make(Validate({ maxSectionTools: 0 }));
			} catch (Error) {
				Threw = Error;
			}
			assert.ok(
				Threw !== null &&
					Threw.message === "hook-dsh-tool-coach: maxSectionTools must be between 1 and 24",
			);
		});
	}
	return Finish(Count, "Wiring-And-Defaults");
};

// Standalone entry: `node Target/Test/Wiring-And-Defaults/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Defaults`);
}
