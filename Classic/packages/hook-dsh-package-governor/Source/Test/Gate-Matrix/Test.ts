// Source/Test/Gate-Matrix/Test.ts - one singular test: the g1 gate matrix
// through the wired fs/observed listener - the silent gates (missing target,
// non-mutation actor, absent observation, non-package.json basename, Stash
// idempotence), the exclusion-first `skipped (excluded)` line with its P5
// record and zero writes, and the listener throw containment (the silence
// invariant).
// Runs standalone (`node Target/Test/Gate-Matrix/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/hook-dsh-package-governor.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as Path from "node:path";
import {
	Boot,
	Check,
	Events,
	Files,
	Finish,
	Furnace,
	LoggerLines,
	MakeCounter,
	Probe,
	Root,
	StorageRecords,
	Writes,
	find,
	ledgerLines,
	mkTarget,
	actor,
	settle,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Boot();
	Probe.Mode = "bin";
	await settle();
	const Listener = Events.find((e) => e[0] === "fs/observed")[1];
	// Group: the g1 gate matrix (Factory.Gate through the wired listener).
	const projGates = Path.join(Root, "gates");
	FileSystem.mkdirSync(projGates);
	const tGates = mkTarget(projGates, "k-gates");
	const before = ledgerLines().length;
	{
		const Sub = "Gate: missing target \u2192 silent (Factory.Gate reason=target)";
		{
			Check(Count, Sub, () => {
				// target gate: silent
				Listener(null, { kind: "present", version: "v1" }, actor);
				assert.equal(ledgerLines().length, before, "null target \u2192 silent");
			});
		}
	}
	{
		const Sub = "Gate: non-mutation actor tool \u2192 silent (reads emit too)";
		{
			Check(Count, Sub, () => {
				// actor gate: silent (reads emit too)
				Listener(tGates, { kind: "present", version: "v1" }, { name: "grep" });
				assert.equal(ledgerLines().length, before, "non-mutation actor \u2192 silent");
			});
		}
	}
	{
		const Sub = "Gate: absent observation \u2192 silent";
		{
			Check(Count, Sub, () => {
				Listener(tGates, { kind: "absent" }, actor);
				assert.equal(ledgerLines().length, before, "absent observation \u2192 silent");
			});
		}
	}
	{
		const Sub = "Gate: non-package.json basename \u2192 silent (the module gate)";
		{
			Check(Count, Sub, () => {
				Listener(
					{ targetKey: "k-cargo", displayPath: Path.join(projGates, "Cargo.toml") },
					{ kind: "present", version: "v1" },
					actor,
				);
				assert.equal(ledgerLines().length, before, "non-package.json basename \u2192 silent");
			});
		}
	}
	{
		const Sub = "Gate: Stash idempotence \u2192 silent (our own re-emits skip)";
		{
			Check(Count, Sub, () => {
				Probe.Stash.set(tGates.targetKey, "v1");
				Listener(tGates, { kind: "present", version: "v1" }, actor);
				assert.equal(ledgerLines().length, before, "Stash idempotence \u2192 silent");
				Probe.Stash.delete(tGates.targetKey);
			});
		}
	}
	{
		const Sub = "Gate: exclusion-first \u2192 `skipped (excluded) <path>` byte-identical";
		{
			Check(Count, Sub, () => {
				// exclusion-first: the module's line
				const projExcluded = Path.join(Root, ".git", "inner");
				FileSystem.mkdirSync(projExcluded, { recursive: true });
				Files[Path.join(projExcluded, "package.json")] = "{}";
				Listener(mkTarget(projExcluded, "k-exc"), { kind: "present", version: "v1" }, actor);
				assert.equal(
					find(`skipped (excluded) ${Path.join(projExcluded, "package.json")}`).length,
					1,
					"excluded line byte-identical",
				);
			});
		}
	}
	{
		const Sub = "Gate: the P5 `excluded` record for the excluded path";
		{
			Check(Count, Sub, () => {
				const projExcluded = Path.join(Root, ".git", "inner");
				assert.ok(
					StorageRecords.some(
						([, r]) => r.event === "excluded" && r.path === Path.join(projExcluded, "package.json"),
					),
					"P5 excluded record",
				);
			});
		}
	}
	{
		const Sub = "Gate: excluded -> no write, nothing else logged";
		{
			Check(Count, Sub, () => {
				assert.equal(Writes.length, 0, "excluded -> no write");
			});
		}
	}
	{
		const Sub =
			"silence: a throwing listener is contained (`listener error (suppressed)`), never rethrown";
		{
			Check(Count, Sub, () => {
				// listener throw containment (silence invariant)
				Probe.Factory = undefined;
				assert.doesNotThrow(() => Listener(tGates, { kind: "present", version: "vX" }, actor));
				Probe.Factory = Furnace;
				assert.ok(
					LoggerLines.error.some((m) =>
						m.startsWith("hook-dsh-governor-package: listener error (suppressed): "),
					),
					"listener error suppressed, logger-only",
				);
			});
		}
	}
	return Finish(Count, "Gate-Matrix");
};

// Standalone entry: `node Target/Test/Gate-Matrix/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Gate-Matrix`);
}
