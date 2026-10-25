// Source/Test/Loader-And-Activation/Test.ts - the loader contract, the cold
// disabled mount, the enabled activation proof (byte-exact), the apply-time
// wiring, the pass-through discipline, the pack filter, the schema
// fail-loud, and the mount purity.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LedgerLines,
	LedgerWith,
	MakeCounter,
	Make,
	Plugin,
	rm,
	Validate,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the loader contract.
	{
		Check(Count, "L1: the default object carries name/apply/Config/inject", () => {
			assert.equal(Plugin.name, "test-suggester");
			assert.equal(typeof Plugin.apply, "function");
			assert.ok(Plugin.Config !== undefined);
			assert.deepEqual(Plugin.inject, ["pluginFactory"]);
		});
	}

	// Group L2: the cold disabled mount.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: false }));
		Check(Count, "L2: apply returns NOTHING and the state probe exists", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.State !== undefined);
			assert.equal(Run.State.On, false);
		});
		Check(Count, "L2: the cold mount logs the byte-exact disabled line", () => {
			assert.deepEqual(Run.Lines, ["test-suggester: disabled (enabled=false)"]);
		});
		Check(Count, "L2: the disabled line is in the durable ledger exactly once", () => {
			assert.equal(LedgerWith("disabled (enabled=false)").length, 1);
			assert.ok(LedgerLines()[0]?.endsWith("] disabled (enabled=false)"));
		});
		Check(Count, "L2: a disabled mount still wires both listeners on the plugin ctx", () => {
			assert.ok(Run.CtxListeners["tools/post-execute"] instanceof Function);
			assert.ok(Run.CtxListeners["agent/pre-step"] instanceof Function);
		});
	}

	// Group L3: the enabled activation.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Check(Count, "L3: the activation line is byte-exact", () => {
			assert.ok(
				Run.Lines.includes("test-suggester: activated (bundle 0.2.0, intents 2, threshold 0.75)"),
			);
		});
		Check(Count, "L3: the activation line is in the durable ledger exactly once", () => {
			assert.equal(
				LedgerWith("activated (bundle 0.2.0, intents 2, threshold 0.75)").length,
				1,
			);
		});
		Check(Count, "L3: the listeners register on the plugin ctx in order", () => {
			assert.deepEqual(Object.keys(Run.CtxListeners), [
				"loader/volatile-update",
				"tools/post-execute",
				"agent/pre-step",
			]);
		});
		Check(Count, "L3: the root is a distinct context object", () => {
			assert.notEqual(Run.Root, Run.Context);
		});
	}

	// Group L4: the pass-through discipline and the pack filter.
	{
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		const Decision = { kind: "allow" };
		await CheckAsync(Count, "L4: a non-judged tool passes the decision through unchanged", async () => {
			const Result = await Run.CtxListeners["tools/post-execute"](
				{ name: "write", arguments: { file_path: "x.md" }, agent: { agent: { id: "a" } } },
				undefined,
				async () => Decision,
			);
			assert.equal(Result, Decision);
			assert.deepEqual(Run.Lines.filter((L: string) => L.includes("candidates call")), []);
		});
		Check(Count, "L4: an intents filter removes the pack intent from the compiled rules", () => {
			const Filtered = Make(Validate({ logFile: Ledger, enabled: true, intents: ["Counts"] }));
			assert.equal(Filtered.State.Rules.length, 1);
			assert.equal(Filtered.State.Rules[0].id, "Counts");
			assert.ok(
				Filtered.Lines.includes("test-suggester: activated (bundle 0.2.0, intents 1, threshold 0.75)"),
			);
		});
	}

	// Group L5: the fail-loud config validation.
	{
		Check(Count, "L5: a non-numeric threshold fails loud at load", () => {
			assert.throws(() => Validate({ threshold: "high" }));
		});
		Check(Count, "L5: a non-boolean enabled fails loud at load", () => {
			assert.throws(() => Validate({ enabled: "yes" }));
		});
	}

	// Group L6: the mount purity.
	{
		rm();
		const Run = Make(Validate({ logFile: Ledger, enabled: true }));
		Check(Count, "L6: the mount performs ZERO fs operations (read-only by design)", () => {
			assert.equal(Run.Fs.reads.length, 0);
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.resolved.length, 0);
			assert.equal(Run.Fs.stats.length, 0);
		});
		Check(Count, "L6: the state probe carries the factory's module identity", () => {
			assert.equal(Run.State.Module, "test-suggester");
			assert.equal(Run.State.Rules.length, 2);
			assert.equal(Run.State.Threshold, 0.75);
		});
	}
	return Finish(Count, "Loader-And-Activation");
};

// Standalone entry: `node Target/Test/Loader-And-Activation/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Loader-And-Activation`);
}
