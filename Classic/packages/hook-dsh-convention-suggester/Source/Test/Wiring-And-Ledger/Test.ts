// Source/Test/Wiring-And-Ledger/Test.ts - the wiring and the ledger: the
// loader contract (the default object carries name/apply/Config/inject,
// apply returns nothing), the context-only listener registration with the
// distinct root identity, the byte-exact activation and disabled lines
// (logger form and durable `[ISO]` form), the config fail-loud, the schema
// defaults and the compiled pack on the built State, and the fs purity (the
// convention suggester is a NON-MANIFEST module: zero ctx.fs calls).
import assert from "node:assert/strict";
import {
	AgentOf,
	Check,
	CheckAsync,
	Durable,
	Exports,
	Finish,
	FirstLine,
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
			assert.equal(Plugin.name, "convention-suggester");
			assert.equal(Plugin.apply, Exports.apply);
			assert.equal(Plugin.Config, Exports.Config);
			assert.deepEqual(Plugin.inject, ["pluginFactory"]);
			assert.equal(Exports.name, "convention-suggester");
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
		Check(Count, "W2: the two listeners register on the plugin context only", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), [
				"loader/volatile-update",
				"tools/post-execute",
				"agent/pre-step",
			]);
			assert.deepEqual(Run.RootNames, []);
			assert.notEqual(Run.Root, Run.Context);
			assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
		});
		Check(Count, "W2: the activation line is byte-exact in the logger form", () => {
			assert.deepEqual(Run.Lines, ["convention-suggester: activated (bundle 0.3.0, intents 4, threshold 0.75)"]);
			assert.deepEqual(Run.Effects, []);
		});
		Check(Count, "W2: the activation line is byte-exact in the durable form", () => {
			assert.equal(LedgerLines().length, 1);
			assert.match(FirstLine(), Durable("activated (bundle 0.3.0, intents 4, threshold 0.75)"));
			assert.deepEqual(LedgerWith("activated (bundle 0.3.0, intents 4, threshold 0.75)").length, 1);
		});
	}

	// Group W3: the disabled mount.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: false }));
		Check(Count, "W3: the disabled line is byte-exact in both forms", () => {
			assert.deepEqual(Run.Lines, ["convention-suggester: disabled (enabled=false)"]);
			assert.equal(LedgerLines().length, 1);
			assert.match(FirstLine(), Durable("disabled (enabled=false)"));
		});
		await CheckAsync(Count, "W3: a disabled mount passes every call through with zero new lines", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "write", arguments: { file_path: "Source/Function/Apply.ts" }, agent: AgentOf("a") }, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Run.Lines, ["convention-suggester: disabled (enabled=false)"]);
			assert.equal(LedgerLines().length, 1);
		});
	}

	// Group W4: the config fail-loud, the defaults, and the compiled pack.
	{
		Check(Count, "W4: a string cooldownCalls fails loud at load", () => {
			assert.throws(() => Validate({ cooldownCalls: "soon" }), /expected number but got soon/);
		});
		Check(Count, "W4: a string exclude fails loud at load", () => {
			assert.throws(() => Validate({ exclude: "Target" }), /expected array but got Target/);
		});
		const Run = Setup();
		Check(Count, "W4: the schema defaults land on the built State", () => {
			assert.equal(Run.State.On, true);
			assert.equal(Run.State.Threshold, 0.75);
			assert.equal(Run.State.MaxCandidates, 7);
			assert.equal(Run.State.MaxNoteChars, 1200);
			assert.equal(Run.State.Cooldown, 6);
			assert.equal(Run.State.MaxNotesPerTurn, 3);
			assert.deepEqual(Run.State.Intents, []);
			assert.deepEqual(Run.State.EmitOn, ["edit", "raw-write", "write"]);
			assert.deepEqual(Run.State.Exclude, ["node_modules", "Target", ".git", "dist"]);
			assert.equal(Run.State.Factory, Run.Context.pluginFactory);
		});
		Check(Count, "W4: the pack is compiled once at apply (all four intents, thresholds raised to max)", () => {
			assert.deepEqual(Run.State.Rules.map((Rule: any) => Rule.id), ["Layout", "Naming", "Docs", "Ledger"]);
			assert.deepEqual(Run.State.Rules.map((Rule: any) => Rule.threshold), [0.75, 0.75, 0.75, 0.85]);
			for (const Rule of Run.State.Rules) {
				for (const Signal of Rule.signals) {
					assert.equal(Signal.pattern instanceof RegExp, true);
				}
			}
			assert.equal(Run.State.Rules[0].signals[0].pattern.source, "Source\\/(Function|Interface|Variable)\\/");
		});
		Check(Count, "W4: a configured intent list filters the pack", () => {
			const Filtered = Make(Validate({ logFile: Ledger, enabled: true, intents: ["Ledger"] }));
			assert.deepEqual(Filtered.State.Rules.map((Rule: any) => Rule.id), ["Ledger"]);
			assert.ok(Filtered.Lines.includes("convention-suggester: activated (bundle 0.3.0, intents 1, threshold 0.75)"));
		});
	}

	// Group W5: the fs purity (the NON-MANIFEST posture).
	{
		const Run = Setup();
		await Post(Run, { name: "write", arguments: { file_path: "Source/Function/Apply.ts" }, agent: AgentOf("a") });
		await Post(Run, { name: "write", arguments: { file_path: "random/path/file.txt" }, agent: AgentOf("a") });
		Check(Count, "W5: zero ctx.fs calls across emit and silence", () => {
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
