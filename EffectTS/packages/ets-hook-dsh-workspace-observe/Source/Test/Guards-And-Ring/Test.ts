// Source/Test/Guards-And-Ring/Test.ts - the guard chain and the bounded
// ring: the excluded path, the own-actor identity check, the include
// allowlist, the latest-overwrite rule, the ring cap with the byte-exact
// capped line, the malformed event containment, and the volatile flip of the
// ring bound (the factory's P10 refresh).
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Fire,
	FireMalformed,
	Flip,
	Ledger,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Make,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount with overrides. */
const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the exclusion guard.
	{
		const Run = Setup();
		Fire(Run, "/repo/Target/out/x.ts", "1");
		Check(Count, "G1: an excluded path is ignored with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "ignored"), [
				"observe: ignored /repo/Target/out/x.ts (excluded)",
			]);
			const Durable = LedgerWith("ignored /repo/Target/out/x.ts (excluded)");
			assert.equal(Durable.length, 1);
			assert.ok((Durable[0] ?? "").endsWith(" ignored /repo/Target/out/x.ts (excluded)"));
		});
		Check(Count, "G1: the excluded event records nothing and moves no counter", () => {
			assert.equal(Run.State.Latest.size, 0);
			assert.equal(Run.State.Sequence, 0);
		});
		Check(Count, "G1: the segment form excludes too (plain name, no glob)", () => {
			Fire(Run, "/repo/node_modules/pkg/index.js", "1");
			assert.ok(LinesWith(Run, "(excluded)").length === 2);
		});
	}

	// Group G2: the own-actor identity check.
	{
		const Run = Setup();
		Fire(Run, "/repo/src/a.ts", "1", Run.State.Self);
		Check(Count, "G2: an own-actor event is ignored with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "ignored"), [
				"observe: ignored /repo/src/a.ts (own actor)",
			]);
			assert.equal(Run.State.Latest.size, 0);
			assert.equal(Run.State.Sequence, 0);
		});
	}

	// Group G3: the include allowlist.
	{
		const Run = Setup({ include: ["**/*.ts"] });
		Fire(Run, "/repo/src/readme.md", "1");
		Check(Count, "G3: a non-matching path under a non-empty include is ignored", () => {
			assert.deepEqual(LinesWith(Run, "ignored"), [
				"observe: ignored /repo/src/readme.md (not included)",
			]);
			assert.equal(Run.State.Latest.size, 0);
		});
		Check(Count, "G3: a matching path under the same include records normally", () => {
			Fire(Run, "/repo/src/a.ts", "1");
			assert.equal(Run.State.Latest.get("/repo/src/a.ts").version, "1");
			assert.equal(Run.State.Sequence, 1);
		});
	}

	// Group G4: the ring cap.
	{
		const Run = Setup({ maxStamps: 3 });
		for (const Name of ["a", "b", "c", "d", "e"]) {
			Fire(Run, `/repo/src/${Name}.ts`, "1");
		}
		Check(Count, "G4: the ring caps at maxStamps, oldest dropped", () => {
			assert.equal(Run.State.Ring.length, 3);
			assert.deepEqual(
				Run.State.Ring.map((Stamp: any) => Stamp.path),
				["/repo/src/c.ts", "/repo/src/d.ts", "/repo/src/e.ts"],
			);
		});
		Check(Count, "G4: each drop is ledgered byte-exactly with its own path", () => {
			assert.ok(LinesWith(Run, "capped").includes("observe: capped /repo/src/a.ts (maxStamps 3)"));
			assert.ok(LinesWith(Run, "capped").includes("observe: capped /repo/src/b.ts (maxStamps 3)"));
			assert.equal(LinesWith(Run, "capped").length, 2);
		});
		Check(Count, "G4: the latest map keeps every path and the counter keeps running", () => {
			assert.equal(Run.State.Latest.size, 5);
			assert.equal(Run.State.Sequence, 5);
		});
	}

	// Group G5: the latest-overwrite rule.
	{
		const Run = Setup();
		Fire(Run, "/repo/src/a.ts", "1");
		Fire(Run, "/repo/src/a.ts", "2");
		Check(Count, "G5: the latest stamp per path overwrites", () => {
			assert.deepEqual(Run.Context.workspaceObserve.stamp("/repo/src/a.ts"), {
				path: "/repo/src/a.ts",
				version: "2",
				origin: "fs/observed",
				sequence: 2,
			});
		});
		Check(Count, "G5: both stamps stay in the ring, newest first", () => {
			assert.deepEqual(
				Run.Context.workspaceObserve.stamps().map((Stamp: any) => Stamp.version),
				["2", "1"],
			);
		});
	}

	// Group G6: the malformed event.
	{
		const Run = Setup();
		FireMalformed(Run);
		Check(Count, "G6: a malformed event never throws and is ledgered as failed", () => {
			assert.deepEqual(LinesWith(Run, "failed"), [
				"observe: failed unknown (malformed event: displayPath is not a string)",
			]);
			assert.equal(Run.State.Latest.size, 0);
		});
		Check(Count, "G6: the listener keeps working after the failure", () => {
			Fire(Run, "/repo/src/a.ts", "1");
			assert.equal(Run.State.Sequence, 1);
		});
	}

	// Group G7: the volatile flip of the ring bound.
	{
		const Run = Setup({ maxStamps: 4 });
		Fire(Run, "/repo/src/a.ts", "1");
		Fire(Run, "/repo/src/b.ts", "1");
		Flip(runVolatile(Run, "maxStamps"), 2);
		Run.CtxListeners["loader/volatile-update"](["maxStamps"]);
		Check(Count, "G7: the volatile flip refreshes the ring bound in place", () => {
			assert.equal(Run.State.MaxStamps, 2);
		});
		Fire(Run, "/repo/src/c.ts", "1");
		Fire(Run, "/repo/src/d.ts", "1");
		Fire(Run, "/repo/src/e.ts", "1");
		Check(Count, "G7: the new bound applies on the next events with the capped line", () => {
			assert.equal(Run.State.Ring.length, 2);
			assert.ok(
				LinesWith(Run, "capped").includes("observe: capped /repo/src/a.ts (maxStamps 2)"),
			);
		});
	}
	
	{
		const Run = Setup();
		Fire(Run, "/repo/src/g.ts", "1");
		Fire(Run, "/repo/src/g.ts", "1");
		Check(Count, "G8: a repeat event with the same version is dropped silently", () => {
			assert.deepEqual(LinesWith(Run, "stamped /repo/src/g.ts"), [
				"observe: stamped /repo/src/g.ts version 1 (fs/observed)",
			]);
			assert.equal(Run.State.Sequence, 1);
			assert.equal(Run.State.Latest.get("/repo/src/g.ts").sequence, 1);
		});
		Check(Count, "G8: a different version is processed normally", () => {
			Fire(Run, "/repo/src/g.ts", "2");
			assert.equal(Run.State.Sequence, 2);
			assert.ok(Run.Lines.includes("observe: stamped /repo/src/g.ts version 2 (fs/observed)"));
		});
		Check(Count, "G8: the same version outside the window is processed again", () => {
			const Base = Date.now();
			Run.State.Now = () => Base + 5000;
			Fire(Run, "/repo/src/g.ts", "2");
			assert.equal(Run.State.Sequence, 3);
		});
	}
	return Finish(Count, "Guards-And-Ring");
};

/** The volatile cell of the raw config for one key (the flip target). */
const runVolatile = (Run: any, Key: string): unknown => Run.Raw[Key];

// Standalone entry: `node Target/Test/Guards-And-Ring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Guards-And-Ring`);
}
