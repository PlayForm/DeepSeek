// Source/Test/Trigger-And-Cap/Test.ts - THE IDLE EDGE: the iteration counter,
// the threshold, both write caps, and the maintenance claim.
//
// The gate is the only thing between the harness's idle edge and a model call,
// so every arm here is about what does NOT happen: a disabled service, a count
// below the threshold, a capped session and a busy agent each end the run
// before the review body is reached. The caps count SUCCESSES, never attempts,
// which is the one property the existing nudge hook gets wrong
// (`Source/Function/Trigger.ts:15-20`), and the interval advances on a CLAIMED
// run rather than on a write.
//
// The last check walks all twelve outcome classes: five are produced by the
// gate itself, and the other seven are the review's own result, which the gate
// passes through verbatim. That is what "reachable without a model" means - no
// folder here needs an llm service to name a class.
import assert from "node:assert/strict";

import Gate from "../../../Target/Function/Trigger.js";
import type { Session } from "../../../Target/Function/Trigger.js";
import type { ReviewResult } from "../../../Target/Interface/Review.js";
import type { Outcome } from "../../../Target/Interface/Trigger.js";
import { CheckAsync, FakeAgent, Finish, Knobs, MakeCounter } from "../Harness.js";

/** A review that ends in one class and spends the given number of writes. */
const Review =
	(Result: Outcome, Spends = 0) =>
	async (_Signal: AbortSignal, Session_: Session): Promise<ReviewResult> => {
		for (let Index = 0; Index < Spends; Index += 1) {
			Session_.spend();
		}
		return { outcome: Result, applied: [], refused: [], report: "" };
	};

/** A review that rejects, which is the arm the gate must still classify. */
const Explode = async (): Promise<ReviewResult> => {
	throw new Error("the model call failed");
};

/** The seven classes the review itself produces, in the order the union lists them. */
const Returned: readonly Outcome[] = [
	"no-llm",
	"no-route",
	"empty-transcript",
	"unparsable",
	"nothing",
	"refused",
	"applied",
];

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	await CheckAsync(Count, "T1: a disabled service answers `disabled` and never claims the agent", async () => {
		const Agent = FakeAgent();
		const Verdict = await new Gate().Run({
			agent: Agent,
			count: 20,
			configuration: Knobs({ enabled: false, intervalIterations: 5 }),
			review: Review("applied"),
		});
		assert.deepEqual(Verdict, { outcome: "disabled", due: true, count: 20, writes: 0 }, "the class is explicit");
		assert.equal(Agent.Claims.length, 0, "the idle phase is never claimed");
	});

	await CheckAsync(Count, "T2: below the threshold answers `below-threshold` and never claims", async () => {
		const Agent = FakeAgent();
		const Verdict = await new Gate().Run({
			agent: Agent,
			count: 4,
			configuration: Knobs({ enabled: true, intervalIterations: 5 }),
			review: Review("applied"),
		});
		assert.deepEqual(Verdict, { outcome: "below-threshold", due: false, count: 4, writes: 0 });
		assert.equal(Agent.Claims.length, 0, "an early tick costs nothing");
	});

	await CheckAsync(Count, "T3: the counter is a delta from the last claimed run", async () => {
		const Gate_ = new Gate();
		const Agent = FakeAgent();
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 5 });
		const First = await Gate_.Run({
			agent: Agent,
			count: 5,
			configuration: Configuration_,
			review: Review("nothing"),
		});
		assert.equal(First.due, true, "five tool calls reach the interval");
		const Second = await Gate_.Run({
			agent: Agent,
			count: 8,
			configuration: Configuration_,
			review: Review("applied"),
		});
		assert.deepEqual(
			Second,
			{ outcome: "below-threshold", due: false, count: 3, writes: 0 },
			"the lifetime total is not the counter",
		);
		assert.equal(Agent.Claims.length, 1);
	});

	await CheckAsync(Count, "T4: a due run claims the idle phase and returns the review's own class", async () => {
		const Agent = FakeAgent();
		const Verdict = await new Gate().Run({
			agent: Agent,
			count: 5,
			configuration: Knobs({ enabled: true, intervalIterations: 5 }),
			review: Review("applied"),
		});
		assert.deepEqual(Verdict, { outcome: "applied", due: true, count: 5, writes: 0 });
		assert.equal(Agent.Claims.length, 1, "the claim is the harness's own idle phase");
	});

	await CheckAsync(Count, "T5: the session cap is checked before the model", async () => {
		const Gate_ = new Gate();
		const Agent = FakeAgent();
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 1, maxWritesPerSession: 1 });
		const First = await Gate_.Run({
			agent: Agent,
			count: 1,
			configuration: Configuration_,
			review: Review("applied", 1),
		});
		assert.deepEqual(First, { outcome: "applied", due: true, count: 1, writes: 1 });
		const Second = await Gate_.Run({
			agent: Agent,
			count: 2,
			configuration: Configuration_,
			review: Review("applied", 1),
		});
		assert.deepEqual(Second, { outcome: "capped", due: true, count: 1, writes: 1 });
		assert.equal(Agent.Claims.length, 1, "a capped session costs no tokens");
	});

	await CheckAsync(Count, "T6: the cap counts successes, not attempts", async () => {
		const Gate_ = new Gate();
		const Agent = FakeAgent();
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 1, maxWritesPerSession: 1 });
		const First = await Gate_.Run({
			agent: Agent,
			count: 1,
			configuration: Configuration_,
			review: Review("refused"),
		});
		assert.deepEqual(First, { outcome: "refused", due: true, count: 1, writes: 0 }, "a refusal spends nothing");
		const Second = await Gate_.Run({
			agent: Agent,
			count: 2,
			configuration: Configuration_,
			review: Review("refused"),
		});
		assert.deepEqual(Second, { outcome: "refused", due: true, count: 1, writes: 0 });
		assert.equal(Agent.Claims.length, 2, "a refused run never spends the budget a real write needs");
	});

	await CheckAsync(Count, "T7: `spend` advances the session counter and `writes` reports it", async () => {
		const Gate_ = new Gate();
		const Agent = FakeAgent();
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 1, maxWritesPerSession: 6 });
		const First = await Gate_.Run({
			agent: Agent,
			count: 1,
			configuration: Configuration_,
			review: Review("applied", 2),
		});
		assert.equal(First.writes, 2, "two landed writes");
		const Second = await Gate_.Run({
			agent: Agent,
			count: 2,
			configuration: Configuration_,
			review: Review("applied", 1),
		});
		assert.equal(Second.writes, 3, "the session total carries across runs");
	});

	await CheckAsync(Count, "T8: the cap is keyed by the agent object", async () => {
		const Gate_ = new Gate();
		const Left = FakeAgent({ id: "left" });
		const Right = FakeAgent({ id: "right" });
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 1, maxWritesPerSession: 1 });
		await Gate_.Run({ agent: Left, count: 1, configuration: Configuration_, review: Review("applied", 1) });
		const Capped = await Gate_.Run({
			agent: Left,
			count: 2,
			configuration: Configuration_,
			review: Review("applied", 1),
		});
		assert.equal(Capped.outcome, "capped", "the first agent is spent");
		const Free = await Gate_.Run({
			agent: Right,
			count: 1,
			configuration: Configuration_,
			review: Review("applied", 1),
		});
		assert.deepEqual(Free, { outcome: "applied", due: true, count: 1, writes: 1 }, "the second has its own budget");
	});

	await CheckAsync(Count, "T9: a busy agent answers `busy` and the review never runs", async () => {
		const Agent = FakeAgent({ busy: true });
		const Verdict = await new Gate().Run({
			agent: Agent,
			count: 5,
			configuration: Knobs({ enabled: true, intervalIterations: 5 }),
			review: Review("applied"),
		});
		assert.deepEqual(Verdict, { outcome: "busy", due: true, count: 5, writes: 0 }, "the synchronous throw is the class");
		assert.equal(Agent.Claims.length, 0, "nothing was started");
	});

	await CheckAsync(Count, "T10: a claimed run advances the interval; a busy run does not", async () => {
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 3 });
		const Free = FakeAgent();
		const FreeGate = new Gate();
		await FreeGate.Run({ agent: Free, count: 3, configuration: Configuration_, review: Review("nothing") });
		const Again = await FreeGate.Run({
			agent: Free,
			count: 3,
			configuration: Configuration_,
			review: Review("nothing"),
		});
		assert.deepEqual(
			Again,
			{ outcome: "below-threshold", due: false, count: 0, writes: 0 },
			"the interval bounds how often the review RUNS, not how much it writes",
		);
		const Busy = FakeAgent({ busy: true });
		const BusyGate = new Gate();
		await BusyGate.Run({ agent: Busy, count: 3, configuration: Configuration_, review: Review("nothing") });
		const Retry = await BusyGate.Run({
			agent: Busy,
			count: 4,
			configuration: Configuration_,
			review: Review("nothing"),
		});
		assert.equal(Retry.count, 4, "a busy run leaves the counter where it was");
		assert.equal(Retry.due, true, "so the next idle edge still asks");
	});

	await CheckAsync(Count, "T11: all twelve outcome classes are reachable without a model", async () => {
		const Seen: string[] = [];
		const Configuration_ = Knobs({ enabled: true, intervalIterations: 1, maxWritesPerSession: 1 });
		Seen.push(
			(
				await new Gate().Run({
					agent: FakeAgent(),
					count: 0,
					configuration: Knobs({ enabled: false, intervalIterations: 1 }),
					review: Review("applied"),
				})
			).outcome,
		);
		Seen.push(
			(
				await new Gate().Run({
					agent: FakeAgent(),
					count: 0,
					configuration: Configuration_,
					review: Review("applied"),
				})
			).outcome,
		);
		Seen.push(
			(
				await new Gate().Run({
					agent: FakeAgent({ busy: true }),
					count: 1,
					configuration: Configuration_,
					review: Review("applied"),
				})
			).outcome,
		);
		Seen.push(
			(
				await new Gate().Run({
					agent: FakeAgent(),
					count: 1,
					configuration: Configuration_,
					review: Explode,
				})
			).outcome,
		);
		const Capped = new Gate();
		const Spender = FakeAgent();
		await Capped.Run({
			agent: Spender,
			count: 1,
			configuration: Configuration_,
			review: Review("applied", 1),
		});
		Seen.push(
			(
				await Capped.Run({
					agent: Spender,
					count: 2,
					configuration: Configuration_,
					review: Review("applied"),
				})
			).outcome,
		);
		for (const Result of Returned) {
			Seen.push(
				(
					await new Gate().Run({
						agent: FakeAgent(),
						count: 1,
						configuration: Configuration_,
						review: Review(Result),
					})
				).outcome,
			);
		}
		assert.deepEqual(
			[...Seen].sort(),
			[
				"applied",
				"below-threshold",
				"busy",
				"capped",
				"disabled",
				"empty-transcript",
				"model-failed",
				"no-llm",
				"no-route",
				"nothing",
				"refused",
				"unparsable",
			],
			"the twelve-class union is closed and every arm is reachable",
		);
	});

	return Finish(Count, "Trigger-And-Cap");
};

// Standalone entry: `node Target/Test/Trigger-And-Cap/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	await runTest();
}
