// Source/Test/Config-And-Registration/Test.ts - one singular test: the
// apply-time wiring of the file flavor - the config cells and the minimal
// schema, the listener-less posture (three listeners, no stream listener),
// the tool registration and its input schema, the state unwraps, the
// activation line, the apply-journals-nothing posture, and the
// fresh-state-per-apply probe.
// Runs standalone (`node Target/Test/Config-And-Registration/Test.js`) AND
// under the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/plugin-dsh-normalize-file: the fake ctx + the REAL
// factory + the REAL normalize-file apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	// Group: Run 1 - defaults + the listener-less posture.
	{
		const Raw1 = Validate({ logFile: Ledger });
		const Run1 = Make(Raw1);
		const Tool = Run1.Registered[0];
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
			const Sub = "minimal schema: no stream flags and no fs/observed fields (shared: false + two knobs)";
			Check(Count, Sub, () => {
				assert.ok(Raw1.normalizeReasoning === undefined && Raw1.mutationTools === undefined);
			});
		}
		{
			const Sub =
				"no stream listener (the family's first listener-less flavor); the three listeners are the P10 volatile-update refresh and the two overpass arms (both opt-in, gated at runtime)";
			Check(Count, Sub, () => {
				assert.ok(
					Object.keys(Run1.Listeners).length === 3 &&
						Run1.Listeners["loader/volatile-update"] !== undefined &&
						Run1.Listeners["tools/post-execute"] !== undefined &&
						Run1.Listeners["agent/pre-step"] !== undefined,
				);
			});
		}
		{
			const Sub = "exactly one tool registered";
			Check(Count, Sub, () => {
				assert.ok(Run1.Registered.length === 1);
			});
		}
		{
			const Sub = "the tool registration is captured: the tool is named normalize-file";
			Check(Count, Sub, () => {
				assert.ok(Tool && Tool.name === "normalize-file");
			});
		}
		{
			const Sub = "input schema: file_path is a required string";
			Check(Count, Sub, () => {
				assert.ok(
					Tool.parameters.properties.file_path.type === "string" &&
						Tool.parameters.required.includes("file_path"),
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
				assert.ok(Run1.State.Ledger === "/tmp/normalize-file-smoke-ledger.log");
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
			const Sub = "tool flavor: state carries no stream flags (no Reasoning/ToolArgs)";
			Check(Count, Sub, () => {
				assert.ok(!("Reasoning" in Run1.State) && !("ToolArgs" in Run1.State));
			});
		}
		{
			const Sub = "state module = plugin-dsh-normalize-file (the ledger prefix)";
			Check(Count, Sub, () => {
				assert.ok(Run1.State.Module === "plugin-dsh-normalize-file");
			});
		}
		{
			const Sub = "activation ledger line byte-exact";
			Check(Count, Sub, () => {
				assert.ok(
					Run1.Lines.includes(
						"plugin-dsh-normalize-file: activated (replacement=-, logFile=/tmp/normalize-file-smoke-ledger.log)",
					),
				);
			});
		}
		{
			const Sub =
				"apply journals NOTHING (the family's stream-flavor posture - only the tool's N>0 count is journaled, unlike the trio's activated record)";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.length === 0);
			});
		}
		{
			const Sub = "no normalized journal record before any tool call";
			Check(Count, Sub, () => {
				assert.ok(Furnace.PendingJournal.filter((R: any) => R.event === "normalized").length === 0);
			});
		}
	}
	// Group: Run 8 - each apply builds a FRESH state (no module-level globals).
	// The source suite compares Run1.State with the custom-replacement run's
	// State; this folder scaffolds that same second apply (its own assertions
	// live in Read-Write-Pipeline).
	{
		const Run1 = Make(Validate({ logFile: Ledger }));
		const Run6 = Make(Validate({ replacement: "$&", logFile: Ledger }));
		const First = Run1.State;
		const Second = Run6.State;
		{
			const Sub = "each apply builds a FRESH state (no module-level globals)";
			Check(Count, Sub, () => {
				assert.ok(First !== Second && First.Replacement === "-" && Second.Replacement === "$&");
			});
		}
	}
	return Finish(Count, "Config-And-Registration");
};

// Standalone entry: `node Target/Test/Config-And-Registration/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Config-And-Registration`);
}
