// Source/Test/Inbox-Handoff/Test.ts - THE HANDOFF: a recorded decision is
// written into the harness agent-team inbox (the channel the board
// consumes), the return address resolves origin -> initiator -> first live
// agent with an honest ledger line when nothing is live, and the ingester
// seam now finds the REAL service (registered as `ingester`) as well as the
// declared `batchIngester` seam - carrying the proposal the apply needs.
import assert from "node:assert/strict";
import {
	Check,
	CheckAsync,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Proposal,
	Tool,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount with the policy knobs on. */
const Setup = (): any => {
	rm();
	return Make(
		Validate({
			logFile: Ledger,
			enabled: true,
			autoApprove: "on",
			allowlist: ["version-bump"],
			maxAutoTargets: 5,
			minConfidence: 0.8,
			pendingTtlMs: 3_600_000,
		}),
	);
};

/** A fake harness agent registry whose inject is captured. */
const Agents = (Run: any, Id = "agent-a"): any => {
	const Injected: any[] = [];
	const Registry: any = {
		Injected,
		Initiator: undefined as any,
		First: undefined as any,
		get: (Target: string) =>
			Target === Id
				? {
						id: Id,
						inject: (Message: unknown) => {
							Injected.push(Message);
						},
					}
				: undefined,
		currentInitiator: () => Registry.Initiator,
		list: () => (Registry.First === undefined ? [] : [Registry.First]),
	};
	Run.Services["agents"] = Registry;
	return Registry;
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group H1: the decision lands in the origin agent's inbox.
	{
		const Run = Setup();
		const Registry = Agents(Run);
		Run.CtxListeners["batch/proposed"](Proposal({ origin: "agent-a" }));
		await Tool(Run).execute({ id: "prop-1", approve: true }, {});
		Check(Count, "H1: the decision is injected into the origin agent's inbox once", () => {
			assert.equal(Registry.Injected.length, 1);
			const Message = Registry.Injected[0];
			assert.equal(Message.role, "user");
			assert.equal(typeof Message.id, "string");
			assert.deepEqual(Message.source, { kind: "user" });
		});
		Check(Count, "H1: the injected text is the byte-exact decision envelope", () => {
			const Decision = Run.State.Pending.get("prop-1").decided;
			assert.equal(
				Registry.Injected[0].content[0].text,
				`[BATCH DECISION - prop-1]\n${JSON.stringify(Decision)}`,
			);
			assert.ok(Run.Lines.includes("hook-dsh-batch-decision: inbox prop-1: delivered to agent-a"));
		});
	}

	// Group H2: the return-address resolution.
	{
		const Run = Setup();
		const Registry = Agents(Run);
		Registry.Initiator = { id: "agent-initiator", inject: (Message: unknown) => Registry.Injected.push(Message) };
		Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-2" }));
		await Tool(Run).execute({ id: "prop-2", approve: true }, {});
		Check(Count, "H2: without an origin the harness initiator receives the decision", () => {
			assert.ok(
				Run.Lines.includes("hook-dsh-batch-decision: inbox prop-2: delivered to agent-initiator"),
			);
		});
		Registry.Initiator = undefined;
		Registry.First = { id: "agent-first", inject: (Message: unknown) => Registry.Injected.push(Message) };
		Run.CtxListeners["batch/proposed"](Proposal({ id: "prop-3", intent: "rename" }));
		await Tool(Run).execute({ id: "prop-3", approve: false }, {});
		Check(Count, "H2: without an initiator the first live agent receives the decision", () => {
			assert.ok(Run.Lines.includes("hook-dsh-batch-decision: inbox prop-3: delivered to agent-first"));
		});
	}

	// Group H3: the honest absence.
	{
		const Run = Setup();
		Run.CtxListeners["batch/proposed"](Proposal({ origin: "agent-a" }));
		await Tool(Run).execute({ id: "prop-1", approve: true }, {});
		Check(Count, "H3: without an agent registry the handoff is an honest ledger line", () => {
			assert.ok(Run.Lines.includes("hook-dsh-batch-decision: inbox prop-1: no live agent"));
		});
	}

	// Group H4: the live ingester seam (the real service name).
	{
		const Run = Setup();
		const Received: any[] = [];
		Run.Services["ingester"] = {
			Apply: async (Proposal_: any, Decision_: any) => {
				Received.push([Proposal_, Decision_]);
				return {
					proposal: Decision_.proposal,
					perTarget: [],
					applied: 1,
					conflicts: 0,
					recovery: 0,
				};
			},
		};
		Run.CtxListeners["batch/proposed"](Proposal({}));
		await CheckAsync(Count, "H4: the live `ingester` service receives the proposal AND the decision", async () => {
			const Result = await Tool(Run).execute({ id: "prop-1", approve: true }, {});
			assert.equal(Received.length, 1);
			assert.equal(Received[0][0].id, "prop-1");
			assert.equal(Received[0][0].targets.length, 1);
			assert.equal(Received[0][1].outcome, "approved");
			assert.equal(Result.detail, "approved prop-1; applied 1, conflicts 0, recovery 0");
		});
	}

	// Group H5: the declared seam still wins.
	{
		const Run = Setup();
		Run.Services["batchIngester"] = {
			apply: async (Decision_: any) => ({
				proposal: Decision_.proposal,
				perTarget: [],
				applied: 2,
				conflicts: 0,
				recovery: 0,
			}),
		};
		Run.Services["ingester"] = {
			Apply: async () => {
				throw new Error("the declared seam must win");
			},
		};
		Run.CtxListeners["batch/proposed"](Proposal({}));
		await CheckAsync(Count, "H5: a registered `batchIngester` seam is preferred over the live name", async () => {
			const Result = await Tool(Run).execute({ id: "prop-1", approve: true }, {});
			assert.equal(Result.detail, "approved prop-1; applied 2, conflicts 0, recovery 0");
			assert.ok(Run.Gets.includes("batchIngester"));
		});
	}

	return Finish(Count, "Inbox-Handoff");
};

// Standalone entry: `node Target/Test/Inbox-Handoff/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Inbox-Handoff`);
}
