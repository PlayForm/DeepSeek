// Source/Test/Residency-And-Eviction/Test.ts - the residency record and the
// disposition pass: the weight-only-ranks rule, the five dispositions, the
// two shields (the open lease and the active capability, with the revocation
// grace), the byte-exact disposition lines, and the purity.
import assert from "node:assert/strict";
import { Check, Finish, LinesWith, Make, MakeCounter, Validate, rm } from "../Harness.js";

/** An enabled service with a fresh state. */
const Setup = (Raw: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: "/nonexistent/authority.log", enabled: true, ...Raw }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group R1: the residency record.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		const Record = Service.residence("/r/a.ts", "tmp", 3);
		Check(Count, "R1: the residency carries the weight in its own field", () => {
			assert.deepEqual(Record, {
				resource: "/r/a.ts",
				kind: "tmp",
				weight: 3,
				since: Record.since,
				promoted: false,
				disposition: "none",
			});
			assert.deepEqual(LinesWith(Run, "residency /r/a.ts"), [
				"authority: residency /r/a.ts (weight 3)",
			]);
		});
		Check(Count, "R1: touching the record updates the weight, never the since", () => {
			const Touched = Service.residence("/r/a.ts", "tmp", 9);
			assert.equal(Touched.weight, 9);
			assert.equal(Touched.since, Record.since);
			assert.equal(Run.State.Residency.size, 1);
		});
		Check(Count, "R1: an invalid resource is refused with the exact line", () => {
			assert.equal(Service.residence("", "tmp", 1), undefined);
			assert.deepEqual(LinesWith(Run, "refused residency"), [
				"authority: refused residency (invalid resource)",
			]);
		});
	}

	// Group R2: the default disposition is conservative.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		Service.residence("/r/a.ts", "tmp", 1);
		const Out = Service.evict();
		Check(Count, "R2: an unconfigured policy keeps the record", () => {
			assert.deepEqual(Out, [{ resource: "/r/a.ts", disposition: "keep" }]);
			assert.equal(Run.State.Residency.has("/r/a.ts"), true);
			assert.deepEqual(LinesWith(Run, "evicted /r/a.ts"), [
				"authority: evicted /r/a.ts (keep)",
			]);
		});
	}

	// Group R3: the evict and discard dispositions.
	{
		const Run = Setup({ policy: [{ kind: "tmp", disposition: "evict" }, { kind: "log", disposition: "discard" }] });
		const Service = Run.Context.workspaceAuthority;
		Service.residence("/r/a.ts", "tmp", 1);
		Service.residence("/r/b.log", "log", 2);
		const Out = Service.evict();
		Check(Count, "R3: evict moves the record to the graveyard, discard erases it", () => {
			assert.deepEqual(Out, [
				{ resource: "/r/b.log", disposition: "discard" },
				{ resource: "/r/a.ts", disposition: "evict" },
			]);
			assert.equal(Run.State.Residency.has("/r/a.ts"), false);
			assert.equal(Run.State.Graveyard.has("/r/a.ts"), true);
			assert.equal(Run.State.Graveyard.has("/r/b.log"), false);
		});
		Check(Count, "R3: the weight only ranks - the heavier record is decided first", () => {
			assert.deepEqual(LinesWith(Run, "evicted"), [
				"authority: evicted /r/b.log (discard)",
				"authority: evicted /r/a.ts (evict)",
			]);
		});
		Check(Count, "R3: the named subset evicts only the named resources", () => {
			const Service = Run.Context.workspaceAuthority;
			Service.residence("/r/c.ts", "tmp", 5);
			Service.residence("/r/d.ts", "tmp", 1);
			const Out = Service.evict(["/r/c.ts"]);
			assert.deepEqual(Out.map((Entry: any) => Entry.resource), ["/r/c.ts"]);
			assert.equal(Run.State.Residency.has("/r/d.ts"), true);
		});
	}

	// Group R4: the promote and defer dispositions.
	{
		const Run = Setup({ policy: [{ kind: "hot", disposition: "promote" }, { kind: "doc", disposition: "defer", maxResidencyMs: 1 << 30 }, { kind: "stale", disposition: "defer", maxResidencyMs: 0 }] });
		const Service = Run.Context.workspaceAuthority;
		Service.residence("/r/hot.ts", "hot", 1);
		Service.residence("/r/doc.md", "doc", 1);
		Service.residence("/r/old.doc", "stale", 1);
		// Age the stale-kind record past its 0 ms residency limit.
		(Run.State.Residency.get("/r/old.doc") as { since: number }).since = Date.now() - 5000;
		const Out = Service.evict();
		Check(Count, "R4: promote marks the record protected", () => {
			assert.deepEqual(Out.find((Entry: any) => Entry.resource === "/r/hot.ts"), {
				resource: "/r/hot.ts",
				disposition: "promote",
			});
			assert.equal((Run.State.Residency.get("/r/hot.ts") as any).promoted, true);
		});
		Check(Count, "R4: defer postpones within the residency limit", () => {
			assert.deepEqual(Out.find((Entry: any) => Entry.resource === "/r/doc.md"), {
				resource: "/r/doc.md",
				disposition: "defer",
			});
			assert.equal(Run.State.Residency.has("/r/doc.md"), true);
		});
		Check(Count, "R4: defer past the residency limit evicts", () => {
			assert.deepEqual(Out.find((Entry: any) => Entry.resource === "/r/old.doc"), {
				resource: "/r/old.doc",
				disposition: "evict",
			});
			assert.equal(Run.State.Residency.has("/r/old.doc"), false);
		});
	}

	// Group R5: the shields.
	{
		const Run = Setup({ policy: [{ kind: "tmp", disposition: "evict" }] });
		const Service = Run.Context.workspaceAuthority;
		Service.residence("/r/leased.ts", "tmp", 1);
		Service.acquire("alice", "/r/leased.ts", "tmp", 60000);
		Service.residence("/r/granted.ts", "tmp", 1);
		Service.grant({ holder: "bob", resource: "/r/granted.ts", operations: ["read"] });
		const Out = Service.evict();
		Check(Count, "R5: an open lease shields the resource", () => {
			assert.deepEqual(Out.find((Entry: any) => Entry.resource === "/r/leased.ts"), {
				resource: "/r/leased.ts",
				disposition: "keep",
			});
		});
		Check(Count, "R5: an active capability shields the resource", () => {
			assert.deepEqual(Out.find((Entry: any) => Entry.resource === "/r/granted.ts"), {
				resource: "/r/granted.ts",
				disposition: "keep",
			});
		});
	}

	// Group R6: the revocation grace.
	{
		const Run = Setup({ policy: [{ kind: "tmp", disposition: "evict" }], revocationGraceMs: 60000 });
		const Service = Run.Context.workspaceAuthority;
		Service.residence("/r/shielded.ts", "tmp", 1);
		const Record = Service.grant({ holder: "carol", resource: "/r/shielded.ts", operations: ["read"] });
		Service.revoke(Record.id);
		const Shielded = Service.evict();
		Check(Count, "R6: a revoked capability shields within the grace", () => {
			assert.deepEqual(Shielded[0], { resource: "/r/shielded.ts", disposition: "keep" });
		});
		// Age the revocation past the grace so the boundary is unambiguous.
		(Run.State.Capabilities.get(Record.id) as { revokedAt: number }).revokedAt =
			Date.now() - 120000;
		const After = Service.evict();
		Check(Count, "R6: outside the grace the policy decides", () => {
			assert.deepEqual(After[0], { resource: "/r/shielded.ts", disposition: "evict" });
			assert.equal(Run.State.Residency.has("/r/shielded.ts"), false);
		});
	}

	return Finish(Count, "Residency-And-Eviction");
};

// Standalone entry: `node Target/Test/Residency-And-Eviction/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Residency-And-Eviction`);
}
