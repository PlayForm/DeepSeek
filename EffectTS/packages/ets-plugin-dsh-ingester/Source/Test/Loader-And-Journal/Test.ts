// Source/Test/Loader-And-Journal/Test.ts - the class-form loader contract,
// the config defaults, and the pre-apply validation: every rejection is
// journaled before any write, every target is reported honestly.
import assert from "node:assert/strict";
import {
	Build,
	Check,
	Decision,
	Finish,
	Ingester,
	Journal,
	Ledger,
	MakeCtx,
	MakeCounter,
	Proposal,
	rm,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the class-form loader contract.
	{
		Check(Count, "L1: the class carries the loader contract", () => {
			assert.equal(typeof Ingester, "function");
			assert.deepEqual((Ingester as any).inject, ["fs"]);
			assert.ok((Ingester as any).Config !== undefined);
			assert.equal(typeof (Ingester as any).Config({}), "object");
		});
		const Run = Build();
		Check(Count, "L1: the service registers on construction through the context", () => {
			assert.equal(Run.Provided["ingester"], Run.Ingester);
			assert.equal(typeof Run.Ingester.Apply, "function");
		});
	}

	// Group L2: the config defaults.
	{
		Check(Count, "L2: the schema fills the defaults and validates types", () => {
			const Config = (Ingester as any).Config({});
			assert.equal(Config.enabled, true);
			assert.equal(Config.maxTargets, 20);
			assert.equal(Config.stopOnConflict, true);
			assert.throws(() => (Ingester as any).Config({ maxTargets: "many" }));
		});
	}

	// Group L3: the decision mismatch.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const Result = await Run.Ingester.Apply(
			Proposal("p1", [{ path: "/repo/a.txt", version: "v", why: "w" }], [
				{ path: "/repo/a.txt", find: "one", replace: "two", why: "w" },
			]),
			Decision("other"),
		);
		Check(Count, "L3: a decision for another proposal rejects the whole run", () => {
			assert.deepEqual(Result, {
				proposal: "p1",
				perTarget: [{ path: "/repo/a.txt", outcome: "skipped" }],
				applied: 0,
				conflicts: 0,
				recovery: 0,
			});
		});
		Check(Count, "L3: the rejection is journaled with the reason and no write happened", () => {
			assert.deepEqual(
				Journal().map((Line) => [Line.event, Line.detail]),
				[["rejected", "decision does not reference this proposal"]],
			);
			assert.equal(Run.Files["/repo/a.txt"], "one");
		});
	}

	// Group L4: the non-approval outcomes.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const P = Proposal("p1", [{ path: "/repo/a.txt", version: "v", why: "w" }], [
			{ path: "/repo/a.txt", find: "one", replace: "two", why: "w" },
		]);
		const Denied = await Run.Ingester.Apply(P, Decision("p1", "denied"));
		const Expired = await Run.Ingester.Apply(P, Decision("p1", "expired"));
		const Other = await Run.Ingester.Apply(P, Decision("p1", "postponed"));
		Check(Count, "L4: a denied decision rejects with the byte-exact reason", () => {
			assert.equal(Denied.applied, 0);
			assert.deepEqual(
				Journal().map((Line) => Line.detail),
				["decision denied the proposal", "decision recorded the proposal as expired", "decision is not an approval"],
			);
		});
		Check(Count, "L4: an expired decision and a non-approval reject too", () => {
			assert.equal(Expired.applied, 0);
			assert.equal(Other.applied, 0);
			assert.equal(Other.perTarget[0].outcome, "skipped");
		});
	}

	// Group L5: the proposal validity.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const Past = Date.now() - 1_000;
		const ExpiredP = Proposal(
			"p1",
			[{ path: "/repo/a.txt", version: "v", why: "w" }],
			[{ path: "/repo/a.txt", find: "one", replace: "two", why: "w" }],
			Past,
		);
		const EmptyP = Proposal("p2", [{ path: "/repo/a.txt", version: "v", why: "w" }], []);
		const R1 = await Run.Ingester.Apply(ExpiredP, Decision("p1"));
		const R2 = await Run.Ingester.Apply(EmptyP, Decision("p2"));
		Check(Count, "L5: an expired proposal and an empty one reject with the reasons", () => {
			assert.deepEqual(
				Journal().map((Line) => Line.detail),
				["proposal expired", "proposal carries no operations"],
			);
			assert.equal(R1.applied, 0);
			assert.equal(R2.applied, 0);
		});
	}

	// Group L6: the absent filesystem service.
	{
		rm();
		const Run = MakeCtx();
		Run.Files = {};
		Run.Ingester = new Ingester(Run.Context, (Ingester as any).Config({ logFile: Ledger }));
		const Result = await Run.Ingester.Apply(
			Proposal(
				"p1",
				[
					{ path: "/repo/a.txt", version: "v", why: "w" },
					{ path: "/repo/b.txt", version: "v", why: "w" },
				],
				[
					{ path: "/repo/a.txt", find: "one", replace: "two", why: "w" },
					{ path: "/repo/b.txt", find: "one", replace: "two", why: "w" },
				],
			),
			Decision("p1"),
		);
		Check(Count, "L6: a missing fs service reports recovery-required for every target", async () => {
			assert.equal(Result.applied, 0);
			assert.equal(Result.recovery, 2);
			assert.deepEqual(
				Result.perTarget.map((T: any) => T.outcome),
				["recovery-required", "recovery-required"],
			);
		});
		Check(Count, "L6: the missing-service rejection is journaled", () => {
			assert.deepEqual(
				Journal().map((Line) => [Line.event, Line.detail]),
				[["rejected", "no filesystem service"]],
			);
		});
	}
	return Finish(Count, "Loader-And-Journal");
};

// Standalone entry: `node Target/Test/Loader-And-Journal/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Loader-And-Journal`);
}
