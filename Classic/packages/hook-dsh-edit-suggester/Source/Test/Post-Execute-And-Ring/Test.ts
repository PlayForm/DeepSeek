// Source/Test/Post-Execute-And-Ring/Test.ts - the listener behavior against
// the fake ctx: the emit path (the Version note prepended to the downstream
// decision's additionalContexts, with the byte-exact note text, summary and
// `suggest` ledger line in both forms), the pass-through paths (a non-judged
// tool, next() called first), the abstention paths (no-signal with the
// empty-family double-space line, low-confidence under a raised config
// threshold), the suppress paths (cooldown, dedupe, cap), the block-decision
// shape, the per-agent ring isolation, and the agent/pre-step per-turn
// reset.
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

/** The Version emit call: an edit of the root manifest. */
const VersionEdit = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: "package.json" },
	agent: AgentOf(Id),
});

/** The Config emit call: an edit of a schema variable. */
const ConfigEdit = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: "Source/Variable/Config.ts" },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group E1: the emit path.
	{
		const Run = Setup();
		await CheckAsync(Count, "E1: the Version note is prepended to the decision's additionalContexts", async () => {
			const Decision = { kind: "allow", additionalContexts: [{ id: "downstream" }] };
			const Out = await Post(Run, VersionEdit("a"), Decision);
			assert.notEqual(Out, Decision);
			assert.equal(Out.kind, "allow");
			assert.deepEqual(Out.additionalContexts[0].source, {
				kind: "edit-suggester",
				form: "notice",
				summary: "Version 0.87",
			});
			assert.equal(Out.additionalContexts[0].role, "user");
			assert.equal(typeof Out.additionalContexts[0].id, "string");
			assert.equal(Out.additionalContexts[1].id, "downstream");
			assert.equal(Object.isFrozen(Out.additionalContexts[0]), true);
		});
		await CheckAsync(Count, "E1: the note text is byte-exact", async () => {
			const Out = await Post(Run, ConfigEdit("a"), { kind: "allow", additionalContexts: [] });
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				"[edit-suggester] family=Config confidence=0.87\ncompanions (5):\n- README.md - the Config section\n- SCHEME.md - the full table\n- cordis.patch.yml - the row value\n- Source/Test/Config-And-Activation/Test.ts - the byte-exact assertion\n- Site/Source/Component/Configurator.astro - the site surface\nnote: this file rarely stands alone; check whether these need the same change.",
			);
		});
		await CheckAsync(Count, "E1: the suggest ledger line is byte-exact in both forms", async () => {
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suggest Version 0.87 7 companions package.json"));
			assert.match(
				DurableLine("suggest Version 0.87 7 companions package.json"),
				Durable("suggest Version 0.87 7 companions package.json"),
			);
			assert.equal(LedgerWith("suggest Version 0.87 7 companions package.json").length, 1);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suggest Config 0.87 5 companions Source/Variable/Config.ts"));
		});
		await CheckAsync(Count, "E1: the ring recorded the emit (cooldown, dedupe, counter)", async () => {
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.deepEqual([...Rings.cooled.keys()], ["Version", "Config"]);
			assert.equal(Rings.notes, 2);
			assert.ok(
				Rings.cooledNoted.has(
					"Version:*/Source/Function/Apply.ts|*/package.json|.github/workflows/NPM.yml|CHANGELOG.md|Documentation/Plugins/PLUGIN-FAMILY.md|Site/Source/Library/Content.ts|Site/package.json",
				),
			);
			assert.ok(Rings.touched.has("package.json"));
			assert.equal(Rings.calls, 2);
		});
	}

	// Group E2: the pass-through and next()-first paths.
	{
		const Run = Setup();
		await CheckAsync(Count, "E2: a non-judged tool returns the decision unchanged with no ledger line", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "bash", arguments: { command: "ls" }, agent: AgentOf("a") }, Decision);
			assert.equal(Out, Decision);
			assert.deepEqual(Run.Lines, ["hook-dsh-edit-suggester: activated (bundle 0.2.1, families 7, threshold 0.75)"]);
		});
		await CheckAsync(Count, "E2: next() is awaited before any judgment", async () => {
			let NextCalled = false;
			const Downstream = { kind: "allow", additionalContexts: [] };
			const Out = await Run.CtxListeners["tools/post-execute"](
				{ name: "edit", arguments: { file_path: "package.json" }, agent: AgentOf("z") },
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
		await CheckAsync(Count, "E3: a non-source path abstains no-signal with the empty-family line", async () => {
			const Decision = { kind: "allow", additionalContexts: [] };
			const Out = await Post(Run, { name: "edit", arguments: { file_path: "unrelated/deep/file.go" }, agent: AgentOf("a") }, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: abstained no-signal  0.00"));
			assert.match(DurableLine("abstained no-signal"), Durable("abstained no-signal  0.00"));
		});
		rm();
		const Raised = Make(Validate({ logFile: Ledger, enabled: true, threshold: 0.9 }));
		await CheckAsync(Count, "E3: a raised config threshold abstains low-confidence", async () => {
			const Out = await Post(Raised, VersionEdit("a"), { kind: "allow", additionalContexts: [] });
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Raised.Lines.includes("hook-dsh-edit-suggester: abstained low-confidence Version 0.87"));
			assert.ok(Raised.Lines.includes("hook-dsh-edit-suggester: activated (bundle 0.2.1, families 7, threshold 0.9)"));
		});
	}

	// Group E4: the suppress paths.
	{
		rm();
		const NoCooldown = Make(Validate({ logFile: Ledger, enabled: true, cooldownCalls: 0 }));
		await CheckAsync(Count, "E4: a zero cooldown window reaches the dedupe suppress", async () => {
			await Post(NoCooldown, VersionEdit("a"));
			const Out = await Post(NoCooldown, VersionEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(NoCooldown.Lines.includes("hook-dsh-edit-suggester: suppressed dedupe Version"));
		});
		rm();
		const Capped = Make(Validate({ logFile: Ledger, enabled: true, maxNotesPerTurn: 1 }));
		await CheckAsync(Count, "E4: the per-turn cap suppresses the second family", async () => {
			await Post(Capped, VersionEdit("a"));
			const Out = await Post(Capped, ConfigEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Capped.Lines.includes("hook-dsh-edit-suggester: suppressed cap Config"));
		});
		const Run = Setup();
		await CheckAsync(Count, "E4: the default cooldown suppresses an immediate same-family repeat", async () => {
			await Post(Run, VersionEdit("a"));
			const Out = await Post(Run, VersionEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suppressed cooldown Version"));
		});
	}

	// Group E5: the block decision and the per-agent reset.
	{
		const Run = Setup();
		await CheckAsync(Count, "E5: a block decision keeps kind and feedback and gains the note", async () => {
			const Out = await Post(Run, VersionEdit("b"), { kind: "block", feedback: "no", additionalContexts: [] });
			assert.equal(Out.kind, "block");
			assert.equal(Out.feedback, "no");
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.87");
		});
		await CheckAsync(Count, "E5: another agent's ring is independent", async () => {
			const Out = await Post(Run, VersionEdit("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.87");
		});
		await CheckAsync(Count, "E5: the agent/pre-step reset re-arms the same agent", async () => {
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			const Rings = Run.State.Rings.State(AgentOf("a"));
			assert.equal(Rings.notes, 0);
			assert.equal(Rings.calls, 0);
			assert.equal(Rings.cooled.size, 0);
			const Out = await Post(Run, VersionEdit("a"));
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.87");
		});
		await CheckAsync(Count, "E5: a pre-step without a user message does not reset", async () => {
			const Out = await Post(Run, VersionEdit("a"));
			assert.deepEqual(Out.additionalContexts, []);
			assert.ok(Run.Lines.includes("hook-dsh-edit-suggester: suppressed cooldown Version"));
			await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "assistant" } }] });
			const Out2 = await Post(Run, VersionEdit("a"));
			assert.deepEqual(Out2.additionalContexts, []);
		});
		await CheckAsync(Count, "E5: the reset listener is fail-open and returns the downstream decision", async () => {
			const Out = await Pre(Run, { agent: AgentOf("a"), messages: [{ source: { kind: "user" } }] });
			assert.equal(Out, "down");
			assert.deepEqual(Run.Warns, []);
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
