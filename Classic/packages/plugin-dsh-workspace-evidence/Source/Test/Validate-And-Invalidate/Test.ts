// Source/Test/Validate-And-Invalidate/Test.ts - the validation objects and
// the Acar seam: the exact record shape, the fail-loud validation errors,
// the supersede path, the counter monotonicity, the invalidate pass with its
// byte-exact ledger lines, the store cap eviction, and the read surface.
import assert from "node:assert/strict";
import { Check, Finish, LinesWith, Make, MakeCounter, Validate, rm } from "../Harness.js";

/** An enabled service with an empty ledger. */
const Setup = (Raw: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: "/nonexistent/evidence.log", enabled: true, ...Raw }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group V1: the record shape and the fail-loud validation.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceEvidence;
		const Record = Service.validate("a", "reality", "the file on disk", ["x.ts"]);
		Check(Count, "V1: the record carries the exact shape with a fresh status", () => {
			assert.deepEqual(Record, {
				id: "a",
				kind: "reality",
				subject: "the file on disk",
				verdict: "unverified",
				dependencies: ["x.ts"],
				sequence: 1,
				status: "fresh",
			});
		});
		Check(Count, "V1: the exact validation ledger line", () => {
			assert.deepEqual(LinesWith(Run, "validated a"), [
				"evidence: validated a (reality, the file on disk, 1 dependencies, unverified, sequence 1)",
			]);
		});
		Check(Count, "V1: the fail-loud validation errors are byte-exact", () => {
			assert.throws(() => Service.validate("", "reality", "s", []), /evidence: id must be a non-empty string/);
			assert.throws(
				() => Service.validate("a", "gossip" as never, "s", []),
				/evidence: kind must be one of reality, observation, representation, intent/,
			);
			assert.throws(() => Service.validate("a", "reality", "", []), /evidence: subject must be a non-empty string/);
			assert.throws(
				() => Service.validate("a", "reality", "s", "x" as never),
				/evidence: dependencies must be an array/,
			);
		});
		Check(Count, "V1: a verified verdict is recorded as given, never invented", () => {
			const Record = Service.validate("v", "observation", "the stamp", [], "verified");
			assert.equal(Record.verdict, "verified");
		});
	}

	// Group V2: the supersede path and the monotonic counter.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceEvidence;
		Service.validate("a", "reality", "s", []);
		const Second = Service.validate("a", "reality", "s", []);
		Check(Count, "V2: a revalidation supersedes the old record", () => {
			assert.equal(Second.sequence, 2);
			assert.equal(Service.check("a"), "fresh");
			// The store keeps only the latest record per id; the supersede
			// is the ledger line, not a second object.
			assert.equal(Service.list().length, 1);
			assert.deepEqual(LinesWith(Run, "superseded a"), [
				"evidence: superseded a (sequence 1)",
			]);
		});
		Check(Count, "V2: the superseded record is not guessed back into the store", () => {
			assert.equal(Service.invalidate("nonexistent-key"), 0);
			assert.equal(Service.list("superseded").length, 0);
		});
	}

	// Group V3: the explicit invalidate (the Acar seam).
	{
		const Run = Setup();
		const Service = Run.Context.workspaceEvidence;
		Service.validate("a", "reality", "s", ["k"]);
		Service.validate("b", "observation", "s", ["other"]);
		const Count1 = Service.invalidate("k");
		Check(Count, "V3: the dependent record goes stale with the exact line", () => {
			assert.equal(Count1, 1);
			assert.equal(Service.check("a"), "stale");
			assert.equal(Service.check("b"), "fresh");
			assert.deepEqual(LinesWith(Run, "stale a"), [
				"evidence: stale a (dependency k)",
			]);
		});
		Check(Count, "V3: a key with no dependents logs the no-stale line", () => {
			const Count2 = Service.invalidate("nothing");
			assert.equal(Count2, 0);
			assert.deepEqual(LinesWith(Run, "no stale"), [
				"evidence: no stale (dependency nothing)",
			]);
		});
		Check(Count, "V3: a stale record is never guessed back to fresh", () => {
			const Count3 = Service.invalidate("k");
			assert.equal(Count3, 0);
			assert.equal(Service.check("a"), "stale");
		});
	}

	// Group V4: the store cap.
	{
		const Run = Setup({ maxValidations: 2 });
		const Service = Run.Context.workspaceEvidence;
		Service.validate("a", "reality", "s", []);
		Service.validate("b", "reality", "s", []);
		Service.validate("c", "reality", "s", []);
		Check(Count, "V4: the oldest record drops when the store exceeds the cap", () => {
			assert.deepEqual(Service.list().map((Object: any) => Object.id), ["b", "c"]);
			assert.equal(Service.statistics().sequence, 3);
		});
		Service.validate("a2", "reality", "s", []);
		Service.validate("a2", "reality", "s", []);
		Check(Count, "V4: the superseded drop before the fresh", () => {
			assert.deepEqual(Service.list().map((Object: any) => Object.id), ["c", "a2"]);
		});
	}

	// Group V5: the read surface.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceEvidence;
		Service.validate("a", "reality", "s", ["k"]);
		Service.validate("b", "intent", "s", []);
		Service.validate("b", "intent", "s", []);
		Check(Count, "V5: the statistics pentuple is exact", () => {
			assert.deepEqual(Service.statistics(), {
				validations: 2,
				fresh: 2,
				stale: 0,
				superseded: 0,
				sequence: 3,
			});
		});
		Check(Count, "V5: check() returns undefined for an unknown id", () => {
			assert.equal(Service.check("nope"), undefined);
		});
	}

	return Finish(Count, "Validate-And-Invalidate");
};

// Standalone entry: `node Target/Test/Validate-And-Invalidate/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Validate-And-Invalidate`);
}
