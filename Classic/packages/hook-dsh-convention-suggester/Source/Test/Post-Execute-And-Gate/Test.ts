/**
 * @module Test
 *
 * The listener behavior of the convention-suggester against the fake ctx:
 * emit, projection, silence, abstention, gates and reset.
 *
 * @remarks
 * The covered paths are the history emit path (the note built from the
 * session's own previous tool calls, with the byte-exact text, summary and
 * `suggest` ledger lines in both forms), the real projection path (committed
 * `tool/call` events, folded by the registered unit, read back through
 * `stateOf`), the silence path (a non-judged call and a no-history call,
 * which abstains `no-history`), the abstention path (a fully excluded
 * candidate set), the gate paths (cooldown, per-turn cap), the
 * block-decision shape, the per-agent memory isolation, and the
 * agent/pre-step per-turn reset.
 */
import assert from "node:assert/strict";
import {
	AgentOf,
	CheckAsync,
	Commit,
	Durable,
	DurableLine,
	Finish,
	Ledger,
	LedgerWith,
	Make,
	MakeCounter,
	Pre,
	Post,
	rm,
	Setup,
	Validate,
} from "../Harness.js";

/** The anchor the history is keyed on: the judged call's own path. */
const Anchor = "Source/Function/Apply.ts";

/** The two companions the history names, in the fold's score order. */
const Companions = ["Source/Library.ts", "README.md"];

/** The history note's byte-exact text (k = 0.60 + 0.05 * 2). */
const HistoryText = [
	"[convention-suggester] intent=History confidence=0.70",
	"targets (2):",
	"- Source/Library.ts - touched 1 time(s) after this file",
	"- README.md - touched 1 time(s) after this file",
	"note: these files were touched right after this one in this workspace",
].join("\n");

/** The byte-exact suggest line the history path appends. */
const Suggest = "suggest History 0.70 2 candidates call write";

/**
 * Seed one agent's session history through the PROJECTION drive: three
 * committed `tool/call` events (the anchor, then the two companions) folded by
 * the registered unit into that session's cell. There is no State fold to
 * write to any more, so the seed travels the same init -> apply -> stateOf
 * path the live harness drives.
 */
const Seed = (Run: any, Id: string): void => {
	Commit(Run, Id, Anchor);
	for (const Companion of Companions) {
		Commit(Run, Id, Companion);
	}
};

/** A judged write call on the anchor path. */
const Write = (Id: string): any => ({
	name: "write",
	arguments: { file_path: Anchor },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the history emit path (the history arrives through the
	// projection drive, never a State fold).
	{
		const Run = Setup();
		await CheckAsync(Count, "E1: the History note is prepended to the decision's additionalContexts", async () => {
			await Run.Ready;
			Seed(Run, "a");
			Seed(Run, "b");
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, Write("a"), Decision);
			assert.notEqual(Out, Decision);
			assert.equal(Out.kind, "allow");
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "convention-suggester",
				form: "notice",
				summary: "History 0.70",
			});
			assert.equal(Out.additionalContexts[0].role, "user");
			assert.equal(typeof Out.additionalContexts[0].id, "string");
			assert.equal(Out.additionalContexts[1].id, "downstream");
			assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
		});
		await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
			const Out = await Post(Run, Write("b"), { kind: "allow", additionalContexts: [] });
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
			assert.ok(Run.Lines.includes(`convention-suggester: ${Suggest}`));
			assert.match(DurableLine(Suggest), Durable(Suggest));
			assert.equal(LedgerWith(Suggest).length, 2);
		});
		await CheckAsync(Count, "E1: the per-agent memory recorded the emit", async () => {
			const Memory = Run.State.Agents.get(AgentOf("a"));
			assert.equal(Memory.Calls, 1);
			assert.equal(Memory.TurnNotes, 1);
			assert.deepEqual([...Memory.Noted.keys()], ["History"]);
			assert.equal(Memory.Noted.get("History"), 1);
			assert.equal(Memory.Ring.length, 1);
			assert.ok(Memory.Ring[0].includes(Anchor));
		});
	}

	// Group E2: the silence and next()-first paths.
	{
		const Run = Setup();
		await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "bash", arguments: { command: "ls" }, agent: AgentOf("c") }, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Run.Lines, [`convention-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`]);
		});
		await CheckAsync(Count, "E2: a judged call with no history and no pack abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Write("c"), Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("convention-suggester: abstained no-history  0.00"));
			assert.match(
				DurableLine("abstained no-history"),
				Durable("abstained no-history  0.00"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 0);
		});
		await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
			await Run.Ready;
			Seed(Run, "d");
			let NextCalled = false;
			const Downstream = { kind: "allow", additionalContexts: [] };
			const Out = await Run.CtxListeners["tools/post-execute"](
				Write("d"),
				{},
				async () => {
					NextCalled = true;
					return Downstream;
				},
			);
			assert.equal(NextCalled, true);
			assert.notEqual(Out, Downstream);
		});
	}

	// Group E3: the abstention path.
	{
		rm();
		const Excluded = Make(Validate({ logFile: Ledger, enabled: true, exclude: Companions }));
		await CheckAsync(Count, "E3: a fully excluded candidate set abstains ambiguous", async () => {
			await Excluded.Ready;
			Seed(Excluded, "e");
			const Out = await Post(Excluded, Write("e"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Excluded.Lines.includes("convention-suggester: abstained ambiguous History 0.70"));
			assert.match(
				DurableLine("abstained ambiguous History 0.70"),
				Durable("abstained ambiguous History 0.70"),
			);
		});
	}

	// Group E4: the gate paths.
	{
		const Run = Setup();
		await CheckAsync(Count, "E4: the default cooldown suppresses an immediate History repeat", async () => {
			await Run.Ready;
			Seed(Run, "f");
			await Post(Run, Write("f"));
			const Out = await Post(Run, Write("f"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("convention-suggester: suppressed cooldown History"));
			assert.match(
				DurableLine("suppressed cooldown History"),
				Durable("suppressed cooldown History"),
			);
		});
		rm();
		const Capped = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0, maxNotesPerTurn: 1 }));
		await CheckAsync(Count, "E4: the per-turn cap suppresses the second History note", async () => {
			await Capped.Ready;
			Seed(Capped, "g");
			await Post(Capped, Write("g"));
			const Out = await Post(Capped, Write("g"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Capped.Lines.includes("convention-suggester: suppressed cap History"));
		});
		await CheckAsync(Count, "E4: the agent/pre-step reset releases the cap", async () => {
			await Pre(Capped, { agent: AgentOf("g"), messages: [{ role: "user" }] });
			const Out = await Post(Capped, Write("g"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.70");
			assert.ok(Capped.Lines.includes(`convention-suggester: ${Suggest}`));
		});
		await CheckAsync(Count, "E4: a pre-step whose last message is not a user message does not reset", async () => {
			await Pre(Capped, { agent: AgentOf("g"), messages: [{ role: "assistant" }] });
			const Out = await Post(Capped, Write("g"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Capped.Lines.includes("convention-suggester: suppressed cap History"));
		});
	}

	// Group E5: the block decision and the per-agent isolation.
	{
		const Run = Setup();
		await CheckAsync(Count, "E5: a block decision keeps kind and feedback and gains the note", async () => {
			await Run.Ready;
			Seed(Run, "h");
			Seed(Run, "i");
			const Out = await Post(Run, Write("h"), { kind: "block", feedback: "no", additionalContexts: [] });
			assert.equal(Out.kind, "block");
			assert.equal(Out.feedback, "no");
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.70");
		});
		await CheckAsync(Count, "E5: another agent's memory is independent", async () => {
			const Out = await Post(Run, Write("i"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.70");
		});
		await CheckAsync(Count, "E5: the ring buffer caps at eight probes", async () => {
			for (let Index = 0; Index < 9; Index++) {
				await Post(Run, { name: "write", arguments: { file_path: `random/path/file${Index}.txt` }, agent: AgentOf("j") });
			}
			const Memory = Run.State.Agents.get(AgentOf("j"));
			assert.equal(Memory.Ring.length, 8);
			assert.equal(Memory.Calls, 9);
			assert.ok(Memory.Ring[0].includes("file8.txt"));
		});
		await CheckAsync(Count, "E5: the reset listener is fail-open and returns the downstream decision", async () => {
			const Out = await Pre(Run, { agent: AgentOf("h"), messages: [{ role: "user" }] });
			assert.equal(Out, "down");
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group E6: the REAL projection path - no seeded state and no State fold.
	// The events are COMMITTED through the registry's eager drive (the unit's
	// `apply` folds them into that session's cell), the current call's own
	// `tool/call` is committed the way the harness commits it before dispatch,
	// and the judged call reads the state through `stateOf`.
	{
		const Run = Setup();
		const FoldAnchor = "Source/Function/Apply.ts";
		const FoldCompanion = "Source/Library.ts";
		const Call = (Path_: string): any => ({
			name: "write",
			arguments: { file_path: Path_ },
			agent: AgentOf("real-fold"),
		});
		await CheckAsync(Count, "E6: the committed tool/call events ARE the session history (no State fold)", async () => {
			await Run.Ready;
			assert.equal(Run.State.History, undefined);
			Commit(Run, "real-fold", FoldAnchor);
			Commit(Run, "real-fold", FoldCompanion);
			const Folded = Run.Projections.StateOf(
				AgentOf("real-fold").session,
				"conventionHistory",
			);
			assert.equal(Folded.Seq, 2);
			assert.deepEqual(
				Folded.Touches.map((Touch: any) => Touch.path),
				[FoldAnchor, FoldCompanion],
			);
		});
		await CheckAsync(Count, "E6: the judged call names the companion read from the projection state", async () => {
			Commit(Run, "real-fold", FoldAnchor);
			const Out = await Post(Run, Call(FoldAnchor), { kind: "allow", additionalContexts: [] });
			assert.equal(Out.additionalContexts.length, 1);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.65");
			const NoteText = Out.additionalContexts[0].content[0].text;
			assert.ok(NoteText.startsWith("[convention-suggester] intent=History confidence=0.65"));
			assert.ok(NoteText.includes(`- ${FoldCompanion} - touched 1 time(s) after this file`));
			assert.ok(
				Run.Lines.includes("convention-suggester: suggest History 0.65 1 candidates call write"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 1);
			assert.equal(
				Run.Projections.StateOf(AgentOf("real-fold").session, "conventionHistory").Seq,
				3,
			);
		});
	}
	return Finish(Count, "Post-Execute-And-Gate");
};

// Standalone entry: `node Target/Test/Post-Execute-And-Gate/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Post-Execute-And-Gate`);
}
