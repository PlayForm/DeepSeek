// Source/Test/Wiring-And-Contract/Test.ts - the wiring and the contract: the
// loader contract (the default object carries name/apply/Config/inject; apply
// returns nothing), the IDLE-forever cold mount, the enabled mount's
// byte-exact activation line, the five tool registrations, the no-listeners
// posture (a pure consumer registers no root listeners and no services), the
// State probe, the fail-loud validation, and the fs purity invariant.
import assert from "node:assert/strict";
import Plugin, { apply, Config, inject, name } from "../../../Target/Library.js";
import {
	Check,
	Finish,
	Ledger,
	LedgerLines,
	Make,
	MakeCounter,
	rm,
	StandardGraph,
	Validate,
} from "../Harness.js";

/** A standard enabled mount over the standard graph. */
const Setup = (): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
};

/** Unwrap the volatile cells the schema resolution returns (the `{ get }`
 * shape the loader hands to apply). */
const Plain = (Raw: any): any =>
	Object.fromEntries(
		Object.entries(Raw).map(([Key, Value]) => [
			Key,
			typeof (Value as any)?.get === "function" ? (Value as any).get() : Value,
		]),
	);

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group W1: the loader contract.
	{
		const Run = Setup();
		Check(Count, "W1: the default export carries name, apply, Config and inject", () => {
			assert.equal(Plugin.name, name);
			assert.equal(Plugin.apply, apply);
			assert.equal(Plugin.Config, Config);
			assert.deepEqual(Plugin.inject, inject);
		});
		Check(Count, "W1: the identity is the package name and the inject list is the three services", () => {
			assert.equal(name, "plugin-dsh-workspace");
			assert.deepEqual(inject, ["workspaceGraph", "pluginFactory", "tools"]);
		});
		Check(Count, "W1: apply returns NOTHING (a returned value kills event delivery)", () => {
			assert.equal(Run.Returned, undefined);
		});
		Check(Count, "W1: the schema fills the defaults the contract documents", () => {
			const Knobs = Plain(Validate({}));
			assert.equal(Knobs.enabled, false);
			assert.equal(Knobs.mapDepth, 2);
			assert.equal(Knobs.mapMaxModules, 20);
			assert.equal(Knobs.findLimit, 50);
			assert.equal(Knobs.findLimitMax, 500);
			assert.equal(Knobs.expandDepth, 1);
			assert.equal(Knobs.expandMaxNeighbors, 50);
			assert.equal(Knobs.packetTokenBudget, 2000);
			assert.equal(Knobs.packetTokenMax, 4000);
			assert.equal(Knobs.tokenCharsPerToken, 4);
			assert.deepEqual(Knobs.kinds, []);
		});
	}

	// Group W2: the IDLE-forever cold mount.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger }), StandardGraph());
		Check(Count, "W2: a disabled mount still serves the tools (the refusal lives in execute) and logs the byte-exact disabled line", () => {
			assert.deepEqual(
				Run.Registered.map((Definition: any) => Definition.name),
				[
					"workspace_map",
					"workspace_find",
					"workspace_expand",
					"workspace_context",
					"workspace_index",
				],
			);
			assert.deepEqual(Run.Lines, ["plugin-dsh-workspace: disabled (enabled=false)"]);
		});
		Check(Count, "W2: the disabled line is durable in the ledger file too", () => {
			assert.equal(
				LedgerLines().filter((Line) => Line.endsWith("plugin-dsh-workspace: disabled (enabled=false)")).length,
				0,
			);
			assert.equal(
				LedgerLines().filter((Line) => Line.endsWith("disabled (enabled=false)")).length,
				1,
			);
		});
	}

	// Group W3: the enabled mount's wiring.
	{
		const Run = Setup();
		Check(Count, "W3: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, ["plugin-dsh-workspace: activated (bundle 0.3.0, tools=5)"]);
		});
		Check(Count, "W3: the durable activation line carries the same message after the ISO stamp", () => {
			assert.equal(
				LedgerLines().filter((Line) => Line.endsWith("activated (bundle 0.3.0, tools=5)")).length,
				1,
			);
		});
		Check(Count, "W3: the five tools are registered in contract order", () => {
			assert.deepEqual(
				Run.Registered.map((Definition: any) => Definition.name),
				[
					"workspace_map",
					"workspace_find",
					"workspace_expand",
					"workspace_context",
					"workspace_index",
				],
			);
		});
		Check(Count, "W3: a consumer registers NO root listeners and NO services", () => {
			assert.deepEqual(Object.keys(Run.RootListeners), []);
			assert.deepEqual(Object.keys(Run.Provided), []);
		});
		Check(Count, "W3: the only ctx listener is the factory's loader/volatile-update", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update"]);
		});
		Check(Count, "W3: the State probe carries the contract fields", () => {
			assert.equal(Run.State.On, true);
			assert.equal(Run.State.MapDepth, 2);
			assert.equal(Run.State.FindLimit, 50);
			assert.equal(Run.State.FindLimitMax, 500);
			assert.equal(Run.State.PacketTokenBudget, 2000);
			assert.equal(Run.State.PacketTokenMax, 4000);
			assert.equal(Run.State.TokenCharsPerToken, 4);
			assert.deepEqual(Run.State.Kinds, []);
			assert.equal(Run.State.Ledger, Ledger);
			assert.equal(Run.State.Module, "plugin-dsh-workspace");
			assert.equal(Run.State.LastPacketTokens, 0);
			assert.equal(Run.State.Graph, Run.Graph);
		});
	}

	// Group W4: the fail-loud validation.
	{
		Check(Count, "W4: mapDepth below 1 fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, mapDepth: 0 }), StandardGraph()),
				/plugin-dsh-workspace: mapDepth must be >= 1/,
			);
		});
		Check(Count, "W4: findLimitMax below findLimit fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, findLimit: 50, findLimitMax: 10 }), StandardGraph()),
				/plugin-dsh-workspace: findLimitMax must be >= findLimit/,
			);
		});
		Check(Count, "W4: expandDepth above 3 fails loud (the graph contract caps depth at 3)", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, expandDepth: 4 }), StandardGraph()),
				/plugin-dsh-workspace: expandDepth must be >= 1 and <= 3/,
			);
		});
		Check(Count, "W4: an unknown node kind fails loud at load (the schema's union, before apply)", () => {
			assert.throws(
				() => Validate({ logFile: Ledger, enabled: true, kinds: ["Widget"] }),
				/Widget/,
			);
		});
	}

	// Group W5: the fs purity invariant.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }), StandardGraph());
		Check(Count, "W5: the wiring never touches the fs seam (zero reads, writes, resolves, stats)", () => {
			assert.deepEqual(Run.Fs.resolves, []);
			assert.deepEqual(Run.Fs.stats, []);
			assert.deepEqual(Run.Fs.reads, []);
			assert.deepEqual(Run.Fs.writes, []);
			assert.equal(LedgerLines().length, 1);
		});
	}
	return Finish(Count, "Wiring-And-Contract");
};

// Standalone entry: `node Target/Test/Wiring-And-Contract/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Contract`);
}
