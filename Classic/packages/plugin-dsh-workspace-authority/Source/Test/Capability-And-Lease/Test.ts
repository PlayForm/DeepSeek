// Source/Test/Capability-And-Lease/Test.ts - the capability and the lease
// records: the grant/revoke/authorize paths with their byte-exact lines, the
// per-holder ceilings, the lease TTL (explicit, policy override, default),
// the lazy expiry sweep, the release path, and the statistics.
import assert from "node:assert/strict";
import { Check, Finish, LinesWith, Make, MakeCounter, Validate, rm } from "../Harness.js";

/** An enabled service with a fresh state. */
const Setup = (Raw: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: "/nonexistent/authority.log", enabled: true, ...Raw }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group C1: the grant path.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		const Record = Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["read", "write"] });
		Check(Count, "C1: the grant stamps the record without a weight or priority", () => {
			assert.deepEqual(Record, {
				id: "cap:1",
				holder: "alice",
				resource: "/r/a.ts",
				operations: ["read", "write"],
				createdAt: Record.createdAt,
				expiresAt: undefined,
				delegation: "none",
				revoked: false,
			});
			assert.equal(typeof Record.createdAt, "number");
			assert.equal("weight" in (Record as object), false);
			assert.deepEqual(LinesWith(Run, "granted cap:1"), [
				"authority: granted cap:1 (alice -> /r/a.ts, read,write)",
			]);
		});
		Check(Count, "C1: the delegation rule is the record's own", () => {
			const Delegated = Service.grant({
				holder: "bob",
				resource: "/r/b.ts",
				operations: ["read"],
				delegation: "delegate",
			});
			assert.equal(Delegated.delegation, "delegate");
			assert.equal(Delegated.id, "cap:2");
		});
		Check(Count, "C1: an invalid specification is refused with the exact line", () => {
			assert.equal(Service.grant({ holder: "", resource: "/r", operations: ["read"] }), undefined);
			assert.deepEqual(LinesWith(Run, "refused grant"), [
				"authority: refused grant (invalid specification)",
			]);
		});
	}

	// Group C2: the per-holder ceiling.
	{
		const Run = Setup({ maxCapabilitiesPerHolder: 1 });
		const Service = Run.Context.workspaceAuthority;
		Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["read"] });
		const Second = Service.grant({ holder: "alice", resource: "/r/b.ts", operations: ["read"] });
		Check(Count, "C2: the second capability for the same holder is refused", () => {
			assert.equal(Second, undefined);
			assert.deepEqual(LinesWith(Run, "refused grant"), [
				"authority: refused grant (alice holds 1)",
			]);
		});
	}

	// Group C3: the revoke path.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		const Record = Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["read"] });
		Check(Count, "C3: the revoke marks the record permanently", () => {
			assert.equal(Service.revoke(Record.id), true);
			assert.equal(Record.revoked, true);
			assert.deepEqual(LinesWith(Run, "revoked cap:1"), ["authority: revoked cap:1"]);
		});
		Check(Count, "C3: revoking again is reported honestly", () => {
			assert.equal(Service.revoke(Record.id), false);
			assert.deepEqual(LinesWith(Run, "revoke ignored"), [
				"authority: revoke ignored cap:1 (already revoked)",
			]);
		});
		Check(Count, "C3: revoking an unknown capability is reported honestly", () => {
			assert.equal(Service.revoke("cap:99"), false);
			assert.deepEqual(LinesWith(Run, "revoke failed"), [
				"authority: revoke failed cap:99 (unknown capability)",
			]);
		});
	}

	// Group C4: the authorize path.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["read", "write"] });
		Check(Count, "C4: a held operation is authorized with the exact line", () => {
			assert.equal(Service.authorize("alice", "/r/a.ts", "read"), true);
			assert.deepEqual(LinesWith(Run, "authorized"), [
				"authority: authorized alice /r/a.ts (read)",
			]);
		});
		Check(Count, "C4: a revoked capability denies immediately", () => {
			const Record = Service.grant({ holder: "bob", resource: "/r/b.ts", operations: ["read"] });
			Service.revoke(Record.id);
			assert.equal(Service.authorize("bob", "/r/b.ts", "read"), false);
			assert.deepEqual(LinesWith(Run, "denied"), [
				"authority: denied bob /r/b.ts (read)",
			]);
		});
		Check(Count, "C4: an unheld operation or resource denies", () => {
			assert.equal(Service.authorize("alice", "/r/a.ts", "delete"), false);
			assert.equal(Service.authorize("carol", "/r/a.ts", "read"), false);
		});
	}

	// Group C5: the authorize expiry.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		const Record = Service.grant({
			holder: "alice",
			resource: "/r/a.ts",
			operations: ["read"],
			expiresAt: Date.now() - 1000,
		});
		Check(Count, "C5: an expired capability denies", () => {
			assert.equal(Service.authorize("alice", "/r/a.ts", "read"), false);
			assert.equal(Record.expiresAt !== undefined, true);
		});
	}

	// Group C6: the authorize-anything wildcard.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["*"] });
		Check(Count, "C6: the wildcard operation authorizes everything", () => {
			assert.equal(Service.authorize("alice", "/r/a.ts", "delete"), true);
		});
	}

	// Group L1: the lease path and the TTL ladder.
	{
		const Run = Setup({ policy: [{ kind: "doc", ttlMs: 50000 }] });
		const Service = Run.Context.workspaceAuthority;
		const Explicit = Service.acquire("alice", "/r/a.ts", "tmp", 12345);
		const Policy = Service.acquire("alice", "/r/b.md", "doc");
		const Default = Service.acquire("alice", "/r/c.ts", "tmp");
		Check(Count, "L1: the explicit TTL wins over the policy and the default", () => {
			assert.equal(Explicit.expiresAt - Explicit.acquiredAt, 12345);
			assert.equal(Policy.expiresAt - Policy.acquiredAt, 50000);
			assert.equal(Default.expiresAt - Default.acquiredAt, 300000);
			assert.equal(Policy.id, "lease:2");
		});
		Check(Count, "L1: the lease line is the exact prefix", () => {
			assert.deepEqual(LinesWith(Run, "leased lease:1"), [
				`authority: leased lease:1 (alice -> /r/a.ts, expires ${Explicit.expiresAt})`,
			]);
		});
	}

	// Group L2: the per-holder lease ceiling.
	{
		const Run = Setup({ maxLeasesPerHolder: 1 });
		const Service = Run.Context.workspaceAuthority;
		Service.acquire("alice", "/r/a.ts", "tmp", 5000);
		Check(Count, "L2: the second lease for the same holder is refused", () => {
			assert.equal(Service.acquire("alice", "/r/b.ts", "tmp", 5000), undefined);
			assert.deepEqual(LinesWith(Run, "refused lease"), [
				"authority: refused lease (alice holds 1)",
			]);
		});
	}

	// Group L3: the lazy expiry sweep.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		Service.acquire("alice", "/r/a.ts", "tmp", 5000);
		(Run.State.Leases.get("lease:1") as { expiresAt: number }).expiresAt = Date.now() - 1000;
		const Second = Service.acquire("alice", "/r/b.ts", "tmp", 5000);
		Check(Count, "L3: the expired lease closes on touch with the exact line", () => {
			assert.equal(Second.id, "lease:2");
			assert.equal((Run.State.Leases.get("lease:1") as any).closed, true);
			assert.deepEqual(LinesWith(Run, "expired lease:1"), [
				"authority: expired lease:1",
			]);
		});
	}

	// Group L4: the release path.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		Service.acquire("alice", "/r/a.ts", "tmp", 5000);
		Check(Count, "L4: the release closes the lease with the exact line", () => {
			assert.equal(Service.release("lease:1"), true);
			assert.equal((Run.State.Leases.get("lease:1") as any).closed, true);
			assert.deepEqual(LinesWith(Run, "released lease:1"), [
				"authority: released lease:1",
			]);
		});
		Check(Count, "L4: releasing again is reported honestly", () => {
			assert.equal(Service.release("lease:1"), false);
			assert.deepEqual(LinesWith(Run, "release ignored"), [
				"authority: release ignored lease:1 (already closed)",
			]);
		});
		Check(Count, "L4: releasing an unknown lease is reported honestly", () => {
			assert.equal(Service.release("lease:99"), false);
			assert.deepEqual(LinesWith(Run, "release failed"), [
				"authority: release failed lease:99 (unknown lease)",
			]);
		});
	}

	// Group S1: the statistics.
	{
		const Run = Setup();
		const Service = Run.Context.workspaceAuthority;
		Service.grant({ holder: "alice", resource: "/r/a.ts", operations: ["read"] });
		Service.acquire("alice", "/r/a.ts", "tmp", 5000);
		Service.residence("/r/a.ts", "tmp", 1);
		Check(Count, "S1: the statistics report the exact counts", () => {
			assert.deepEqual(Service.statistics(), {
				capabilities: 1,
				leases: 1,
				residency: 1,
				sequence: 2,
			});
		});
	}

	return Finish(Count, "Capability-And-Lease");
};

// Standalone entry: `node Target/Test/Capability-And-Lease/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Capability-And-Lease`);
}
