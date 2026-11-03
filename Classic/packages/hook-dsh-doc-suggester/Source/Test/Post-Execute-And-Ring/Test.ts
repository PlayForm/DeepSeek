// Source/Test/Post-Execute-And-Ring/Test.ts - the listener behavior against
// the fake ctx: the History emit path (the seeded session history's co-touch
// candidates, the byte-exact note text, summary and `suggest History` ledger
// line in both forms), the REAL fold (three judged calls feed the history
// through tools/post-execute, and the third emits the note), the pass-through
// paths (a non-judged tool, next() called first), the abstention paths
// (no-history with the empty-family double-space line, low-confidence under a
// raised config threshold), the suppress paths (cooldown, dedupe, cap), the
// block-decision shape, the per-agent ring isolation, and the agent/pre-step
// per-turn reset.
import assert from "node:assert/strict";
import {
	AgentOf,
	CheckAsync,
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

/** The judged call's doc path (the history anchor). */
const Anchor = "Documentation/Plans/POC-LEDGER.md";

/** The two companions touched right after the anchor. */
const Companions = ["README.md", "package.json"];

/** One judged read of the anchor. */
const PlanRead = (Id: string): any => ({
	name: "read",
	arguments: { file_path: Anchor },
	agent: AgentOf(Id),
});

/**
 * Seed one agent's session history through the state probe: the anchor, then
 * the two followers (the tools/post-execute fold's shape).
 */
const Seed = (Run: any, Id: string): void => {
	Run.State.History.set(AgentOf(Id), {
		Seq: 3,
		Touches: [Anchor, ...Companions].map((Path: string, Seq: number) => ({
			seq: Seq,
			path: Path,
			tool: "read",
		})),
	});
};

/** The byte-exact History note text (k = sigmoid(2.5 - 0.6) = 0.87). */
const HistoryText = [
	"[doc-suggester] family=History confidence=0.87",
	"companions (2):",
	"- README.md - touched 1 time(s) after this file",
	"- package.json - touched 1 time(s) after this file",
	"note: a documentation task rarely touches one file; keep the doc graph coherent.",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the emit path (the history candidates).
	{
		const Run = Setup();
		Seed(Run, "a");
		await CheckAsync(Count, "E1: the History note is prepended to the decision's additionalContexts", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, PlanRead("a"), Decision);
			assert.notEqual(Out, Decision);
			assert.equal(Out.kind, "allow");
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "doc-suggester",
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
			const Out = await Post(Run, PlanRead("t"), { kind: "allow", additionalContexts: [] });
			assert.equal(Out.additionalContexts[0].content[0].text, HistoryText);
		});
		await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
			assert.ok(Run.Lines.includes(`hook-dsh-doc-suggester: suggest History 0.87 2 companions ${Anchor}`));
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
			assert.ok(Rings.cooledNoted.has("History:README.md|package.json"));
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
			assert.deepEqual(Run.Lines, [`hook-dsh-doc-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.75)`]);
		});
		await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
			Seed(Run, "z");
			let NextCalled = false;
			const Downstream = { kind: "allow", additionalContexts: [] };
			const Out = await Run.CtxListeners["tools/post-execute"](
				PlanRead("z"),
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
			const Out = await Post(Run, PlanRead("a"), Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-doc-suggester: abstained no-history  0.00"));
			assert.match(DurableLine("abstained no-history"), Durable("abstained no-history  0.00"));
		});
		rm();
		const Raised = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
		Seed(Raised, "a");
		await CheckAsync(Count, "E3: a raised config threshold abstains low-confidence", async () => {
			const Out = await Post(Raised, PlanRead("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Raised.Lines.includes("hook-dsh-doc-suggester: abstained low-confidence History 0.87"));
			assert.ok(Raised.Lines.includes(`hook-dsh-doc-suggester: activated (bundle ${process.env.VERSION_PACKAGE}, history, threshold 0.9)`));
		});
	}

	// Group E4: the suppress paths.
	{
		rm();
		const NoCooldown = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
		Seed(NoCooldown, "a");
		await CheckAsync(Count, "E4: a zero cooldown window reaches the dedupe suppress", async () => {
			await Post(NoCooldown, PlanRead("a"));
			const Out = await Post(NoCooldown, PlanRead("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(NoCooldown.Lines.includes("hook-dsh-doc-suggester: suppressed dedupe History"));
		});
		rm();
		const Capped = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 0 }));
		Seed(Capped, "a");
		await CheckAsync(Count, "E4: the per-turn cap suppresses the would-be note", async () => {
			const Out = await Post(Capped, PlanRead("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Capped.Lines.includes("hook-dsh-doc-suggester: suppressed cap History"));
		});
		const Run = Setup();
		Seed(Run, "a");
		await CheckAsync(Count, "E4: the default cooldown suppresses an immediate same-family repeat", async () => {
			await Post(Run, PlanRead("a"));
			const Out = await Post(Run, PlanRead("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-doc-suggester: suppressed cooldown History"));
		});
	}

	// Group E5: the block decision and the per-agent reset.
	{
		const Run = Setup();
		Seed(Run, "b");
		await CheckAsync(Count, "E5: a block decision keeps kind and feedback and gains the note", async () => {
			const Out = await Post(Run, PlanRead("b"), { kind: "block", feedback: "no", additionalContexts: [] });
			assert.equal(Out.kind, "block");
			assert.equal(Out.feedback, "no");
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		Seed(Run, "a");
		await CheckAsync(Count, "E5: another agent's ring is independent", async () => {
			const Out = await Post(Run, PlanRead("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "E5: the agent/pre-step reset re-arms the same agent", async () => {
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.equal(Rings.notes, 0);
			assert.equal(Rings.calls, 0);
			assert.equal(Rings.cooled.size, 0);
			const Out = await Post(Run, PlanRead("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
		});
		await CheckAsync(Count, "E5: a pre-step without a user message does not reset", async () => {
			const Out = await Post(Run, PlanRead("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-doc-suggester: suppressed cooldown History"));
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "assistant" } }] });
			const Out2 = await Post(Run, PlanRead("a"));
			assert.deepEqual(Out2.additionalContexts, []);
		});
		await CheckAsync(Count, "E5: the reset listener is fail-open and returns the downstream decision", async () => {
			const Out = await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			assert.equal(Out, "down");
			assert.deepEqual(Run.Warns, []);
		});
	}

	// Group E6: the REAL fold (tools/post-execute feeds the history).
	{
		const Run = Setup();
		/** One judged read: the call the fold appends. */
		const Call = (Path_: string, Id: string): any => ({
			name: "read",
			arguments: { file_path: Path_ },
			agent: AgentOf(Id),
		});
		await CheckAsync(
			Count,
			"E6: three judged calls fold the history and the third emits the History note",
			async () => {
				// The anchor, then the companion, then the anchor again: every
				// call joins the history (reads included), so the third call
				// sees the companion as the path touched right after the anchor.
				await Post(Run, Call(Anchor, "fold"));
				await Post(Run, Call("README.md", "fold"));
				// The turn boundary clears the already-touched set; the history
				// survives it.
				await Pre(Run, { agent: AgentOf("fold"), messages: [{ source: { kind: "user" } }] });
				const Out = await Post(Run, Call(Anchor, "fold"));
				assert.equal(Out.additionalContexts.length, 1);
				assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
				assert.equal(
					Out.additionalContexts[0].content[0].text,
					[
						"[doc-suggester] family=History confidence=0.87",
						"companions (1):",
						"- README.md - touched 1 time(s) after this file",
						"note: a documentation task rarely touches one file; keep the doc graph coherent.",
					].join("\n"),
				);
				assert.ok(
					Run.Lines.includes(
						`hook-dsh-doc-suggester: suggest History 0.87 1 companions ${Anchor}`,
					),
				);
				assert.ok(
					Run.Lines.includes(
						"hook-dsh-doc-suggester: decided History 0.87 1 companions README.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.25,literal=0.25,history=0.15,accept=0.00 store=memory",
					),
				);
			},
		);
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
