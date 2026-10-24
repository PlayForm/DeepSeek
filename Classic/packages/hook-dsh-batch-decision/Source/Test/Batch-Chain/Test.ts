// Source/Test/Batch-Chain/Test.ts - THE END-TO-END BATCH CHAIN, the wave-1
// acceptance proof:
//
//   pass-on.Prepare -> batch/proposed (the bus) + the harness inbox (the
//   delivery) -> batchstate's splice (the board) -> batch_decision (the user)
//   -> the inbox (the board's status) + batch/decision (the bus) -> the
//   ingester's apply through the content fence -> the feedback outcome.
//
// ONE process, ONE shared fake context, the REAL built libraries of all five
// packages. The fake agent registry mirrors the harness's own inbox commit
// (`agent.inject` -> the durable `agent/inbox/spliced` + the live
// `agent/inbox/inserted`), so the chain exercises exactly the channel the
// harness provides. No sleeps: the ingester's `WhenIdle` drains the apply.
import assert from "node:assert/strict";
import { createHash as Hash } from "node:crypto";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import BatchState from "../../../../plugin-dsh-batchstate/Target/Library.js";
import FactoryClass from "../../../../plugin-dsh-factory/Target/Library.js";
import Feedback from "../../../../plugin-dsh-feedback/Target/Library.js";
import Ingester from "../../../../plugin-dsh-ingester/Target/Library.js";
import PassOn from "../../../../plugin-dsh-pass-on/Target/Library.js";
import Plugin from "../../../Target/Library.js";

/** The sha256 of a content string (the version fence's own algorithm). */
const Sha = (Content: string): string => Hash("sha256").update(Content).digest("hex");

/** The temp root of this folder's fixtures. */
const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "batch-chain-"));

/** The five ledgers (one log per module, the family convention). */
const Files = {
	board: Path.join(Root, "batchstate.log"),
	hook: Path.join(Root, "batch-decision.log"),
	passOn: Path.join(Root, "pass-on.log"),
	ingester: Path.join(Root, "ingester.log"),
	feedback: Path.join(Root, "feedback.log"),
	state: Path.join(Root, "state.json"),
	target: Path.join(Root, "repo", "pkg.json"),
};

/** The lines of one JSON-lines ledger. */
const Lines = (File: string): any[] => {
	try {
		return FileSystem
			.readFileSync(File, "utf8")
			.split("\n")
			.filter(Boolean)
			.map((Line) => JSON.parse(Line));
	} catch {
		return [];
	}
};

/** The capturing governed fs (the ingester's only write path). */
const FakeFs = (Content: string): any => {
	const Files_ = { [Files.target]: Content };
	const Fs: any = {
		files: Files_,
		edits: [] as unknown[],
		resolve: async (P: string) => ({ targetKey: P, displayPath: P }),
		stat: async (Target: any) => {
			const Text = Files_[Target.displayPath];
			return Text === undefined ? undefined : { version: Sha(Text), type: "file" };
		},
		readText: async (Target: any) => Files_[Target.displayPath],
		editText: async (Target: any, Edit: any, Guard: any) => {
			Fs.edits.push([Target.displayPath, Edit.oldString]);
			const Text = Files_[Target.displayPath];
			if (Text === undefined || !Text.includes(Edit.oldString) || Sha(Text) !== Guard.version) {
				throw new Error("FS_STALE_VERSION");
			}
			const Next = Text.replace(Edit.oldString, Edit.newString);
			Files_[Target.displayPath] = Next;
			return { operation: "update", version: Sha(Next) };
		},
	};
	return Fs;
};

export const runTest = async (): Promise<number> => {
	const Count = { N: 0, F: 0 };
	const Check = (Label: string, Assertions: () => void): void => {
		Count.N++;
		try {
			Assertions();
			console.log(`PASS - ${Label}`);
		} catch (_Error) {
			Count.F++;
			console.log(`FAIL - ${Label}`);
			console.log(_Error instanceof Error ? _Error.message : String(_Error));
		}
	};

	// -- the shared context: one bus, one service registry, one logger --
	const Content = '{"name": "c", "version": "1.0.0"}';
	FileSystem.mkdirSync(Path.dirname(Files.target), { recursive: true });
	FileSystem.writeFileSync(Files.target, Content, "utf8");
	const Fs = FakeFs(Content);
	const Listeners: Record<string, ((...Args: any[]) => void)[]> = {};
	const Lines_ = [] as string[];
	const Provided: Record<string, unknown> = {};
	const Services: Record<string, unknown> = {};
	const Registered: any[] = [];
	let Context: any;
	const On = (Name: string, Listener: (...Args: any[]) => void): void => {
		Listeners[Name] = [...(Listeners[Name] ?? []), Listener];
	};
	const Emit = (Name: string, ...Args: any[]): void => {
		for (const Listener of Listeners[Name] ?? []) {
			try {
				Listener(...Args);
			} catch {
				/* fail-open, the family's emit contract */
			}
		}
	};
	// The fake agent registry: inject mirrors the harness's inbox commit.
	const Injected: any[] = [];
	const Agents = {
		get: (Id: string) =>
			Id === "agent-a"
				? {
						id: "agent-a",
						inject: (Message: any) => {
							Injected.push(Message);
							Emit("session/event", { id: "agent-a" }, {
								type: "agent/inbox/spliced",
								data: { target: "next-step", start: 0, inserted: [Message] },
							});
							Emit("agent/inbox/inserted", { agent: { id: "agent-a" }, message: Message });
						},
					}
				: undefined,
		list: () => [],
		currentInitiator: () => undefined,
	};
	Context = {
		pluginFactory: new FactoryClass({ reflect: { provide: () => undefined } } as any),
		logger: {
			info: (M: string) => Lines_.push(M),
			warn: (M: string) => Lines_.push(`WARN: ${M}`),
			error: (M: string) => Lines_.push(`ERROR: ${M}`),
		},
		on: On,
		emit: Emit,
		get: (Name: string) => Services[Name],
		tools: {
			register: (Definition: unknown) => {
				Registered.push(Definition);
				return () => true;
			},
		},
		fs: Fs,
		root: { on: On, emit: Emit },
		reflect: {
			provide: (Name: string, Value?: unknown) => {
				Provided[Name] = Value ?? true;
				Services[Name] = Value;
				Context[Name] = Value;
				return () => true;
			},
		},
	};

	// -- the five mounts (the loader's own sequences) --
	Services["agents"] = Agents;
	(BatchState.apply as any)(
		Context,
		(BatchState.Config as any)({
			logFile: Files.board,
			enabled: true,
			stateFile: Files.state,
		}),
	);
	const Board = Context.batchstate;
	const Pass = new (PassOn as any)(
		Context,
		(PassOn as any).Config({ logFile: Files.passOn, root: Root, enabled: true }),
	);
	const Ingest = new (Ingester as any)(
		Context,
		(Ingester as any).Config({ logFile: Files.ingester, enabled: true }),
	);
	const Council = new (Feedback as any)(
		Context,
		(Feedback as any).Config({ logFile: Files.feedback, enabled: true }),
	);
	Services["passOn"] = Pass;
	Services["ingester"] = Ingest;
	Services["feedback"] = Council;
	(Plugin.apply as any)(
		Context,
		(Plugin.Config as any)({
			logFile: Files.hook,
			enabled: true,
			autoApprove: "off",
			allowlist: [],
			maxAutoTargets: 5,
			minConfidence: 0.8,
			pendingTtlMs: 3_600_000,
		}),
	);
	const Hook = Context.__hookDshBatchDecisionState;
	const Tool = Registered.find((One: any) => One.name === "batch_decision");

	// -- 1. the proposal: prepared, emitted, delivered, spliced --
	const Prepared = Pass.Prepare(
		{ kind: "version-bump", targets: [Files.target], params: { version: "2.0.0" } },
		"agent-a",
	);
	Check("C1: the pass-on prepared the batch and delivered it into the inbox", () => {
		assert.equal(Prepared.targets.length, 1);
		assert.equal(Injected.length, 1);
		assert.ok(Injected[0].content[0].text.startsWith(`[BATCH PROPOSAL - ${Prepared.id}]`));
	});
	Check("C2: the board spliced the proposal with the byte-exact line", () => {
		const Entry = Board.getProposals()[0];
		assert.equal(Entry.proposal.id, Prepared.id);
		assert.equal(Entry.status, "proposed");
		assert.ok(
			Lines_.includes(
				`batchstate: proposal ${Prepared.id} spliced (intent version-bump, targets 1, rev 1, origin agent-a)`,
			),
		);
	});
	Check("C3: the decision hook recorded the proposal and the ingester holds it", () => {
		assert.equal(Hook.Pending.get(Prepared.id).proposal.targets.length, 1);
		assert.ok(
			Lines_.includes(
				`hook-dsh-batch-decision: proposal ${Prepared.id} recorded (intent version-bump, targets 1, rev 1)`,
			),
		);
		assert.equal(Ingest.Proposals().length, 1);
	});

	// -- 2. the decision: the user approves through the one tool --
	const Decided = await Tool.execute({ id: Prepared.id, approve: true }, {});
	await Ingest.WhenIdle();
	Check("C4: the approval applied the change through the content fence", () => {
		assert.equal(Decided.kind, "approved");
		assert.equal(Fs.files[Files.target], '{"name": "c", "version": "2.0.0"}');
		const Applied = Lines(Files.ingester).filter((Line) => Line.event === "applied");
		assert.equal(Applied.length, 1);
		assert.equal(Applied[0].path, Files.target);
	});
	Check("C5: the decision reached the board through the inbox", () => {
		assert.equal(Board.getProposals()[0].status, "approved");
		assert.ok(
			Lines_.includes(`batchstate: proposal ${Prepared.id} decided approved (by user)`),
		);
		assert.ok(
			Lines_.includes(`hook-dsh-batch-decision: inbox ${Prepared.id}: delivered to agent-a`),
		);
	});
	Check("C6: the hook logged the decision and the ingester handoff byte-exactly", () => {
		assert.ok(
			Lines_.includes(`hook-dsh-batch-decision: decision approved ${Prepared.id} (by user)`),
		);
		assert.ok(
			Lines_.includes(
				`hook-dsh-batch-decision: handoff ${Prepared.id}: applied 1, conflicts 0, recovery 0`,
			),
		);
	});
	Check("C7: the batch outcome fed the feedback journal and summary", () => {
		const Outcome = Lines(Files.feedback).find((Line) => Line.event === "batch");
		assert.deepEqual(
			[Outcome.session, Outcome.agentId, Outcome.proposal, Outcome.outcome, Outcome.detail],
			["agent-a", "agent-a", Prepared.id, "applied", "applied 1, conflicts 0, recovery 0"],
		);
		const Summary = Council.Summary("agent-a");
		assert.deepEqual(
			Summary.outcomes.map((One: any) => [One.proposal, One.outcome]),
			[[Prepared.id, "applied"]],
		);
	});
	Check("C8: the same decision was applied exactly once (the claim held)", () => {
		assert.equal(Fs.edits.length, 1);
		assert.equal(Lines(Files.ingester).filter((Line) => Line.event === "applied").length, 1);
	});
	Check("C9: the delivery journaled the inbox handoff byte-exactly", () => {
		const Delivered = Lines(Files.passOn).filter((Line) => Line.event === "delivered");
		assert.equal(Delivered.length, 1);
		assert.equal(Delivered[0].note, "inbox agent-a");
		assert.equal(Delivered[0].proposal, Prepared.id);
	});

	if (Count.F !== 0) {
		throw new Error(`Batch-Chain: ${Count.F} failed check(s)`);
	}
	return Count.N;
};

// Standalone entry: `node Target/Test/Batch-Chain/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Batch-Chain`);
}
