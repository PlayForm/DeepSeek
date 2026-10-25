// Source/Test/Watch-And-Storage/Test.ts - the invalidation seam and the
// storage domain: the fs/observed listener through the real root Wire (the
// guard chain with its byte-exact lines), the domain spec, the persistence,
// the restart recovery with the continued sequence, the loud open failure,
// the absent facility, and the zero-fs purity.
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Fire,
	FakeStorage,
	LinesWith,
	Make,
	MakeCounter,
	OpenStorage,
	Validate,
	rm,
} from "../Harness.js";

/** An enabled mount with an empty ledger. */
const Setup = (Raw: Record<string, unknown> = {}, Facility?: any): any => {
	rm();
	return Make(Validate({ logFile: "/nonexistent/evidence.log", enabled: true, ...Raw }), (Context: any) => {
		if (Facility !== undefined) {
			Context.storageDomain = (Facility as { facility?: unknown }).facility ?? Facility;
		}
	});
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group W1: the domain spec and the open.
	{
		const Run = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Check(Count, "W1: the domain spec is name/version/layout/invalidRecords/two tables", () => {
			const Spec = Store.spec;
			assert.equal(Spec.name, "workspace_evidence");
			assert.equal(Spec.version, 1);
			assert.equal(Spec.layout, "per-record");
			assert.equal(Spec.invalidRecords, "backup-and-skip");
			assert.ok(Spec.tables.validations !== undefined);
			assert.ok(Spec.tables.meta !== undefined);
		});
		Check(Count, "W1: the open binds the handle", () => {
			assert.ok(Run.State.Handle !== undefined);
		});
	}

	// Group W2: the persistence.
	{
		const Run = Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Run.Context.workspaceEvidence.validate("a", "reality", "s", ["k"]);
		const Validations = Store.tables.get("validations") as Map<string, unknown>;
		const Meta = Store.tables.get("meta") as Map<string, unknown>;
		Check(Count, "W2: the validation record lands keyed by id", () => {
			assert.equal((Validations.get("a") as any).id, "a");
			assert.equal((Validations.get("a") as any).sequence, 1);
		});
		Check(Count, "W2: the sequence lands in the meta table", () => {
			assert.equal(Meta.get("__sequence"), 1);
		});
	}

	// Group W3: the restart recovery.
	{
		const Store = FakeStorage();
		const Superseded = { id: "old", kind: "reality", subject: "s", verdict: "unverified", dependencies: [], sequence: 4, status: "superseded" };
		Store.seed("validations", "live", { id: "live", kind: "intent", subject: "s", verdict: "verified", dependencies: ["k"], sequence: 3, status: "fresh" });
		Store.seed("validations", "old", Superseded);
		Store.seed("meta", "__sequence", 5);
		const Second = Setup({}, Store.facility);
		await OpenStorage(Second, Store.facility);
		Check(Count, "W3: the recovery reloads live records and drops superseded", () => {
			assert.deepEqual(Second.Context.workspaceEvidence.list().map((Object: any) => Object.id), ["live"]);
		});
		Check(Count, "W3: the sequence continues at the recovered maximum", () => {
			const Record = Second.Context.workspaceEvidence.validate("next", "reality", "s", []);
			assert.equal(Record.sequence, 6);
		});
	}

	// Group W4: the loud open failure.
	{
		const Run = Setup();
		const Store = FakeStorage({ failOpen: true });
		await OpenStorage(Run, Store.facility);
		Check(Count, "W4: a failed open logs the byte-exact line and degrades", () => {
			assert.deepEqual(LinesWith(Run, "storage open failed"), [
				"evidence: storage open failed: storage unavailable",
			]);
			assert.equal(Run.State.Handle, undefined);
			assert.equal(Run.Context.workspaceEvidence.statistics().validations, 0);
		});
	}

	// Group W5: the absent facility.
	{
		const Run = Setup();
		Check(Count, "W5: with no facility the effect is a silent skip", () => {
			assert.deepEqual(Run.Effects, ["evidence-storage"]);
			assert.equal(Run.State.Handle, undefined);
			assert.deepEqual(LinesWith(Run, "storage open failed"), []);
			Run.Context.workspaceEvidence.validate("a", "reality", "s", []);
			assert.equal(Run.Context.workspaceEvidence.statistics().validations, 1);
		});
	}

	// Group W6: the guard chain of the fs/observed listener.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceEvidence;
		Service.validate("a", "reality", "s", ["/p/watched.ts"]);
		Fire(Run, "/p/watched.ts", "present", Run.State.Self);
		Check(Count, "W6: the service's own actor is ignored", () => {
			assert.equal(Service.check("a"), "fresh");
			assert.deepEqual(LinesWith(Run, "own actor"), [
				"evidence: ignored /p/watched.ts (own actor)",
			]);
		});
		Fire(Run, "/repo/node_modules/x.ts");
		Check(Count, "W6: an excluded path is ignored", () => {
			assert.deepEqual(LinesWith(Run, "excluded"), [
				"evidence: ignored /repo/node_modules/x.ts (excluded)",
			]);
		});
		Fire(Run, "/p/gone.ts", "removed");
		Check(Count, "W6: an absent observation does not invalidate", () => {
			assert.deepEqual(LinesWith(Run, "absent observation"), [
				"evidence: ignored /p/gone.ts (absent observation)",
			]);
		});
		Fire(Run, "/p/watched.ts");
		Check(Count, "W6: a present observation invalidates the dependents", () => {
			assert.equal(Service.check("a"), "stale");
			assert.deepEqual(LinesWith(Run, "stale a"), [
				"evidence: stale a (dependency /p/watched.ts)",
			]);
		});
		Fire(Run, null as unknown as string, null as unknown as string, undefined);
		Check(Count, "W6: a malformed event never throws and is ledgered", () => {
			assert.deepEqual(LinesWith(Run, "failed "), [
				"evidence: failed unknown (malformed event: displayPath is not a string)",
			]);
		});
	}

	// Group W7: the purity.
	{
		const Run = Setup();
		Run.Context.workspaceEvidence.validate("a", "reality", "s", ["k"]);
		Fire(Run, "/p/x.ts");
		Check(Count, "W7: the fake fs records ZERO writeText and readText calls", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
		});
	}

	
	{
		const Run = Setup();
		const Service = Run.Context.workspaceEvidence;
		Service.validate("a", "reality", "s", ["/p/x.ts"]);
		Fire(Run, "/p/x.ts");
		Fire(Run, "/p/x.ts");
		Check(Count, "W8: a repeat event with the same version is dropped silently", () => {
			assert.equal(Service.check("a"), "stale");
			assert.deepEqual(LinesWith(Run, "stale a"), [
				"evidence: stale a (dependency /p/x.ts)",
			]);
			assert.deepEqual(LinesWith(Run, "no stale (dependency /p/x.ts)"), []);
		});
		Check(Count, "W8: a different version is processed normally", () => {
			Run.Listeners["fs/observed"](
				{ displayPath: "/p/x.ts", targetKey: "/p/x.ts" },
				{ kind: "present", version: "2" },
				{ agent: { id: "agent-a" } },
			);
			assert.deepEqual(LinesWith(Run, "no stale (dependency /p/x.ts)"), [
				"evidence: no stale (dependency /p/x.ts)",
			]);
		});
		Check(Count, "W8: the same version outside the window is processed again", () => {
			const Base = Date.now();
			Run.State.Now = () => Base + 5000;
			Run.Listeners["fs/observed"](
				{ displayPath: "/p/x.ts", targetKey: "/p/x.ts" },
				{ kind: "present", version: "2" },
				{ agent: { id: "agent-a" } },
			);
			assert.equal(LinesWith(Run, "no stale (dependency /p/x.ts)").length, 2);
		});
	}

	return Finish(Count, "Watch-And-Storage");
};

// Standalone entry: `node Target/Test/Watch-And-Storage/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Watch-And-Storage`);
}
