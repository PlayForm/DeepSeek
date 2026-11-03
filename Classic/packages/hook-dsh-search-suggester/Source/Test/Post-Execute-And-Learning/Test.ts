// Source/Test/Post-Execute-And-Learning/Test.ts - the listener behavior
// against the fake ctx: the emit path (the History note prepended to the
// downstream decision's additionalContexts, with the byte-exact note text,
// summary and `suggest` ledger line in both forms), the pass-through paths
// (a non-judged tool, a bash call with no path, next() called first), the
// no-history abstention, the learning loop (the `followed` and `ignored`
// ledger lines, the knowledge file, the pending window), the suppress paths
// (dedupe under a zero cooldown, cap), the per-agent ring isolation, the
// agent/pre-step per-turn reset, and the projection path itself (the committed
// `tool/call` events are the cell, the judged call reads it through `stateOf`,
// and the call appends nothing).
//
// THE CANDIDATES COME FROM THE SESSION HISTORY: every emit scenario mounts a
// temp workspace, commits the session's `tool/call` events through the fake
// `sessionProjections` registry (`SeedHistory` -> `Commit`), and judges a call
// whose path is the workspace's ABSOLUTE anchor - no built-in pack literal is
// named anywhere. The last group proves the projection path itself: the
// committed events ARE the cell, the judged call reads it through `stateOf`,
// and the call appends nothing to it.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import {
	AgentOf,
	CheckAsync,
	Commit,
	Durable,
	DurableLine,
	Finish,
	Knowledge,
	Ledger,
	LedgerWith,
	Make,
	MakeCounter,
	Pre,
	Post,
	rm,
	SeedHistory,
	Service,
	Setup,
	Validate,
	Workspace,
} from "../Harness.js";

/** The judged call's anchor path (relative to the temp workspace). */
const Anchor = "README.md";

/** The two companions touched right after the anchor (Adjacent's order). */
const Companions = ["CHANGELOG.md", "SCHEME.md"];

/** The temp workspace the scenarios judge. */
const Space = Workspace([Anchor, ...Companions]);

/** One judged read of the anchor. */
const Read = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Space.At(Anchor) },
	agent: AgentOf(Id),
});

/** One judged call whose anchor has no history (it only ages the window). */
const Elsewhere = (Id: string, N: string): any => ({
	name: "grep",
	arguments: { pattern: `unrelated query ${N}`, path: Space.At("package.json") },
	agent: AgentOf(Id),
});

/** The learning-only call: an edit of a companion path. */
const FollowEdit = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: "CHANGELOG.md" },
	agent: AgentOf(Id),
});

/** The byte-exact History note text (k = sigmoid(2.5 - 0.6) = 0.87). */
const HistoryText = [
	"[search-suggester] intent=History confidence=0.87",
	"targets (2):",
	"- CHANGELOG.md - touched 1 time(s) after a similar call",
	"- SCHEME.md - touched 1 time(s) after a similar call",
	"note: open these before more searches; Target/ is generated, never edit it.",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the emit path.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
		const Out = await Post(Run, Read("a"), Decision);
		await CheckAsync(Count, "E1: the History note is prepended to the decision's additionalContexts", async () => {
			assert.notEqual(Out, Decision);
			assert.equal(Out.kind, "allow");
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "search-suggester",
				form: "notice",
				summary: "History 0.87",
			});
			assert.equal(Out.additionalContexts[0].role, "user");
			assert.equal(typeof Out.additionalContexts[0].id, "string");
			assert.equal(Out.additionalContexts[1].id, "downstream");
			assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
		});
		await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"));
			assert.match(
				DurableLine("suggest History 0.87 2 candidates"),
				Durable("suggest History 0.87 2 candidates"),
			);
			assert.equal(LedgerWith("suggest History 0.87 2 candidates").length, 1);
		});
		await CheckAsync(Count, "E1: the ring recorded the emit (cooldown, recent, pending, counter)", async () => {
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.deepEqual([...Rings.cooled.keys()], ["History"]);
			assert.deepEqual([...Rings.recent.keys()], ["CHANGELOG.md", "SCHEME.md"]);
			assert.deepEqual(Rings.pending, { intent: "History", since: 0 });
			assert.equal(Rings.notes, 1);
			assert.equal(Rings.calls, 1);
			assert.equal(Run.State.Knowledge.stats.emitted, 1);
		});
	}

	// Group E2: the pass-through and next()-first paths.
	{
		const Run = Setup();
		await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "webfetch", arguments: { url: "https://example.com" }, agent: AgentOf("a") }, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Run.Lines, [`hook-dsh-search-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`]);
		});
		await CheckAsync(Count, "E2: a bash call with no path and no cwd abstains foreign-workspace", async () => {
			const Out = await Post(Run, { name: "bash", arguments: { command: "npm version 1.2.3" }, agent: AgentOf("a") }, { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained foreign-workspace  0.00"));
		});
		await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
			const Judge = Setup();
			Judge.Context.workingDirectory = Service(Space.Root);
			SeedHistory(Judge, "z", Space.At(Anchor), Companions);
			let NextCalled = false;
			const Downstream = { kind: "allow", additionalContexts: [] };
			const Out = await Judge.CtxListeners["tools/post-execute"](
				Read("z"),
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

	// Group E3: the no-history abstention.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		await CheckAsync(Count, "E3: a judged call with no history abstains no-history", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, Elsewhere("a", "one"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"));
			assert.match(DurableLine("abstained no-history"), Durable("abstained no-history  0.00"));
		});
	}

	// Group E4: the learning loop.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Run, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "E4: an edit of a companion records `followed` and saves the knowledge", async () => {
			await Post(Run, Read("a"));
			await Post(Run, FollowEdit("a"));
			assert.ok(Run.Lines.includes("hook-dsh-search-suggester: followed History CHANGELOG.md"));
			assert.match(
				DurableLine("followed History CHANGELOG.md"),
				Durable("followed History CHANGELOG.md"),
			);
			assert.equal(Run.State.Knowledge.stats.followed, 1);
			assert.equal(Run.State.Knowledge.stats.emitted, 1);
			assert.equal(Run.State.Rings.State(AgentOf("a")).pending, undefined);
			assert.equal(FileSystem.existsSync(Knowledge), true);
		});
		const Reload = Make(Validate({ logFile: Ledger, enabled: true }));
		await CheckAsync(Count, "E4: the knowledge reloads from the saved file", async () => {
			assert.deepEqual(Reload.State.Knowledge.stats, { emitted: 1, followed: 1, ignored: 0, dismissed: 0 });
		});
		rm();
		const Loop = Make(Validate({ logFile: Ledger, enabled: true }));
		Loop.Context.workingDirectory = Service(Space.Root);
		SeedHistory(Loop, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "E4: a window closed untouched records `ignored`", async () => {
			await Post(Loop, Read("a"));
			await Post(Loop, Elsewhere("a", "one"));
			await Post(Loop, Elsewhere("a", "two"));
			await Post(Loop, Elsewhere("a", "three"));
			assert.ok(Loop.Lines.includes("hook-dsh-search-suggester: ignored History"));
			assert.match(DurableLine("ignored History"), Durable("ignored History"));
			assert.equal(Loop.State.Knowledge.stats.ignored, 1);
			assert.equal(Loop.State.Rings.State(AgentOf("a")).pending, undefined);
		});
	}

	// Group E5: the suppress paths and the per-agent reset.
	{
		rm();
		const NoCooldown = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
		NoCooldown.Context.workingDirectory = Service(Space.Root);
		SeedHistory(NoCooldown, "a", Space.At(Anchor), Companions);
		await CheckAsync(Count, "E5: a zero cooldown window reaches the dedupe suppress", async () => {
			await Post(NoCooldown, Read("a"));
			const Out = await Post(NoCooldown, Read("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(NoCooldown.Lines.includes("hook-dsh-search-suggester: suppressed dedupe History"));
		});
		rm();
		const Capped = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0, maxNotesPerTurn: 1 }));
		Capped.Context.workingDirectory = Service(Space.Root);
		// One session history with two anchors: the first call's candidate set
		// and the second call's differ, so the second reaches the cap (not the
		// dedupe). The events are committed through the projection drive.
		Commit(Capped, "a", Space.At(Anchor));
		Commit(Capped, "a", "CHANGELOG.md");
		Commit(Capped, "a", Space.At("package.json"));
		Commit(Capped, "a", "SCHEME.md");
		await CheckAsync(Count, "E5: the per-turn cap suppresses the second note", async () => {
			await Post(Capped, Read("a"));
			const Out = await Post(Capped, {
				name: "read",
				arguments: { file_path: Space.At("package.json") },
				agent: AgentOf("a"),
			}, { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Capped.Lines.includes("hook-dsh-search-suggester: suppressed cap History"));
		});
		await CheckAsync(Count, "E5: the agent/pre-step reset re-arms the same agent", async () => {
			await Pre(Capped, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			const Rings = Capped.State.Rings.State(AgentOf("a"));
			assert.equal(Rings.notes, 0);
			assert.equal(Rings.calls, 0);
			assert.equal(Rings.cooled.size, 0);
			const Out = await Post(Capped, Read("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "E5: another agent's ring is independent and the reset returns downstream", async () => {
			SeedHistory(Capped, "c", Space.At(Anchor), Companions);
			const Out = await Post(Capped, Read("c"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			const Down = await Pre(Capped, { agent: AgentOf("c"), messages: [{ source: { kind: "user" } }] });
			assert.equal(Down, "down");
			assert.deepEqual(Capped.Warns, []);
		});
	}
	// Group E6: the REAL projection path - no seeded state and no State fold.
	// The events are COMMITTED through the registry's eager drive (the unit's
	// `apply` folds them into that session's cell), the judged call's own
	// `tool/call` is committed the way the harness commits it before dispatch,
	// and the judged call reads that state through `stateOf`.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Space.Root);
		const FoldAnchor = Space.At(Anchor);
		const FoldCompanion = "CHANGELOG.md";
		await CheckAsync(Count, "E6: the committed tool/call events ARE the session history (no State fold)", async () => {
			await Run.Ready;
			assert.equal(Run.State.History, undefined);
			Commit(Run, "real-fold", FoldAnchor);
			Commit(Run, "real-fold", FoldCompanion);
			const Folded = Run.Projections.StateOf(AgentOf("real-fold").session, "searchHistory");
			assert.equal(Folded.Seq, 2);
			assert.deepEqual(
				Folded.Touches.map((Touch: any) => Touch.path),
				[FoldAnchor, FoldCompanion],
			);
		});
		await CheckAsync(Count, "E6: the judged call reads the cell and appends nothing", async () => {
			Commit(Run, "real-fold", FoldAnchor);
			const Out = await Post(Run, Read("real-fold"), { kind: "allow", additionalContexts: [] });
			assert.equal(Out.additionalContexts.length, 1);
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.ok(
				Out.additionalContexts[0].content[0].text.includes(
					`- ${FoldCompanion} - touched 1 time(s) after a similar call`,
				),
			);
			assert.ok(
				Run.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 1 candidates"),
			);
			assert.equal(Run.Lines.filter((Line: string) => Line.includes(": suggest ")).length, 1);
			// NO POST-EXECUTE APPEND: the cell still carries exactly the three
			// committed events, the judged call added nothing.
			assert.equal(
				Run.Projections.StateOf(AgentOf("real-fold").session, "searchHistory").Seq,
				3,
			);
		});
	}
	return Finish(Count, "Post-Execute-And-Learning");
};

// Standalone entry: `node Target/Test/Post-Execute-And-Learning/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Post-Execute-And-Learning`);
}
