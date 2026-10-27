// Source/Test/Wiring-And-Ledger/Test.ts - the wiring and the ledger: the
// loader contract (the default object carries name/apply/Config/inject,
// apply returns nothing), the four-listener registration with the distinct
// root identity, the byte-exact activation and disabled lines (logger form
// and durable `[ISO]` form), the config fail-loud, the schema defaults and
// the knowledge load on the built State, and the fs purity (the suggester
// writes its knowledge through its own node:fs channel, never ctx.fs).
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
	AgentOf,
	Check,
	CheckAsync,
	Durable,
	Exports,
	Finish,
	FirstLine,
	Knowledge,
	Ledger,
	LedgerLines,
	LedgerWith,
	Make,
	MakeCounter,
	Plugin,
	Post,
	rm,
	Setup,
	Validate,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group W1: the loader contract.
	{
		Check(Count, "W1: the default object carries name/apply/Config/inject", () => {
			assert.equal(Plugin.name, "hook-dsh-search-suggester");
			assert.equal(Plugin.apply, Exports.apply);
			assert.equal(Plugin.Config, Exports.Config);
			assert.deepEqual(Plugin.inject, ["pluginFactory"]);
			assert.equal(Exports.name, "hook-dsh-search-suggester");
			assert.equal(typeof Plugin.apply, "function");
			assert.equal(typeof Plugin.Config, "function");
		});
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Check(Count, "W1: apply returns NOTHING (a returned value kills delivery)", () => {
			assert.equal(Run.Returned, undefined);
		});
	}

	// Group W2: the listener wiring.
	{
		const Run = Setup();
		Check(Count, "W2: the four listeners register on the plugin context only", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), [
				"loader/volatile-update",
				"tools/post-execute",
				"agent/pre-step",
				"system-prompt/assemble",
				"tools/change",
			]);
			assert.deepEqual(Run.RootNames, []);
			assert.notEqual(Run.Root, Run.Context);
			assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
		});
		Check(Count, "W2: the activation line is byte-exact in the logger form", () => {
			assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: activated (bundle 0.3.0, intents 10, threshold 0.75)"]);
			assert.deepEqual(Run.Effects, []);
		});
		Check(Count, "W2: the activation line is byte-exact in the durable form", () => {
			assert.equal(LedgerLines().length, 1);
			assert.match(FirstLine(), Durable("activated (bundle 0.3.0, intents 10, threshold 0.75)"));
			assert.deepEqual(LedgerWith("activated (bundle 0.3.0, intents 10, threshold 0.75)").length, 1);
		});
	}

	// Group W3: the disabled mount.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: false }));
		Check(Count, "W3: the disabled line is byte-exact in both forms", () => {
			assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: disabled (enabled=false)"]);
			assert.equal(LedgerLines().length, 1);
			assert.match(FirstLine(), Durable("disabled (enabled=false)"));
		});
		await CheckAsync(Count, "W3: a disabled mount passes every call through with zero new lines", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "grep", arguments: { pattern: "1.2.3 version", path: "package.json" }, agent: AgentOf("a") }, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Run.Lines, ["hook-dsh-search-suggester: disabled (enabled=false)"]);
			assert.equal(LedgerLines().length, 1);
		});
	}

	// Group W4: the config fail-loud, the defaults, and the knowledge load.
	{
		Check(Count, "W4: a string maxCandidates fails loud at load", () => {
			assert.throws(() => Validate({ maxCandidates: "many" }), /expected number but got many/);
		});
		Check(Count, "W4: a string intents fails loud at load", () => {
			assert.throws(() => Validate({ intents: "Version" }), /expected array but got Version/);
		});
		const Run = Setup();
		Check(Count, "W4: the schema defaults land on the built State", () => {
			assert.equal(Run.State.On, true);
			assert.equal(Run.State.Threshold, 0.75);
			assert.equal(Run.State.MaxCandidates, 7);
			assert.equal(Run.State.MaxNoteChars, 1200);
			assert.equal(Run.State.CooldownCalls, 6);
			assert.equal(Run.State.MaxNotesPerTurn, 3);
			assert.equal(Run.State.Learn, true);
			assert.equal(Run.State.LearnWindow, 2);
			assert.equal(Run.State.SectionMode, "off");
			assert.equal(Run.State.SectionTtl, 20);
			assert.deepEqual(Run.State.EmitOn, ["grep", "glob", "read", "bash"]);
			assert.deepEqual(Run.State.Intents, [
				"Version",
				"Path",
				"Ledger",
				"Config",
				"Dependency",
				"Test",
				"Symbol",
				"Doc",
				"Usage",
				"Owner",
			]);
			assert.deepEqual(Run.State.Exclude, ["node_modules", "Target", ".git", "Site/Target", "dist"]);
			assert.equal(Run.State.Pack.length, 10);
			assert.equal(Run.State.Factory, Run.Context.pluginFactory);
		});
		Check(Count, "W4: the knowledge loads cold from a missing file and after a save it reloads", () => {
			assert.deepEqual(Run.State.Knowledge.stats, { emitted: 0, followed: 0, ignored: 0, dismissed: 0 });
			assert.equal(FileSystem.existsSync(Knowledge), false);
		});
	}

	// Group W5: the fs purity (the own-channel posture).
	{
		const Run = Setup();
		await Post(Run, { name: "grep", arguments: { pattern: "1.2.3 version", path: "package.json" }, agent: AgentOf("a") });
		await Post(Run, { name: "grep", arguments: { pattern: "unrelated query", path: "" }, agent: AgentOf("a") });
		Check(Count, "W5: zero ctx.fs calls across emit and abstain", () => {
			assert.equal(Run.Fs.reads, 0);
			assert.equal(Run.Fs.writes, 0);
		});
		Check(Count, "W5: no logger warnings (the fail-open path never fired)", () => {
			assert.deepEqual(Run.Warns, []);
		});
	}
	return Finish(Count, "Wiring-And-Ledger");
};

// Standalone entry: `node Target/Test/Wiring-And-Ledger/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Ledger`);
}
