// Source/Test/Service-And-Storage/Test.ts - the service surface and the
// storage domain: the manual line recording, the IntentAssessment loop
// closer, the chain and ring views, the ring cap with its byte-exact drop
// line, the domain spec, the persistence, the restart recovery with the
// continued sequence, the absent facility (silent skip), the loud open
// failure, and the effect's disposer closing the handle.
import assert from "node:assert/strict";
import {
	Boot,
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LinesWith,
	MakeCounter,
	Make,
	OpenStorage,
	rm,
	Validate,
	FakeStorage,
} from "../Harness.js";

/** A standard enabled mount with the fake storage attached. */
const Setup = async (Config: Record<string, unknown> = {}, Facility: unknown = undefined): Promise<any> => {
	rm();
	const Run = Make(
		Validate({ logFile: Ledger, enabled: true, ...Config }),
		(Context: any) => {
			if (Facility !== undefined) {
				Context.storageDomain = (Facility as { facility?: unknown }).facility ?? Facility;
			}
		},
	);
	await Boot();
	return Run;
};

/** Let the effect's void storage open settle. */
const Settle = async (): Promise<void> => {
	await new Promise((Resolve) => setImmediate(Resolve));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group S1: the service surface.
	{
		const Run = await Setup();
		const Service = Run.Context.workspaceAudit;
		Check(Count, "S1: the service is the apply-registered instance with the full surface", () => {
			assert.equal(Service, Run.Provided["workspaceAudit"]);
			assert.equal(typeof Service.line, "function");
			assert.equal(typeof Service.assessment, "function");
			assert.equal(typeof Service.chain, "function");
			assert.equal(typeof Service.lines, "function");
			assert.equal(typeof Service.statistics, "function");
		});
		Check(Count, "S1: line() records with the exact shape and the byte-exact ledger line", () => {
			const Line = Service.line({
				operation: "op1",
				category: "commitment",
				path: "/repo/a.ts",
			});
			assert.equal(Line.id, "a1");
			assert.equal(Line.sequence, 1);
			assert.equal(Line.parent, "");
			assert.equal(Line.outcome, "pending");
			assert.equal(Line.assessment, "");
			assert.ok(
				Run.Lines.includes("audit: audit commitment op1 (pending) /repo/a.ts"),
			);
		});
	}
	{
		const Run = await Setup();
		const Service = Run.Context.workspaceAudit;
		await CheckAsync(Count, "S1: assessment() closes the loop with the exact line", async () => {
			const Line = Service.assessment("op1", true);
			assert.equal(Line.category, "intent-assessment");
			assert.equal(Line.outcome, "success");
			assert.equal(Line.assessment, "satisfied");
			assert.ok(
				Run.Lines.includes("audit: audit intent-assessment op1 (satisfied) "),
			);
			assert.deepEqual(LinesWith(Run, "intent-assessment op1"), [
				"audit: audit intent-assessment op1 (satisfied) ",
			]);
		});
		await CheckAsync(Count, "S1: an unsatisfied assessment carries the detail", async () => {
			const Line = Service.assessment("op2", false, "spec unmet");
			assert.equal(Line.outcome, "failure");
			assert.equal(Line.assessment, "unsatisfied: spec unmet");
			assert.ok(
				Run.Lines.includes("audit: audit intent-assessment op2 (unsatisfied: spec unmet) "),
			);
		});
		await CheckAsync(Count, "S1: chain() and lines() read the ring and the chain view", async () => {
			Service.line({ operation: "op1", category: "authorization", path: "/x" });
			assert.deepEqual(
				Service.chain("op1").map((Line: any) => Line.category),
				["intent-assessment", "authorization"],
			);
			assert.deepEqual(
				Service.lines().map((Line: any) => Line.id),
				["a3", "a2", "a1"],
			);
			assert.deepEqual(Service.lines(1).map((Line: any) => Line.id), ["a3"]);
			assert.deepEqual(Service.statistics(), { operations: 2, lines: 3, sequence: 3 });
		});
	}

	// Group S2: the ring cap.
	{
		const Run = await Setup({ maxLines: 2 });
		const Service = Run.Context.workspaceAudit;
		Service.line({ operation: "op1", category: "commitment", path: "/a" });
		Service.line({ operation: "op1", category: "commitment", path: "/b" });
		Service.line({ operation: "op1", category: "commitment", path: "/c" });
		Check(Count, "S2: the ring caps at maxLines and the drop is ledgered byte-exactly", () => {
			assert.equal(Run.State.Ring.length, 2);
			assert.deepEqual(
				Service.lines().map((Line: any) => Line.path),
				["/c", "/b"],
			);
			assert.deepEqual(LinesWith(Run, "capped a1"), ["audit: capped a1 (maxLines 2)"]);
			assert.deepEqual(Service.statistics(), { operations: 1, lines: 2, sequence: 3 });
		});
	}

	// Group S3: the domain spec and the persistence.
	{
		const Run = await Setup();
		const Store = FakeStorage();
		await OpenStorage(Run, Store.facility);
		Check(Count, "S3: the domain spec is name/version/layout/invalidRecords/two tables", () => {
			const Spec = Store.spec;
			assert.equal(Spec.name, "workspace_audit");
			assert.equal(Spec.version, 1);
			assert.equal(Spec.layout, "per-record");
			assert.equal(Spec.invalidRecords, "backup-and-skip");
			assert.ok(Spec.tables.lines !== undefined);
			assert.ok(Spec.tables.ring !== undefined);
		});
		Run.Context.workspaceAudit.line({ operation: "op1", category: "commitment", path: "/a" });
		await Settle();
		const Lines = Store.tables.get("lines") as Map<string, unknown>;
		const Ring = Store.tables.get("ring") as Map<string, unknown>;
		Check(Count, "S3: the line lands keyed by id and the ring snapshot under the meta key", () => {
			assert.equal((Lines.get("a1") as any).operation, "op1");
			assert.equal((Ring.get("__ring") as any[]).length, 1);
		});
	}

	// Group S4: the restart recovery (through the Apply effect's own open,
	// exactly as a live restart would load — a second explicit open would
	// append the loaded lines twice into the chain arrays).
	{
		const Store = FakeStorage();
		const First = await Setup({}, Store.facility);
		await Settle();
		await Settle();
		const FirstService = First.Context.workspaceAudit;
		FirstService.line({ operation: "op1", category: "commitment", path: "/a" });
		FirstService.line({ operation: "op1", category: "commitment", path: "/b" });
		FirstService.line({ operation: "op2", category: "commitment", path: "/c" });
		await Settle();
		await Settle();
		const Second = await Setup({}, Store.facility);
		await Settle();
		await Settle();
		const Service = Second.Context.workspaceAudit;
		Check(Count, "S4: the recovery rebuilds the chains and the ring", () => {
			assert.deepEqual(Service.statistics(), { operations: 2, lines: 3, sequence: 3 });
			assert.deepEqual(
				Service.chain("op1").map((Line: any) => Line.path),
				["/a", "/b"],
			);
		});
		Check(Count, "S4: the sequence continues at the recovered maximum, never a wall clock", () => {
			const Line = Service.line({ operation: "op3", category: "commitment", path: "/d" });
			assert.equal(Line.id, "a4");
			assert.equal(Line.sequence, 4);
			assert.equal(Second.State.Sequence, 4);
		});
	}

	// Group S5: the absent facility and the loud open failure.
	{
		const Run = await Setup();
		Check(Count, "S5: with no facility the effect is a silent skip and lines live in memory", () => {
			assert.deepEqual(Run.Effects, ["audit-storage"]);
			assert.equal(Run.State.Handle, undefined);
			Run.Context.workspaceAudit.line({ operation: "op1", category: "commitment", path: "/a" });
			assert.equal(Run.Context.workspaceAudit.statistics().lines, 1);
			assert.deepEqual(LinesWith(Run, "storage open failed"), []);
		});
		const Fail = await Setup();
		const Store = FakeStorage({ failOpen: true });
		await OpenStorage(Fail, Store.facility);
		Check(Count, "S5: a failed open logs the byte-exact line and degrades", () => {
			assert.deepEqual(LinesWith(Fail, "storage open failed"), [
				"audit: storage open failed: storage unavailable",
			]);
			assert.equal(Fail.State.Handle, undefined);
			assert.equal(Fail.State.Ring.length, 0);
		});
	}

	// Group S6: the effect's disposer closes the handle.
	{
		let Closed = 0;
		const Store = FakeStorage();
		const RawOpen = Store.facility.open;
		Store.facility.open = async (Spec: unknown) => {
			const Handle = await RawOpen(Spec);
			return {
				...Handle,
				close: async () => {
					Closed += 1;
				},
			};
		};
		const Run = await Setup({}, Store.facility);
		await OpenStorage(Run, Store.facility);
		await CheckAsync(Count, "S6: the disposer closes the open handle and clears it", async () => {
			assert.ok(Run.State.Handle !== undefined);
			assert.equal(Run.Disposers.length, 1);
			await Run.Disposers[0]();
			await Settle();
			assert.equal(Closed, 1);
			assert.equal(Run.State.Handle, undefined);
		});
	}
	return Finish(Count, "Service-And-Storage");
};

// Standalone entry: `node Target/Test/Service-And-Storage/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Service-And-Storage`);
}
