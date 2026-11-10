import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	Call,
	Check,
	CheckAsync,
	Commit,
	Finish,
	LedgerWith,
	LinesWith,
	MakeCounter,
	PreStep,
	Flip,
	Setup,
	Volatile,
} from "../Harness.js";

/**
 * @module Test
 *
 * The pipeline.
 *
 * @remarks
 *
 * Covers the HISTORY emit path (the committed session events' co-touch candidates, the byte-exact
 * note text, the summary and the `suggest History` ledger line in both forms), the REAL
 * projection path (the committed events ARE the cell, the judged call reads it, and no append
 * follows), the consistent smoke tree's clear line (the reconciliation runs first and never
 * preempts a clean call), the no-history abstention, the gate (cooldown, cap + the pre-step
 * reset), the exclusion, the note truncation, the block decision, the volatile flip, and the fs
 * purity.
 */
/**
 * Write one file under the tree (parents created).
 */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/**
 * A README with one declared count.
 */
const Counted = (Count: number): string => `# Suite\n\n## Expected count\n\n${Count} PASS.\n`;

/**
 * The ROOTED fixture: a `package.json` marker, a CONSISTENT smoke tree (one
 * counted, suite-bearing, rostered folder) so the reconciliation stays
 * silent, the anchor, and the two companions.
 */
const Rooted = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-pipeline-"));
Put(Rooted, "package.json", "{}");
const Anchor = Put(Rooted, "Source/Test/Foo/Test.ts");
Put(Rooted, "Source/Test/Foo/README.md", Counted(4));
Put(Rooted, "Target/Test/Foo/Test.js");
Put(Rooted, "README.md");
Put(Rooted, "SCHEME.md");

/**
 * The BARE fixture: a `package.json` marker and a plain file, so the reconciliation is silent.
 */
const Bare = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-no-history-"));
Put(Bare, "package.json", "{}");
const BareAnchor = Put(Bare, "Notes.md");

/**
 * The optional harness service the probe reads (the real shape: get(session)).
 */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/**
 * Seed one agent's session history through the PROJECTION drive: the anchor,
 * then the two followers, committed as `tool/call` events and folded by the
 * registered unit into that session's cell. There is no State fold to write
 * to any more, so the seed travels the same init -> apply -> stateOf path the
 * live harness drives.
 */
const Seed = (Run: any, Id: string): void => {
	Commit(Run, Id, Anchor);
	Commit(Run, Id, "README.md");
	Commit(Run, Id, "SCHEME.md");
};

/**
 * The byte-exact History note text (k = sigmoid(2.5 - 0.6) = 0.87).
 */
const HistoryText = [
	"[test-suggester] intent=History confidence=0.87",
	"targets (2):",
	"- README.md - touched 1 time(s) after this file",
	"- SCHEME.md - touched 1 time(s) after this file",
	"note: these files were touched right after this one in this workspace",
].join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group P1: the history emit path.
	{
		const Agent = AgentOf("pipeline-a");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-a");
		const Result = await Call(Run, "read", { file_path: Anchor }, Agent);
		Check(Count, "P1: the suggest line is byte-exact (logger and durable ledger)", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"test-suggester: suggest History 0.87 2 candidates call read",
			]);
			assert.equal(LedgerWith("suggest History 0.87 2 candidates call read").length, 1);
		});
		await CheckAsync(Count, "P1: the note is one labeled frozen notice naming the history companions", async () => {
			const Note = Result.additionalContexts[0];
			assert.deepEqual(Note.source, {
				kind: "test-suggester",
				form: "notice",
				summary: "History 0.87",
			});
			assert.equal(Note.role, "user");
			assert.equal(typeof Note.id, "string");
			assert.equal(Note.content[0].text, HistoryText);
			assert.equal(Object.isFrozen(Note), true);
		});
		Check(Count, "P1: the consistent smoke tree logs its clear line once and never preempts the note", () => {
			assert.deepEqual(LinesWith(Run, "reconciliation"), [
				`test-suggester: reconciliation clear ${Path.basename(Rooted)} (4 expected, 4 actual)`,
			]);
		});
	}

	// Group P2: the no-history abstention (the built-in pack is retired).
	{
		const Agent = AgentOf("pipeline-b");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await CheckAsync(Count, "P2: a rooted tree with no history and no pack abstains no-history", async () => {
			const Decision = { kind: "allow" };
			const Out = await Call(Run, "read", { file_path: BareAnchor }, Agent, Decision);
			assert.equal(Out, Decision);
			assert.ok(Run.Lines.includes("test-suggester: abstained no-history  0.00"));
			assert.equal(LedgerWith("abstained no-history  0.00").length, 1);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
		});
	}

	// Group P3: the gate and the reset (one shared agent).
	{
		const Agent = AgentOf("pipeline-c");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-c");
		await Call(Run, "read", { file_path: Anchor }, Agent);
		await Call(Run, "read", { file_path: Anchor }, Agent);
		Check(Count, "P3: a repeat within the cooldown is suppressed with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "suppressed"), [
				"test-suggester: suppressed cooldown History",
			]);
			assert.equal(LinesWith(Run, "candidates call").length, 1);
		});
		const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 });
		Capped.Context.workingDirectory = Service(Rooted);
		await Capped.Ready;
		Seed(Capped, "pipeline-c");
		await Call(Capped, "read", { file_path: Anchor }, Agent);
		await Call(Capped, "read", { file_path: Anchor }, Agent);
		Check(Count, "P3: a note beyond the per-turn cap is suppressed", () => {
			assert.deepEqual(LinesWith(Capped, "suppressed"), [
				"test-suggester: suppressed cap History",
			]);
		});
		await PreStep(Capped, Agent);
		await Call(Capped, "read", { file_path: Anchor }, Agent);
		Check(Count, "P3: a user turn resets the per-turn counter and the note emits again", () => {
			assert.equal(LinesWith(Capped, "candidates call").length, 2);
		});
	}

	// Group P4: the exclusion.
	{
		const Agent = AgentOf("pipeline-d");
		const Run = Setup({ exclude: ["README.md"] });
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-d");
		await Call(Run, "read", { file_path: Anchor }, Agent);
		Check(Count, "P4: an excluded companion is filtered, the rest suggest", () => {
			assert.deepEqual(LinesWith(Run, "candidates call"), [
				"test-suggester: suggest History 0.87 1 candidates call read",
			]);
		});
		const All = Setup({ exclude: ["README.md", "SCHEME.md"] });
		All.Context.workingDirectory = Service(Rooted);
		await All.Ready;
		Seed(All, "pipeline-d");
		await Call(All, "read", { file_path: Anchor }, Agent);
		Check(Count, "P4: a fully excluded candidate set abstains as ambiguous", () => {
			assert.deepEqual(LinesWith(All, "abstained"), [
				"test-suggester: abstained ambiguous History 0.87",
			]);
		});
	}

	// Group P5: the note truncation.
	{
		const Agent = AgentOf("pipeline-e");
		const Run = Setup({ maxNoteChars: 60 });
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-e");
		const Result = await Call(Run, "read", { file_path: Anchor }, Agent);
		Check(Count, "P5: a note longer than maxNoteChars is truncated with an ellipsis", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			assert.equal(Text.endsWith("..."), true);
			assert.equal(Text.length, 62);
		});
	}

	// Group P6: the block decision.
	{
		const Agent = AgentOf("pipeline-f");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-f");
		const Downstream = { kind: "block", feedback: "no", additionalContexts: [{ marker: "x" }] };
		const Result = await Call(Run, "read", { file_path: Anchor }, Agent, Downstream);
		Check(Count, "P6: a block decision keeps its feedback and prepends the note", () => {
			assert.equal(Result.kind, "block");
			assert.equal(Result.feedback, "no");
			assert.equal(Result.additionalContexts.length, 2);
			assert.equal(Result.additionalContexts[0].source.kind, "test-suggester");
			assert.equal(Result.additionalContexts[1], Downstream.additionalContexts[0]);
		});
	}

	// Group P7: the volatile flip.
	{
		const Agent = AgentOf("pipeline-g");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-g");
		Flip(Volatile(Run, "enabled"), false);
		Run.CtxListeners["loader/volatile-update"]([["enabled"]]);
		const Result = await Call(Run, "read", { file_path: Anchor }, Agent);
		Check(Count, "P7: after the flip every call passes through unchanged", () => {
			assert.equal(Run.State.On, false);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
			assert.equal(Result.kind, "allow");
		});
	}

	// Group P8: the fs purity across the full scenario.
	{
		const Agent = AgentOf("pipeline-h");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		Seed(Run, "pipeline-h");
		await Call(Run, "read", { file_path: Anchor }, Agent);
		await Call(Run, "grep", { pattern: "expected count", query: "badge" }, Agent);
		Check(Count, "P8: the full scenario performs ZERO fs operations", () => {
			assert.equal(Run.Fs.reads.length, 0);
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.resolved.length, 0);
			assert.equal(Run.Fs.stats.length, 0);
		});
	}

	// Group P9: the REAL projection path - the committed events ARE the cell,
	// the judged call reads it through `stateOf`, and nothing is appended
	// after the call (the current call's own `tool/call` is committed before
	// dispatch, the way the harness commits it).
	{
		const Id = "pipeline-i";
		const Run = Setup();
		Run.Context.workingDirectory = Service(Rooted);
		await Run.Ready;
		await CheckAsync(Count, "P9: the committed tool/call events ARE the session cell (no State fold)", async () => {
			assert.equal(Run.State.History, undefined);
			Commit(Run, Id, Anchor);
			Commit(Run, Id, "README.md");
			const Folded = Run.Projections.StateOf(AgentOf(Id).session, "testHistory");
			assert.equal(Folded.Seq, 2);
			assert.deepEqual(
				Folded.Touches.map((Touch: any) => Touch.path),
				[Anchor, "README.md"],
			);
		});
		await CheckAsync(Count, "P9: the judged call reads the cell and leaves it unappended", async () => {
			Commit(Run, Id, Anchor);
			const Out = await Call(Run, "read", { file_path: Anchor }, AgentOf(Id));
			assert.equal(Out.additionalContexts[0].source.summary, "History 0.87");
			assert.equal(Run.Projections.StateOf(AgentOf(Id).session, "testHistory").Seq, 3);
		});
	}
	return Finish(Count, "Pipeline-And-Gates");
};

// Standalone entry: `node Target/Test/Pipeline-And-Gates/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Pipeline-And-Gates`);
}
