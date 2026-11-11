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
	SeedHistory,
	Service,
	Setup,
	Validate,
	Workspace,
} from "../Harness.js";

/**
 * @module Test
 *
 * The wiring and the ledger: the loader contract, the listener registration,
 * the byte-exact activation and disabled lines, the config fail-loud, the schema
 * defaults, and the fs purity.
 *
 * @remarks
 *
 * The loader contract (the default object carries name/apply/Config/inject,
 * apply returns nothing), the five-listener registration with the distinct root
 * identity, the byte-exact activation and disabled lines (logger form and
 * durable `[ISO]` form), the config fail-loud, the schema defaults and the
 * knowledge load on the built State, and the fs purity (the suggester writes its
 * knowledge through its own `node:fs` channel, never `ctx.fs`).
 *
 * THE HISTORY MODEL: the activation's second segment is `history` (there is no
 * boot pack), `State.Pack` is empty at apply, the per-session history is a
 * session-projection unit registered through `ctx.inject` (no `State` field, no
 * listener of its own), and the candidates come from the committed session
 * history.
 */
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
		Check(Count, "W2: the five listeners register on the plugin context only", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), [
				"loader/volatile-update",
				"tools/post-execute",
				"agent/pre-step",
				"system-prompt/assemble",
				"tools/change",
			]);
			assert.deepEqual(Run.Injected, [["sessionProjections"]]);
			assert.deepEqual(Run.RootNames, []);
			assert.notEqual(Run.Root, Run.Context);
			assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
		});
		Check(Count, "W2: the activation line is byte-exact in the logger form", () => {
			assert.deepEqual(Run.Lines, [`hook-dsh-search-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`]);
			assert.deepEqual(Run.Effects, []);
		});
		Check(Count, "W2: the activation line is byte-exact in the durable form", () => {
			assert.equal(LedgerLines().length, 1);
			assert.match(FirstLine(), Durable(`activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`));
			assert.deepEqual(LedgerWith(`activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`).length, 1);
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
			const Out = await Post(Run, { name: "read", arguments: { file_path: "README.md" }, agent: AgentOf("a") }, Decision);
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
			assert.equal(Run.State.SectionTTL, 20);
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
			// THE HISTORY MODEL: no boot pack, no State fold - the history is a
			// session-projection unit registered on the optional seam.
			assert.equal(Run.State.Pack.length, 0);
			assert.equal(Run.State.History, undefined);
			assert.equal(Run.Projections.Units.has("searchHistory"), true);
			assert.equal(Run.State.Factory, Run.Context.pluginFactory);
		});
		Check(Count, "W4: the knowledge loads cold from a missing file", () => {
			assert.deepEqual(Run.State.Knowledge.stats, { emitted: 0, followed: 0, ignored: 0, dismissed: 0 });
			assert.equal(FileSystem.existsSync(Knowledge), false);
		});
	}

	// Group W5: the fs purity (the own-channel posture).
	{
		const Space = Workspace(["README.md", "CHANGELOG.md", "SCHEME.md"]);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At("README.md"), ["CHANGELOG.md", "SCHEME.md"]);
		await Post(Run, { name: "read", arguments: { file_path: Space.At("README.md") }, agent: AgentOf("a") });
		await Post(Run, { name: "grep", arguments: { pattern: "unrelated query", path: Space.At("package.json") }, agent: AgentOf("a") });
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
