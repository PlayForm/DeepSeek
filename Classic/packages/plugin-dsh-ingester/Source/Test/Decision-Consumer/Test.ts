// Source/Test/Decision-Consumer/Test.ts - THE TRACE ADAPTER: the ingester
// consumes `batch/proposed` (recording the proposal) and `batch/decision`
// (applying it through the existing content fence), with one apply per
// decision however many times the decision is delivered, the honest refusals,
// the feedback outcome handoff, and the WhenIdle flush seam.
import assert from "node:assert/strict";
import {
	Build,
	Check,
	Decision,
	Finish,
	Journal,
	MakeCounter,
	Proposal,
	Sha,
} from "../Harness.js";

/** A proposal over one fenced file (the version token is the live content). */
const Fenced = (Id = "p1", Content = "one"): any =>
	Proposal(
		Id,
		[{ path: "/repo/a.txt", version: Sha(Content), why: "w" }],
		[{ path: "/repo/a.txt", find: "one", replace: "two", why: "w" }],
	);

/** Fire one bus event through the captured listener. */
const Fire = (Run: any, Name: string, Payload: unknown): void => {
	Run.Listeners[Name](Payload);
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group D1: the proposal record and the decision apply.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const P = Fenced();
		Fire(Run, "batch/proposed", P);
		Check(Count, "D1: the proposed event records the proposal", () => {
			assert.deepEqual(
				Run.Ingester.Proposals().map((One: any) => One.id),
				["p1"],
			);
		});
		Fire(Run, "batch/decision", Decision("p1"));
		await Run.Ingester.WhenIdle();
		Check(Count, "D1: the decision event applies through the content fence", () => {
			assert.equal(Run.Files["/repo/a.txt"], "two");
			assert.deepEqual(
				Journal().map((Line) => [Line.event, Line.path]),
				[["applied", "/repo/a.txt"]],
			);
		});
	}

	// Group D2: the one-apply claim.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const P = Fenced();
		const D = Decision("p1");
		Fire(Run, "batch/proposed", P);
		Fire(Run, "batch/decision", D);
		Fire(Run, "batch/decision", D);
		await Run.Ingester.WhenIdle();
		Check(Count, "D2: the same decision delivered twice applies exactly once", () => {
			assert.equal(Run.Files["/repo/a.txt"], "two");
			assert.equal(Journal().filter((Line) => Line.event === "applied").length, 1);
			assert.equal(Run.Ingester.State.Pending.size, 1);
		});
	}

	// Group D3: the unknown proposal.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		Fire(Run, "batch/decision", Decision("ghost"));
		await Run.Ingester.WhenIdle();
		Check(Count, "D3: a decision for an unrecorded proposal is refused, never applied", () => {
			assert.equal(Run.Files["/repo/a.txt"], "one");
			assert.deepEqual(
				Journal().map((Line) => [Line.event, Line.detail]),
				[["unknown", "no proposal recorded for the decision"]],
			);
		});
	}

	// Group D4: the rejected decision.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		Fire(Run, "batch/proposed", Fenced());
		Fire(Run, "batch/decision", Decision("p1", "denied"));
		await Run.Ingester.WhenIdle();
		Check(Count, "D4: a denied decision rejects the whole run with its byte-exact reason", () => {
			assert.equal(Run.Files["/repo/a.txt"], "one");
			assert.deepEqual(
				Journal().map((Line) => [Line.event, Line.detail]),
				[["rejected", "decision denied the proposal"]],
			);
		});
	}

	// Group D5: the feedback outcome.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const Received: any[] = [];
		Run.Context.feedback = {
			Outcome: (...Args: unknown[]) => {
				Received.push(Args);
			},
		};
		Fire(Run, "batch/proposed", Fenced("p1", "one"));
		Fire(Run, "batch/decision", Decision("p1"));
		await Run.Ingester.WhenIdle();
		Check(Count, "D5: the apply outcome feeds the feedback service with the honest detail", () => {
			assert.deepEqual(Received, [["", "", "p1", "applied", "applied 1, conflicts 0, recovery 0"]]);
		});
	}

	// Group D6: the feedback outcome carries the proposal's origin.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		const Received: any[] = [];
		Run.Context.feedback = {
			Outcome: (...Args: unknown[]) => {
				Received.push(Args);
			},
		};
		Fire(Run, "batch/proposed", { ...Fenced("p1", "one"), origin: "agent-a" });
		Fire(Run, "batch/decision", Decision("p1"));
		await Run.Ingester.WhenIdle();
		Check(Count, "D6: the outcome's session and agent are the proposal's origin", () => {
			assert.deepEqual(Received, [
				["agent-a", "agent-a", "p1", "applied", "applied 1, conflicts 0, recovery 0"],
			]);
		});
	}

	// Group D7: the malformed traffic.
	{
		const Run = Build({}, { "/repo/a.txt": "one" });
		Fire(Run, "batch/proposed", null);
		Fire(Run, "batch/proposed", { id: "" });
		Fire(Run, "batch/decision", null);
		Fire(Run, "batch/decision", { proposal: "" });
		await Run.Ingester.WhenIdle();
		Check(Count, "D7: malformed proposals and decisions are ignored without a throw", () => {
			assert.equal(Run.Ingester.Proposals().length, 0);
			assert.deepEqual(Journal(), []);
			assert.equal(Run.Files["/repo/a.txt"], "one");
		});
	}

	return Finish(Count, "Decision-Consumer");
};

// Standalone entry: `node Target/Test/Decision-Consumer/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Decision-Consumer`);
}
