// Source/Test/Wiring-And-Index/Test.ts - the wiring and the index
// maintainer: the loader contract (apply returns nothing), the IDLE-forever
// cold mount, the root-context registration with the distinct root identity,
// the service registered from apply, the adapter registry, the activation
// proof, the invalidation on fs/observed (the monotonic revision, no wall
// clock), the guard chain, the malformed-event containment, and the
// fail-loud validation.
import assert from "node:assert/strict";
import {
	Boot,
	Check,
	Finish,
	Fire,
	FireAbsent,
	FireMalformed,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount. */
const Setup = async (Config: Record<string, unknown> = {}): Promise<any> => {
	rm();
	const Run = Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
	await Boot();
	return Run;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group W1: the loader contract and the cold mount.
	{
		const Loader = await import("../../../Target/Library.js");
		rm();
		const Run = Make(Validate({ logFile: Ledger }));
		Check(Count, "W1: the default object carries name/apply/Config/inject", () => {
			assert.equal(Loader.default.name, "plugin-dsh-workspace-semantics");
			assert.equal(Loader.default.apply, Loader.apply);
			assert.ok(Loader.default.Config !== undefined);
			assert.deepEqual(Loader.default.inject, ["pluginFactory", "fs"]);
		});
		Check(Count, "W1: apply returns NOTHING and the service is still provided", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.Provided["workspaceSemantics"] !== undefined);
		});
		Check(Count, "W1: a disabled mount registers NOTHING on the root context", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.deepEqual(Run.Effects, []);
		});
		Check(Count, "W1: the cold mount logs the byte-exact lines", () => {
			assert.deepEqual(Run.Lines, [
				"semantics: adapters registered (7 extensions)",
				"semantics: disabled (enabled=false)",
			]);
		});
		Check(Count, "W1: a disabled service answers honestly with nothing", async () => {
			assert.equal(await Run.Context.workspaceSemantics.resolve("/a.ts"), undefined);
			assert.equal(await Run.Context.workspaceSemantics.rename("/a.ts", { start: 0, end: 1 }, "x"), undefined);
			assert.deepEqual(Run.Context.workspaceSemantics.statistics(), {
				paths: 0,
				revision: 0,
				adapters: 7,
			});
		});
	}

	// Group W2: the activation wiring.
	{
		const Run = await Setup();
		Check(Count, "W2: fs/observed is registered on the ROOT context only", () => {
			assert.deepEqual(Run.RootNames, ["fs/observed"]);
			assert.equal(Run.CtxListeners["fs/observed"], undefined);
		});
		Check(Count, "W2: the root identity is a distinct context object", () => {
			assert.notEqual(Run.Root, Run.Context);
			assert.equal(Object.getPrototypeOf(Run.Root), Object.prototype);
		});
		Check(Count, "W2: the activation lines are byte-exact and the storage effect is armed", () => {
			assert.deepEqual(Run.Lines, [
				"semantics: adapters registered (7 extensions)",
				"semantics: activated (domain=workspace_semantics)",
			]);
			assert.deepEqual(Run.Effects, ["semantics-storage"]);
		});
	}

	// Group W3: the invalidation on fs/observed.
	{
		const Run = await Setup();
		Fire(Run, "/repo/src/a.ts", "1");
		Fire(Run, "/repo/src/b.ts", "2");
		Check(Count, "W3: the revision advances monotonically - no wall clock", () => {
			assert.equal(Run.State.Revision, 2);
			assert.deepEqual(LinesWith(Run, "indexed /repo/src/a.ts"), [
				"semantics: indexed /repo/src/a.ts version 1 (revision 1)",
			]);
		});
		FireAbsent(Run, "/repo/src/gone.ts");
		Check(Count, "W3: an absent observation invalidates too, as version absent", () => {
			assert.equal(Run.State.Revision, 3);
			assert.ok(
				Run.Lines.includes("semantics: indexed /repo/src/gone.ts version absent (revision 3)"),
			);
		});
	}

	// Group W4: the guard chain and containment.
	{
		const Run = await Setup({ exclude: ["skipme"] });
		Fire(Run, "/repo/skipme/x.ts");
		Check(Count, "W4: an excluded segment is ignored with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "excluded"), [
				"semantics: ignored /repo/skipme/x.ts (excluded)",
			]);
		});
		Fire(Run, "/repo/a.ts", "1", Run.State.Self);
		Check(Count, "W4: the service's OWN actor is ignored with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "own actor"), [
				"semantics: ignored /repo/a.ts (own actor)",
			]);
		});
		Check(Count, "W4: a malformed event never throws and is ledgered byte-exactly", () => {
			FireMalformed(Run);
			assert.deepEqual(LinesWith(Run, "failed"), [
				"semantics: failed unknown (malformed event: displayPath is not a string)",
			]);
		});
		Check(Count, "W4: the listener path touches ZERO file content (no reads, no writes)", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
		});
	}

	// Group W5: the fail-loud validation.
	{
		Check(Count, "W5: maxEntries below 1 fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, maxEntries: 0 })),
				/semantics: maxEntries must be an integer >= 1/,
			);
		});
		Check(Count, "W5: an empty domain fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
				/semantics: domain must be a non-empty string/,
			);
		});
		Check(Count, "W5: a non-array exclude fails loud at load", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, exclude: "nope" })),
				/\.exclude expected array/,
			);
		});
	}
	return Finish(Count, "Wiring-And-Index");
};

// Standalone entry: `node Target/Test/Wiring-And-Index/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Index`);
}
