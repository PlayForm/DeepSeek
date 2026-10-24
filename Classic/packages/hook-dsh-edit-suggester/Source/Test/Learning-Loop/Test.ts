// Source/Test/Learning-Loop/Test.ts - the D8 learning loop against the fake
// ctx, REAL temp workspaces and the REAL pattern service:
//
//   L1: a note -> touching a named companion records the ACCEPT for that
//       companion and its family -> the next call's rank and score rise;
//   L2: a note -> the window closes untouched -> the soft REJECT -> the
//       companions' rate and the next note's score fall;
//   L3: the PICKABLE heuristics: disabling one drops it from the enabled
//       list, the weights and the score; a raised weight raises the score,
//       and the `decided` ledger line carries the table byte-exactly;
//   L4: no store -> the bounded memory fallback answers the neutral 1/3, so
//       the default score is the PoC's;
//   L5: the pattern service stores the decision record (weights, enabled
//       list, pending outcome) and the learned rates; the accept fills the
//       outcome, and a reopen through the KV store reads the rate back and
//       reproduces the same weights.
//
// NO SLEEPS: the window is counted in judged calls, and the pattern service's
// Flush/Save are awaited (its documented seams) before the reopen.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	AgentOf,
	CheckAsync,
	FakeStorage,
	Finish,
	Ledger,
	Make,
	MakeCounter,
	Pattern,
	Post,
	Pre,
	rm,
	Setup,
	Validate,
} from "../Harness.js";

/** The neutral rate (the Laplace prior with zero observations). */
const Neutral = 1 / 3;

/** The pattern service's documented accept move. */
const AcceptBonus = 0.1;

/** The pattern service's documented reject move. */
const RejectPenalty = 0.2;

/** A temp tree under the OS temp dir (fresh per folder process). */
const Tree = (Prefix: string): string => FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));

/** Write one file under the tree (parents created). */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/**
 * The learning workspace: a pack with TWO companions of EQUAL prior, so the
 * learned history is the only thing that can order them (the rank proof).
 */
const Pack = `signature:
  - docs/STYLE.md
families:
  "edit/Version":
    id: Version
    priority: 1
    threshold: 0.85
    signals:
      - rule: manifest
        pattern: '(^|/)package\\.json$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 0.6
        reason: the style
      - path: docs/CHANGELOG.md
        kind: doc
        prior: 0.6
        reason: the changelog
`;

/** The workspace: the pack, its signature (a companion too) and the trigger. */
const Workspace = Tree("edit-suggester-learning-");
Put(Workspace, ".dsh/pack.yml", Pack);
Put(Workspace, "docs/STYLE.md");
const Changelog = Put(Workspace, "docs/CHANGELOG.md");
const Manifest = Put(Workspace, "package.json");

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The note text of the two equal-prior companions, in pack order. */
const NoteOrder = (Head: string): string =>
	`[edit-suggester] family=Version confidence=0.87\ncompanions (2):\n- ${Head} - ${Head === "docs/STYLE.md" ? "the style" : "the changelog"}\n- ${Head === "docs/STYLE.md" ? "docs/CHANGELOG.md - the changelog" : "docs/STYLE.md - the style"}\nnote: this file rarely stands alone; check whether these need the same change.`;

/** The judged manifest edit (the note trigger). */
const Emit = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: Manifest },
	agent: AgentOf(Id),
});

/** The judged companion touch (the follow signal). */
const Touch = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: Changelog },
	agent: AgentOf(Id),
});

/** The judged non-family call (it only ages the window). */
const Age = (Id: string): any => ({
	name: "edit",
	arguments: { file_path: "unrelated/deep/file.go" },
	agent: AgentOf(Id),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group L1: the accept raises the rank.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Workspace);
		await CheckAsync(Count, "L1: the note is byte-exact and records a pending decision", async () => {
			const Out = await Post(Run, Emit("learn-a"));
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				NoteOrder("docs/STYLE.md"),
			);
			const Last = Run.State.Last;
			assert.equal(Last.family, "Version");
			assert.equal(Last.outcome, "pending");
			assert.equal(Last.store, "memory");
			assert.equal(Last.companions.length, 2);
			assert.equal(Last.companions[0].path, "docs/STYLE.md");
			assert.ok(Math.abs(Last.companions[0].heuristics.history - Neutral) < 1e-9);
			assert.ok(Math.abs(Last.companions[0].score - 0.675) < 1e-9);
			assert.deepEqual(Last.enabled, [
				"scope",
				"graph",
				"prior",
				"literal",
				"history",
				"accept",
			]);
			assert.ok(
				Run.Lines.includes(
					"hook-dsh-edit-suggester: decided Version 0.87 2 companions docs/STYLE.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.25,literal=0.25,history=0.15,accept=0.00 store=memory",
				),
			);
		});
		await CheckAsync(Count, "L1: touching a companion records the accept for it and its family", async () => {
			await Post(Run, Touch("learn-a"));
			assert.ok(
				Run.Lines.includes("hook-dsh-edit-suggester: accepted Version docs/CHANGELOG.md"),
			);
			assert.ok(
				Math.abs(
					Run.State.Learning.Rate("Version", "docs/CHANGELOG.md").Companion -
						(Neutral + AcceptBonus),
				) < 1e-9,
			);
			assert.ok(
				Math.abs(Run.State.Learning.Rate("Version", "").Family - (Neutral + AcceptBonus)) <
					1e-9,
			);
			assert.equal(Run.State.Last.outcome, "accepted");
		});
		await CheckAsync(Count, "L1: the next call ranks the accepted companion first and its score rises", async () => {
			await Pre(Run, { agent: AgentOf("learn-a"), messages: [{ source: { kind: "user" } }] });
			const Out = await Post(Run, Emit("learn-a"));
			assert.equal(
				Out.additionalContexts[0].content[0].text,
				NoteOrder("docs/CHANGELOG.md"),
			);
			assert.equal(Run.State.Last.companions[0].path, "docs/CHANGELOG.md");
			assert.ok(Run.State.Last.companions[0].score > 0.675);
			assert.ok(
				Math.abs(Run.State.Last.companions[0].heuristics.history - (Neutral + AcceptBonus)) <
					1e-9,
			);
		});
	}

	// Group L2: the soft reject lowers the rate.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Workspace);
		await CheckAsync(Count, "L2: a window that closes untouched records the soft reject", async () => {
			await Post(Run, Emit("learn-b"));
			const First = Run.State.Last.companions[0].score;
			await Post(Run, Age("learn-b"));
			await Post(Run, Age("learn-b"));
			assert.equal(
				Run.Lines.includes("hook-dsh-edit-suggester: rejected Version 2 companions"),
				false,
			);
			await Post(Run, Age("learn-b"));
			assert.ok(
				Run.Lines.includes("hook-dsh-edit-suggester: rejected Version 2 companions"),
			);
			assert.ok(
				Math.abs(
					Run.State.Learning.Rate("Version", "docs/STYLE.md").Companion -
						(Neutral - RejectPenalty),
				) < 1e-9,
			);
			assert.equal(Run.State.Last.outcome, "rejected");
			assert.ok(Math.abs(First - 0.675) < 1e-9);
		});
		await CheckAsync(Count, "L2: the rejected companions' rate falls and the next note's score drops", async () => {
			await Pre(Run, { agent: AgentOf("learn-b"), messages: [{ source: { kind: "user" } }] });
			const Out = await Post(Run, Emit("learn-b"));
			assert.equal(Out.additionalContexts.length, 1);
			assert.ok(Run.State.Last.companions[0].score < 0.675);
			assert.ok(
				Math.abs(Run.State.Last.companions[0].heuristics.history - (Neutral - RejectPenalty)) <
					1e-9,
			);
		});
	}

	// Group L3: the pickable heuristics.
	{
		rm();
		const Disabled = Make(
			Validate({
				logFile: Ledger,
				enabled: true,
				heuristics: ["scope", "graph", "prior", "history", "accept"],
			}),
		);
		Disabled.Context.workingDirectory = Service(Workspace);
		await CheckAsync(Count, "L3: disabling a heuristic drops it from the enabled list and the score", async () => {
			await Post(Disabled, Emit("learn-c"));
			const Last = Disabled.State.Last;
			assert.equal(Last.enabled.includes("literal"), false);
			assert.equal(Last.weights.literal, 0);
			assert.ok(Math.abs(Last.companions[0].score - 0.55) < 1e-9);
			assert.ok(
				Disabled.Lines.includes(
					"hook-dsh-edit-suggester: decided Version 0.87 2 companions docs/STYLE.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.25,literal=0.00,history=0.15,accept=0.00 store=memory",
				),
			);
		});
		rm();
		const Raised = Make(
			Validate({
				logFile: Ledger,
				enabled: true,
				weights: { scope: 0.35, prior: 0.5, literal: 0.25, history: 0.15 },
			}),
		);
		Raised.Context.workingDirectory = Service(Workspace);
		await CheckAsync(Count, "L3: a raised weight raises the score and the ledger carries the table", async () => {
			await Post(Raised, Emit("learn-d"));
			const Last = Raised.State.Last;
			assert.equal(Last.weights.prior, 0.5);
			assert.ok(Math.abs(Last.companions[0].score - 0.825) < 1e-9);
			assert.ok(
				Raised.Lines.includes(
					"hook-dsh-edit-suggester: decided Version 0.87 2 companions docs/STYLE.md scope=1.00,graph=0.50,prior=0.60,literal=0.50,history=0.33,accept=0.33 weights scope=0.35,graph=0.00,prior=0.50,literal=0.25,history=0.15,accept=0.00 store=memory",
				),
			);
		});
	}

	// Group L4: the store absent - the neutral memory fallback.
	{
		const Run = Setup();
		Run.Context.workingDirectory = Service(Workspace);
		await CheckAsync(Count, "L4: without a store the memory fallback answers the neutral 1/3", async () => {
			assert.equal(Run.State.Learning.Store(), "memory");
			await Post(Run, Emit("learn-e"));
			assert.equal(Run.State.Last.store, "memory");
			assert.ok(Math.abs(Run.State.Last.companions[0].heuristics.history - Neutral) < 1e-9);
			assert.ok(Math.abs(Run.State.Last.companions[0].score - 0.675) < 1e-9);
		});
		await CheckAsync(Count, "L4: the memory fallback keeps the decision record in its ring", async () => {
			assert.equal(Run.State.Learning.Recent().length, 1);
			const Record = Run.State.Learning.Recent()[0];
			assert.equal(Record.family, "Version");
			assert.deepEqual(
				Record.companions.map((Companion: any) => Companion.path),
				["docs/STYLE.md", "docs/CHANGELOG.md"],
			);
		});
	}

	// Group L5: the pattern service store and the reopen.
	{
		const Store = FakeStorage();
		const First = Pattern(Store);
		await First.Flush();
		rm();
		const Run = Make(
			Validate({
				logFile: Ledger,
				enabled: true,
				weights: { scope: 0.35, prior: 0.4, literal: 0.25, history: 0.15 },
			}),
		);
		Run.Context.pattern = First;
		Run.Context.workingDirectory = Service(Workspace);
		await CheckAsync(Count, "L5: the decision record is stored with the weights and the pending outcome", async () => {
			await Post(Run, Emit("learn-f"));
			assert.equal(Run.State.Learning.Store(), "pattern");
			assert.equal(Run.State.Last.store, "pattern");
			const Stored = First.List().filter((Record: any) =>
				Record.id.startsWith("hook-dsh-edit-suggester:decision:"),
			);
			assert.equal(Stored.length, 1);
			assert.deepEqual(Stored[0].targets, ["docs/STYLE.md", "docs/CHANGELOG.md"]);
			assert.equal(Stored[0].arbiter, "pending");
			assert.equal(Stored[0].intent, "Version");
			assert.equal(
				Stored[0].transform[0],
				"weights scope=0.35,graph=0.00,prior=0.40,literal=0.25,history=0.15,accept=0.00",
			);
			assert.equal(
				Stored[0].transform[1],
				"enabled scope,graph,prior,literal,history,accept",
			);
			assert.equal(Stored[0].transform[2], "outcome pending");
			assert.ok(Stored[0].transform[3].startsWith("docs/STYLE.md scope=1.00,graph=0.50"));
		});
		await CheckAsync(Count, "L5: the accept fills the outcome and moves the rate records", async () => {
			await Post(Run, Touch("learn-f"));
			assert.ok(
				Math.abs(
					First.Get("hook-dsh-edit-suggester:companion:docs/CHANGELOG.md").confidence -
						(Neutral + AcceptBonus),
				) < 1e-9,
			);
			const Stored = First.List().filter((Record: any) =>
				Record.id.startsWith("hook-dsh-edit-suggester:decision:"),
			);
			assert.equal(Stored[0].arbiter, "accepted");
			assert.equal(Stored[0].transform[2], "outcome accepted");
		});
		await CheckAsync(Count, "L5: a reopen through the KV store reads the rate back and keeps the weights", async () => {
			await First.Save();
			const Second = Pattern(Store);
			await Second.Flush();
			assert.ok(
				Math.abs(
					Second.Get("hook-dsh-edit-suggester:companion:docs/CHANGELOG.md").confidence -
						(Neutral + AcceptBonus),
				) < 1e-9,
			);
			const Stored = Second.List().filter((Record: any) =>
				Record.id.startsWith("hook-dsh-edit-suggester:decision:"),
			);
			assert.equal(Stored.length, 1);
			assert.equal(Stored[0].arbiter, "accepted");
			assert.equal(
				Stored[0].transform[0],
				"weights scope=0.35,graph=0.00,prior=0.40,literal=0.25,history=0.15,accept=0.00",
			);
			rm();
			const Reopen = Make(
				Validate({
					logFile: Ledger,
					enabled: true,
					weights: { scope: 0.35, prior: 0.4, literal: 0.25, history: 0.15 },
				}),
			);
			Reopen.Context.pattern = Second;
			Reopen.Context.workingDirectory = Service(Workspace);
			const Out = await Post(Reopen, Emit("learn-g"));
			assert.equal(Out.additionalContexts[0].source.summary, "Version 0.87");
			assert.equal(Reopen.State.Last.companions[0].path, "docs/CHANGELOG.md");
			assert.equal(Reopen.State.Last.weights.prior, 0.4);
			assert.ok(
				Math.abs(
					Reopen.State.Last.companions[0].heuristics.history - (Neutral + AcceptBonus),
				) < 1e-9,
			);
		});
	}

	return Finish(Count, "Learning-Loop");
};

// Standalone entry: `node Target/Test/Learning-Loop/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Learning-Loop`);
}
