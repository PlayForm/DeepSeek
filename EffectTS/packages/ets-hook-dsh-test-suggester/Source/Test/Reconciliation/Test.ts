// Source/Test/Reconciliation/Test.ts - THE RECONCILIATION (the completion
// spec's wave 2c re-spec): on a judged call in a package, the package's smoke
// claims are compared with the tree - the folder READMEs' `## Expected
// count`, the folders, the suite files, the aggregate runner's roster, and
// (when the graph is present) its `Test` nodes.
//
// The scenarios, against REAL temp package trees:
//   * a consistent tree logs the clear line ONCE and stays silent (the
//     documented abstention);
//   * a drifting tree emits ONE note naming every drifted file and the
//     expected/actual counts (byte-exact), and the ledger line is byte-exact;
//   * a folder without a README is named; a README count whose Test.ts is
//     gone is named; a suite the runner never runs is named;
//   * the graph-present path names a stale Test node; the graph-absent path
//     of the same tree does not (an unpopulated graph contributes nothing);
//   * the gate: the dedupe holds an unchanged signature, the cooldown
//     suppresses a changed one, and the per-turn cap suppresses the next;
//   * a package with no Source/Test tree is silent; a foreign workspace is
//     silent (the gate runs first);
//   * the reconciliation is READ-ONLY: ZERO ctx.fs operations.
import assert from "node:assert/strict";
import * as FileSystem from "node:fs";
import * as OS from "node:os";
import * as Path from "node:path";
import {
	Call,
	Check,
	CheckAsync,
	Finish,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Setup,
} from "../Harness.js";

/** Write one file under the tree (parents created). */
const Put = (Root: string, Relative: string, Body = "x"): string => {
	const Full = Path.join(Root, Relative);
	FileSystem.mkdirSync(Path.dirname(Full), { recursive: true });
	FileSystem.writeFileSync(Full, Body, "utf8");
	return Full;
};

/** A temp workspace root carrying the pack signature and package.json. */
const Workspace = (Prefix: string): string => {
	const Root = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), Prefix));
	Put(Root, "Documentation/ARCHIVE-STYLE.md");
	Put(Root, "package.json", "{}");
	return Root;
};

/** The optional harness service the probe reads (the real shape: get(session)). */
const Service = (Cwd: string): { get: () => string } => ({ get: () => Cwd });

/** The neutral judged probe: it matches NO pack intent, so only the reconciliation can note. */
const PROBE = { pattern: "zzz" };

/** A README with one declared count. */
const Counted = (Count: number): string => `# Suite\n\n## Expected count\n\n${Count} PASS.\n`;

/** The consistent tree: two counted, suite-bearing, rostered folders. */
const Consistent = (Root: string): void => {
	Put(Root, "Source/Test/Alpha/README.md", Counted(4));
	Put(Root, "Source/Test/Alpha/Test.ts");
	Put(Root, "Source/Test/Beta/README.md", Counted(5));
	Put(Root, "Source/Test/Beta/Test.ts");
	Put(Root, "Target/Test/Alpha/Test.js");
	Put(Root, "Target/Test/Beta/Test.js");
};

/** The drifting tree: a counted-but-suite-less folder, a suite without a README, an unrostered suite. */
const Drifting = (Root: string): void => {
	Put(Root, "Source/Test/Alpha/README.md", Counted(4));
	Put(Root, "Source/Test/Alpha/Test.ts");
	Put(Root, "Target/Test/Alpha/Test.js");
	Put(Root, "Source/Test/Delta/README.md", Counted(7));
	Put(Root, "Source/Test/Gamma/Test.ts");
	Put(Root, "Source/Test/Epsilon/README.md", Counted(3));
	Put(Root, "Source/Test/Epsilon/Test.ts");
};

/** The graph fake: only the `find` facet the probe uses. */
const Graph = (Paths: string[]): { find: () => { path: string }[] } => ({
	find: () => Paths.map((Path_) => ({ path: Path_ })),
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group C1: the consistent tree - silence with the clear line, once.
	{
		const Root = Workspace("test-suggester-clear-");
		Consistent(Root);
		const Package_ = Path.basename(Root);
		const Agent = { agent: { id: "clear-a" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Root);
		const First = await Call(Run, "grep", PROBE, Agent);
		const Second = await Call(Run, "grep", PROBE, Agent);
		Check(Count, "C1: a consistent tree logs the byte-exact clear line exactly once", () => {
			assert.deepEqual(LinesWith(Run, "reconciliation"), [
				`test-suggester: reconciliation clear ${Package_} (9 expected, 9 actual)`,
			]);
			assert.equal(LedgerWith(`reconciliation clear ${Package_} (9 expected, 9 actual)`).length, 1);
		});
		Check(Count, "C1: a consistent tree emits NO note (the documented abstention)", () => {
			assert.equal(First.kind, "allow");
			assert.equal(First.additionalContexts, undefined);
			assert.equal(Second.additionalContexts, undefined);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
		});
	}

	// Group C2: the drifting tree - ONE note naming the drifted files.
	{
		const Root = Workspace("test-suggester-drift-");
		Drifting(Root);
		const Package_ = Path.basename(Root);
		const Agent = { agent: { id: "drift-a" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Root);
		const Result = await Call(Run, "grep", PROBE, Agent);
		Check(Count, "C2: the note names every drifted file and the expected/actual counts", () => {
			assert.equal(Result.additionalContexts.length, 1);
			assert.deepEqual(Result.additionalContexts[0].source, {
				kind: "test-suggester",
				form: "notice",
				summary: "Reconciliation 3 drifts",
			});
			assert.equal(
				Result.additionalContexts[0].content[0].text,
				`[test-suggester] reconciliation package=${Package_} drifts=3 expected=14 actual=4\n` +
					"- Source/Test/Delta/Test.ts - the README count has no Test.ts (expected 7, actual 0)\n" +
					'- Source/Test/Gamma/README.md - no "## Expected count" (expected 0, actual 0)\n' +
					"- Target/Test/Epsilon/Test.js - not in the aggregate runner's roster (expected 3, actual 0)\n" +
					"note: the smoke claims drifted from the tree; fix the README count, the suite file or the roster - Target/ is never edited.",
			);
		});
		Check(Count, "C2: the ledger line is byte-exact (logger and durable ledger)", () => {
			assert.deepEqual(LinesWith(Run, "reconciliation drift"), [
				`test-suggester: reconciliation drift 3 drifts ${Package_} (14 expected, 4 actual) call grep`,
			]);
			assert.equal(
				LedgerWith(`reconciliation drift 3 drifts ${Package_} (14 expected, 4 actual) call grep`).length,
				1,
			);
		});
		Check(Count, "C2: a folder without a README is named", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			assert.ok(Text.includes('- Source/Test/Gamma/README.md - no "## Expected count" (expected 0, actual 0)'));
		});
		Check(Count, "C2: a README count whose Test.ts is gone is named", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			assert.ok(
				Text.includes(
					"- Source/Test/Delta/Test.ts - the README count has no Test.ts (expected 7, actual 0)",
				),
			);
		});
		Check(Count, "C2: a suite the aggregate runner never runs is named", () => {
			const Text = Result.additionalContexts[0].content[0].text;
			assert.ok(
				Text.includes(
					"- Target/Test/Epsilon/Test.js - not in the aggregate runner's roster (expected 3, actual 0)",
				),
			);
		});
		Check(Count, "C2: the note is one frozen labeled notice", () => {
			assert.equal(Object.isFrozen(Result.additionalContexts[0]), true);
		});
	}

	// Group C3: the graph - present names the stale node, absent does not.
	{
		const Root = Workspace("test-suggester-graph-");
		Consistent(Root);
		const Package_ = Path.basename(Root);
		const Agent = { agent: { id: "graph-a" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Root);
		Run.Context.workspaceGraph = Graph([
			Path.join(Root, "Source/Test/Alpha/Test.ts"),
			Path.join(Root, "Source/Test/Zeta/Test.ts"),
		]);
		const Result = await Call(Run, "grep", PROBE, Agent);
		Check(Count, "C3: a graph Test node whose file is gone is named", () => {
			assert.equal(Result.additionalContexts.length, 1);
			const Text = Result.additionalContexts[0].content[0].text;
			assert.ok(
				Text.includes(
					"- Source/Test/Zeta/Test.ts - the graph's Test node has no file (expected 1, actual 0)",
				),
			);
			assert.equal(Text.includes("Source/Test/Alpha/Test.ts - the graph"), false);
		});
		Check(Count, "C3: the graph row is the only drift (the tree itself is consistent)", () => {
			assert.deepEqual(LinesWith(Run, "reconciliation drift"), [
				`test-suggester: reconciliation drift 1 drifts ${Package_} (9 expected, 9 actual) call grep`,
			]);
		});
		const Bare = Workspace("test-suggester-graphless-");
		Consistent(Bare);
		const NoGraph = Setup();
		NoGraph.Context.workingDirectory = Service(Bare);
		await Call(NoGraph, "grep", PROBE, { agent: { id: "graph-b" } });
		Check(Count, "C3: without the graph the same tree stays clear (the graph is optional)", () => {
			assert.deepEqual(LinesWith(NoGraph, "reconciliation"), [
				`test-suggester: reconciliation clear ${Path.basename(Bare)} (9 expected, 9 actual)`,
			]);
			assert.equal(LinesWith(NoGraph, "graph's Test node").length, 0);
		});
		const EmptyGraph = Setup();
		EmptyGraph.Context.workingDirectory = Service(Bare);
		EmptyGraph.Context.workspaceGraph = Graph([]);
		await Call(EmptyGraph, "grep", PROBE, { agent: { id: "graph-c" } });
		Check(Count, "C3: an unpopulated graph contributes no drift", () => {
			assert.deepEqual(LinesWith(EmptyGraph, "reconciliation"), [
				`test-suggester: reconciliation clear ${Path.basename(Bare)} (9 expected, 9 actual)`,
			]);
		});
	}

	// Group C4: the gate - dedupe, cooldown, cap.
	{
		const Root = Workspace("test-suggester-gate-");
		Drifting(Root);
		const Package_ = Path.basename(Root);
		const Agent = { agent: { id: "gate-a" } };
		const Run = Setup();
		Run.Context.workingDirectory = Service(Root);
		await Call(Run, "grep", PROBE, Agent);
		await Call(Run, "grep", PROBE, Agent);
		Check(Count, "C4: an unchanged drift set is held by the dedupe", () => {
			assert.deepEqual(LinesWith(Run, "reconciliation skipped"), [
				`test-suggester: reconciliation skipped deduped ${Package_}`,
			]);
			assert.equal(LinesWith(Run, "reconciliation drift").length, 1);
		});
		Put(Root, "Source/Test/Eta/Test.ts");
		await Call(Run, "grep", PROBE, Agent);
		Check(Count, "C4: a changed drift set inside the cooldown is suppressed", () => {
			assert.deepEqual(LinesWith(Run, "reconciliation skipped cooldown"), [
				`test-suggester: reconciliation skipped cooldown ${Package_}`,
			]);
			assert.equal(LinesWith(Run, "reconciliation drift").length, 1);
		});
		const Capped = Setup({ cooldownCalls: 0, maxNotesPerTurn: 1 });
		Capped.Context.workingDirectory = Service(Root);
		await Call(Capped, "grep", PROBE, Agent);
		Put(Root, "Source/Test/Theta/Test.ts");
		await Call(Capped, "grep", PROBE, Agent);
		Check(Count, "C4: the per-turn cap suppresses the next drift note", () => {
			assert.deepEqual(LinesWith(Capped, "reconciliation skipped cap"), [
				`test-suggester: reconciliation skipped cap ${Package_}`,
			]);
		});
	}

	// Group C5: the silent paths - no smoke tree, a foreign workspace.
	{
		const Bare = Workspace("test-suggester-notree-");
		const Run = Setup();
		Run.Context.workingDirectory = Service(Bare);
		await Call(Run, "grep", PROBE, { agent: { id: "notree-a" } });
		Check(Count, "C5: a package without a Source/Test tree is silent", () => {
			assert.equal(LinesWith(Run, "reconciliation").length, 0);
			assert.equal(LinesWith(Run, "candidates call").length, 0);
		});
		const Foreign = FileSystem.mkdtempSync(Path.join(OS.tmpdir(), "test-suggester-foreign-"));
		Put(Foreign, "Source/Test/Alpha/Test.ts");
		const Gated = Setup();
		Gated.Context.workingDirectory = Service(Foreign);
		const Decision = { kind: "allow" };
		const Out = await Call(Gated, "grep", PROBE, { agent: { id: "foreign-a" } }, Decision);
		Check(Count, "C5: a foreign workspace is gated before the reconciliation runs", () => {
			assert.equal(Out, Decision);
			assert.ok(Gated.Lines.includes("test-suggester: abstained foreign-workspace  0.00"));
			assert.equal(LinesWith(Gated, "reconciliation").length, 0);
		});
	}

	// Group C6: the read-only posture.
	{
		const Root = Workspace("test-suggester-pure-");
		Drifting(Root);
		const Run = Setup();
		Run.Context.workingDirectory = Service(Root);
		await CheckAsync(Count, "C6: the reconciliation performs ZERO ctx.fs operations", async () => {
			await Call(Run, "grep", PROBE, { agent: { id: "pure-a" } });
			assert.equal(Run.Fs.reads.length, 0);
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.resolved.length, 0);
			assert.equal(Run.Fs.stats.length, 0);
			assert.equal(LinesWith(Run, "reconciliation drift").length, 1);
		});
		Check(Count, "C6: the tree is untouched after the note (read-only, never a write)", () => {
			assert.equal(FileSystem.existsSync(Path.join(Root, "Source/Test/Gamma/README.md")), false);
			assert.equal(FileSystem.existsSync(Path.join(Root, "Source/Test/Delta/Test.ts")), false);
		});
	}

	return Finish(Count, "Reconciliation");
};

// Standalone entry: `node Target/Test/Reconciliation/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Reconciliation`);
}
