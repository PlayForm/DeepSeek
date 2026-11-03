// Source/Test/Post-Execute-And-Ring/Test.ts - the listener behavior against
// the fake ctx: the History emit path (the session's co-touch candidates
// committed through the projection drive, the byte-exact note text, summary
// and `suggest History` ledger line in both forms), the REAL projection path
// (committed `tool/call` events folded by the registered unit and read back
// through `stateOf`), the pass-through paths (a non-judged tool, next()
// called first), the abstention paths (no-history with the empty-family
// double-space line, low-confidence under a raised config threshold), the
// suppress paths (cooldown, dedupe, cap), the block-decision shape, the
// per-agent ring isolation, and the agent/pre-step per-turn reset.
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

/** The judged call's edit path (the history anchor). */
const Anchor = "Source/Variable/Config.ts";

/** The two companions touched right after the anchor. */
const Companions = ["README.md", "SCHEME.md"];

/** One judged edit of the anchor. */
const ConfigEdit = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: Anchor },
	agent: AgentOf(Id),
});

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

/** The byte-exact History note text (k = sigmoid(2.5 - 0.6) = 0.87). */
const HistoryText = [
	"[edit-suggester] family=History confidence=0.87",
	"companions (2):",
	"- README.md - touched 1 time(s) after this file",
	"- SCHEME.md - touched 1 time(s) after this file",
	"note: this file rarely stands alone; check whether these need the same change.",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the emit path (the history candidates).
	{
		const Run = Setup();
		await CheckAsync(Count, "E1: the History note is prepended to the decision's additionalContexts", async () => {
			await Run.Ready;
			Seed(Run, "a");
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, ConfigEdit("a"), Decision);
			assert.notEqual(Out, Decision);
			assert.equal(Out.kind, "allow");
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "edit-suggester",
				form: "notice",
				summary: "History 0.87",
			});
			assert.equal(Out.additionalContexts[0].role, "user");
			assert.equal(typeof Out.additionalContexts[0].id, "string");
			assert.equal(Out.additionalContexts[1].id, "downstream");
			assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
		});
		await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
			Seed(Run, "t");
			const Out = await Post(Run, ConfigEdit("t"), { kind: "allow", additionalContexts: [] });
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
			assert.ok(Run.Lines.includes(`hook-dsh-edit-suggester: suggest History 0.87 2 companions ${Anchor}`));
			assert.match(
				DurableLine(`suggest History 0.87 2 companions ${Anchor}`),
				Durable(`suggest History 0.87 2 companions ${Anchor}`),
			);
			assert.equal(LedgerWith(`suggest History 0.87 2 companions ${Anchor}`).length, 2);
		});
		await CheckAsync(Count, "E1: the ring recorded the emit (cooldown, dedupe, counter)", async () => {
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.deepEqual([...Rings.cooled.keys()], ["History"]);
			assert.equal(Rings.notes, 1);
			assert.ok(Rings.cooledNoted.has("History:README.md|SCHEME.md"));
			assert.ok(Rings.touched.has(Anchor));
			assert.equal(Rings.calls, 1);
		});
	}

	// Group E2: the pass-through and next()-first paths.
	{
		const Run = Setup();
		await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "bash", arguments: { command: "ls" }, agent: AgentOf("a") }, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Run.Lines, [`hook-dsh-edit-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`]);
		});
		await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
			await Run.Ready;
			Seed(Run, "z");
			let NextCalled = false;
			const Downstream = { kind: "allow", additionalContexts: [] };
			const Out = await Run.CtxListeners["tools/post-execute"](
				ConfigEdit("z"),
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

	// Group E3: the abstention paths.
	{
		const Run = Setup();
		await CheckAsync(Count, "E3: a judged call with no history and no pack abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, ConfigEdit("a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained no-history  0.00"));
			assert.match(DurableLine("abstained no-history"), Durable("abstained no-history  0.00"));
		});
		rm();
		const Raised = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
		await CheckAsync(Count, "E3: a raised config threshold abstains low-confidence", async () => {
			await Raised.Ready;
			Seed(Raised, "a");
			const Out = await Post(Raised, ConfigEdit("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Raised.Lines.includes("hook-dsh-edit-suggester: abstained low-confidence History 0.87"));
			assert.ok(Raised.Lines.includes(`hook-dsh-edit-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.9)`));
		});
	}

	// Group E4: the suppress paths.
	{
		rm();
		const NoCooldown = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
		await CheckAsync(Count, "E4: a zero cooldown window reaches the dedupe suppress", async () => {
			await NoCooldown.Ready;
			Seed(NoCooldown, "a");
			await Post(NoCooldown, ConfigEdit("a"));
			const Out = await Post(NoCooldown, ConfigEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(NoCooldown.Lines.includes("hook-dsh-edit-suggester: suppressed dedupe History"));
		});
		rm();
		const Capped = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 0 }));
		await CheckAsync(Count, "E4: the per-turn cap suppresses the would-be note", async () => {
			await Capped.Ready;
			Seed(Capped, "a");
			const Out = await Post(Capped, ConfigEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Capped.Lines.includes("hook-dsh-edit-suggester: suppressed cap History"));
		});
		const Run = Setup();
		await CheckAsync(Count, "E4: the default cooldown suppresses an immediate same-family repeat", async () => {
			await Run.Ready;
			Seed(Run, "a");
			await Post(Run, ConfigEdit("a"));
			const Out = await Post(Run, ConfigEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suppressed cooldown History"));
		});
	}

	// Group E5: the block decision and the per-agent reset.
	{
		const Run = Setup();
		await CheckAsync(Count, "E5: a block decision keeps kind and feedback and gains the note", async () => {
			await Run.Ready;
			Seed(Run, "b");
			const Out = await Post(Run, ConfigEdit("b"), { kind: "block", feedback: "no", additionalContexts: [] });
			assert.equal(Out.kind, "block");
			assert.equal(Out.feedback, "no");
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "E5: another agent's ring is independent", async () => {
			Seed(Run, "a");
			const Out = await Post(Run, ConfigEdit("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "E5: the agent/pre-step reset re-arms the same agent", async () => {
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.equal(Rings.notes, 0);
			assert.equal(Rings.calls, 0);
			assert.equal(Rings.cooled.size, 0);
			const Out = await Post(Run, ConfigEdit("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "E5: a pre-step without a user message does not reset", async () => {
			const Out = await Post(Run, ConfigEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suppressed cooldown History"));
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "assistant" } }] });
			const Out2 = await Post(Run, ConfigEdit("a"));
			assert.deepEqual(Out2.additionalContexts, []);
		});
		await CheckAsync(Count, "E5: the reset listener is fail-open and returns the downstream decision", async () => {
			const Out = await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
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
		const FoldCompanion = "README.md";
		await CheckAsync(Count, "E6: the committed tool/call events ARE the session history (no State fold)", async () => {
			await Run.Ready;
			assert.equal(Run.State.History, undefined);
			Commit(Run, "real-fold", Anchor);
			Commit(Run, "real-fold", FoldCompanion);
			Commit(Run, "real-fold", Anchor);
			const Folded = Run.Projections.StateOf(
				AgentOf("real-fold").session,
				"editHistory",
			);
			assert.equal(Folded.Seq, 3);
			assert.deepEqual(
				Folded.Touches.map((Touch: any) => Touch.path),
				[Anchor, FoldCompanion, Anchor],
			);
			const Out = await Post(Run, ConfigEdit("real-fold"), {
				kind: "allow",
				additionalContexts: [],
			});
			assert.equal(Out.additionalContexts.length, 1);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			const NoteText = Out.additionalContexts[0].content[0].text;
			assert.ok(NoteText.includes(`- ${FoldCompanion} - touched 1 time(s) after this file`));
			assert.ok(
				Run.Lines.includes(
					`hook-dsh-edit-suggester: suggest History 0.87 1 companions ${Anchor}`,
				),
			);
			assert.equal(
				Run.Projections.StateOf(AgentOf("real-fold").session, "editHistory").Seq,
				3,
			);
		});
	}
	return Finish(Count, "Post-Execute-And-Ring");
};

// Standalone entry: `node Target/Test/Post-Execute-And-Ring/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Post-Execute-And-Ring`);
}
